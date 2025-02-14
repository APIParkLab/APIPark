import { LoadingOutlined } from '@ant-design/icons'
import WithPermission from '@common/components/aoplatform/WithPermission.tsx'
import {
  BasicResponse,
  DELETE_TIPS,
  PLACEHOLDER,
  RESPONSE_TIPS,
  STATUS_CODE
} from '@common/const/const.tsx'
import { EntityItem, MemberItem, SimpleTeamItem } from '@common/const/type.ts'
import { useBreadcrumb } from '@common/contexts/BreadcrumbContext.tsx'
import { useGlobalContext } from '@common/contexts/GlobalStateContext.tsx'
import { useFetch } from '@common/hooks/http.ts'
import { $t } from '@common/locales/index.ts'
import { getImgBase64 } from '@common/utils/dataTransfer.ts'
import { normFile } from '@common/utils/uploadPic.ts'
import { validateUrlSlash } from '@common/utils/validate.ts'
import { RouterParams } from '@core/components/aoplatform/RenderRoutes.tsx'
import { AiServiceConfigFieldType } from '@core/const/ai-service/type.ts'
import { SERVICE_APPROVAL_OPTIONS } from '@core/const/system/const.tsx'
import { Icon } from '@iconify/react/dist/iconify.js'
import { CategorizesType } from '@market/const/serviceHub/type.ts'
import { App, Button, Form, Input, Radio, Row, Select, TreeSelect, Upload } from 'antd'
import { DefaultOptionType } from 'antd/es/cascader'
import { RcFile, UploadChangeParam, UploadFile, UploadProps } from 'antd/es/upload/interface'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { SystemConfigFieldType, SystemConfigHandle } from '../../const/system/type.ts'
import { useSystemContext } from '../../contexts/SystemContext.tsx'

export type SimpleAiProviderItem = EntityItem & {
  configured: boolean
  logo: string
}

const SystemConfig = forwardRef<SystemConfigHandle>((_, ref) => {
  const { message, modal } = App.useApp()
  const { teamId, serviceId } = useParams<RouterParams>()
  const [onEdit, setOnEdit] = useState<boolean>(!!teamId)
  const [form] = Form.useForm()
  const { fetchData } = useFetch()
  const [teamOptionList, setTeamOptionList] = useState<DefaultOptionType[]>()
  const navigate = useNavigate()
  const { setBreadcrumb } = useBreadcrumb()
  const { setSystemInfo } = useSystemContext()
  const [showClassify, setShowClassify] = useState<boolean>(true)
  const [showAI, setShowAI] = useState<boolean>(false)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [tagOptionList, setTagOptionList] = useState<DefaultOptionType[]>([])
  const [serviceClassifyOptionList, setServiceClassifyOptionList] = useState<DefaultOptionType[]>()
  const [uploadLoading, setUploadLoading] = useState<boolean>(false)
  const {
    checkPermission,
    accessInit,
    getGlobalAccessData,
    state,
    aiConfigFlushed,
    setAiConfigFlushed
  } = useGlobalContext()
  const [providerOptionList, setProviderOptionList] = useState<DefaultOptionType[]>()
  const location = useLocation()
  const currentUrl = location.pathname

  useImperativeHandle(ref, () => ({
    save: onFinish
  }))

  useEffect(() => {
    if (currentUrl.indexOf('aiInside') !== -1) {
      setShowAI(true)
    }
  }, [currentUrl])

  const getProviderOptionList = () => {
    setProviderOptionList([])
    fetchData<BasicResponse<{ providers: SimpleAiProviderItem[] }>>('simple/ai/providers/configured', {
      method: 'GET',
      eoTransformKeys: [],
      eoParams: { all: true}
    }).then(response => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        const configuredProvider = data.providers
          ?.filter(x => x.configured)
          ?.map((x: SimpleAiProviderItem) => {
            return { ...x, label: x.name, value: x.id }
          })
        setProviderOptionList(configuredProvider)
        if (!serviceId && configuredProvider.length > 0) {
          form.setFieldsValue({ provider: configuredProvider[0]?.id })
        }
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const beforeUpload = async (file: RcFile) => {
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      alert($t('只允许上传PNG、JPG或SVG格式的图片'))
      return false
    }

    //   if (file.size > MAX_SIZE) {
    //     try {
    //       const compressedBase64 = await compressImage(file, MAX_SIZE);
    //       setImageBase64(`data:${file.type};base64,${compressedBase64}`);
    //       form.setFieldValue('logo', `data:${file.type};base64,${compressedBase64}`);
    //     } catch (error) {
    //       console.error('压缩图片时出错', error);
    //     }
    //   } else {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      setImageBase64(e.target?.result as string)
      form.setFieldValue('logo', e.target?.result)
    }
    reader.readAsDataURL(file)
    //   }
    return false
  }

  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setUploadLoading(true)
      return
    }
    if (info.file.status === 'done') {
      getImgBase64(info.file.originFileObj as RcFile, () => {
        setUploadLoading(false)
      })
    }
    if (info.fileList.length === 0) {
      form.setFieldValue('logo', null)
    }
  }

  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <Icon icon="ic:baseline-add" width="24" height="24" />}
    </div>
  )

  const getTagAndServiceClassifyList = () => {
    setTagOptionList([])
    setServiceClassifyOptionList([])
    fetchData<BasicResponse<{ catalogues: CategorizesType[]; tags: EntityItem[] }>>('catalogues', {
      method: 'GET'
    }).then(response => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setTagOptionList(
          data.tags?.map((x: EntityItem) => {
            return {
              label: x.name,
              value: x.name
            }
          }) || []
        )
        setServiceClassifyOptionList(data.catalogues)

        if (form.getFieldValue('catalogue') === undefined && data.catalogues.length) {
          form.setFieldValue('catalogue', data.catalogues[0].id)
        }
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  // 获取表单默认值
  const getSystemInfo = () => {
    fetchData<BasicResponse<{ service: SystemConfigFieldType }>>('service/info', {
      method: 'GET',
      eoParams: { team: teamId, service: serviceId },
      eoTransformKeys: ['team_id', 'service_type', 'approval_type', 'service_kind']
    }).then(response => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setTimeout(() => {
          form.setFieldsValue({
            ...data.service,
            team: data.service.team.id,
            catalogue: data.service.catalogue?.id,
            tags: data.service.tags?.map((x: EntityItem) => x.name),
            provider: data.service.provider?.id,
            logoFile: [
              {
                uid: '-1', // 文件唯一标识
                name: 'image.png', // 文件名
                status: 'done', // 状态有：uploading, done, error, removed
                url: data.service?.logo || '' // 图片 Base64 数据
              }
            ]
          })
          setImageBase64(data.service.logo)
          setShowClassify(data.service.serviceType === 'public')
        }, 0)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const onFinish: () => Promise<boolean | string> = () => {
    return form.validateFields().then(value => {
      return fetchData<BasicResponse<{ service: { id: string } }>>(
        serviceId === undefined ? 'team/service' : 'service/info',
        {
          method: serviceId === undefined ? 'POST' : 'PUT',
          eoParams: {
            ...(serviceId === undefined
              ? { team: value.team }
              : { service: serviceId, team: teamId })
          },
          eoBody: { ...value, prefix: value.prefix?.trim() },
          eoTransformKeys: ['serviceType', 'approvalType', 'serviceKind']
        }
      )
        .then(response => {
          const { code, data, msg } = response
          if (code === STATUS_CODE.SUCCESS) {
            message.success(msg || $t(RESPONSE_TIPS.success))
            setSystemInfo(data.service)
            return Promise.resolve(true)
          } else {
            message.error(msg || $t(RESPONSE_TIPS.error))
            return Promise.reject(msg || $t(RESPONSE_TIPS.error))
          }
        })
        .catch(errorInfo => {
          return Promise.reject(errorInfo)
        })
    })
  }

  const getTeamOptionList = () => {
    setTeamOptionList([])

    fetchData<BasicResponse<{ teams: SimpleTeamItem[] }>>(
      !checkPermission('system.workspace.team.view_all') ? 'simple/teams/mine' : 'simple/teams',
      { method: 'GET', eoTransformKeys: [] }
    ).then(response => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setTeamOptionList(
          data.teams?.map((x: MemberItem) => {
            return { ...x, label: x.name, value: x.id }
          })
        )
        if (form.getFieldValue('team') === undefined && data.teams?.length) {
          form.setFieldValue('team', data.teams[0].id)
        }
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const deleteSystem = () => {
    fetchData<BasicResponse<null>>('team/service', {
      method: 'DELETE',
      eoParams: { team: teamId, service: serviceId }
    }).then(response => {
      const { code, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        message.success(msg || $t(RESPONSE_TIPS.success))
        navigate(`/service/list`)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  useEffect(() => {
    aiConfigFlushed && getProviderOptionList()
  }, [aiConfigFlushed])

  useEffect(() => {
    if (accessInit) {
      getTeamOptionList()
    } else {
      getGlobalAccessData()?.then?.(() => {
        getTeamOptionList()
      })
    }
    getProviderOptionList()
    getTagAndServiceClassifyList()
    if (serviceId !== undefined) {
      setOnEdit(true)
      getSystemInfo()
      setBreadcrumb([
        {
          title: <Link to={`/service/list`}>{$t('服务')}</Link>
        },
        {
          title: $t('设置')
        }
      ])
    } else {
      setOnEdit(false)
      const id = uuidv4()
      form.setFieldValue('id', id)
      form.setFieldValue('serviceKind', 'ai')
      setShowAI(true)
      form.setFieldValue('prefix', `${id.split('-')[0]}/`)
      form.setFieldValue('team', teamId)
      form.setFieldValue('serviceType', 'public')
      form.setFieldValue('approvalType', 'auto')
    }
    return form.setFieldsValue({})
  }, [serviceId])

  const deleteSystemModal = async () => {
    modal.confirm({
      title: $t('删除'),
      content: $t(DELETE_TIPS.default),
      onOk: () => {
        return deleteSystem()
      },
      width: 600,
      okText: $t('确认'),
      okButtonProps: {
        danger: true
      },
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  // const serviceTypeOptions =  useMemo(()=>SERVICE_KIND_OPTIONS.map((x)=>({...x, label:$t(x.label)})),[state.language]);
  // const visualizationOptions = useMemo(()=>SERVICE_VISUALIZATION_OPTIONS.map((x)=>({...x, label:$t(x.label)})),[state.language])
  const approvalOptions = useMemo(
    () => SERVICE_APPROVAL_OPTIONS.map(x => ({ ...x, label: $t(x.label) })),
    [state.language]
  )

  return (
    <>
      <WithPermission access={onEdit ? ['team.service.service.edit'] : ''}>
        <Form
          layout="vertical"
          labelAlign="left"
          scrollToFirstError
          form={form}
          className="w-full pr-PAGE_INSIDE_X"
          name="systemConfig"
          onFinish={onFinish}
          autoComplete="off"
        >
          <div>
            <Form.Item<SystemConfigFieldType>
              label={$t('服务名称')}
              name="name"
              rules={[{ required: true, whitespace: true }]}
            >
              <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
            </Form.Item>

            <Form.Item<SystemConfigFieldType>
              label={$t('服务 ID')}
              name="id"
              rules={[{ required: true, whitespace: true }]}
            >
              <Input
                className="w-INPUT_NORMAL"
                disabled={onEdit}
                placeholder={$t(PLACEHOLDER.input)}
              />
            </Form.Item>
            {!onEdit && (
              <Form.Item<SystemConfigFieldType>
                label={$t('服务类型')}
                name="serviceKind"
                rules={[{ required: true }]}
              >
                <Radio.Group
                  disabled={onEdit}
                  onChange={e => {
                    setShowAI(e.target.value === 'ai')
                  }}
                >
                  <Radio.Button className="w-[180px] h-[100px] mr-btnbase" value="ai">
                    <div className="flex flex-col justify-center items-center w-full h-full text-black">
                      <Icon icon="icon-park-outline:robot-one" height={50} width={50} />
                      <span>{$t('AI 服务')}</span>
                    </div>
                  </Radio.Button>
                  <Radio.Button className="w-[180px] h-[100px]" value="rest">
                    <div className="flex flex-col justify-center items-center w-full h-full text-black">
                      <Icon icon="bx:server" height={50} width={50} />
                      <span>{$t('REST 服务')}</span>
                    </div>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            )}
            {showAI && (
              <Form.Item<AiServiceConfigFieldType>
                label={$t('默认 AI 供应商')}
                name="provider"
                rules={[{ required: true }]}
                extra={
                  serviceId
                    ? $t('创建 API 时会默认选择该供应商，修改默认供应商不会影响现有 API')
                    : ''
                }
              >
                {providerOptionList && providerOptionList.length > 0 ? (
                  <Select
                    className="w-INPUT_NORMAL"
                    placeholder={$t(PLACEHOLDER.input)}
                    options={providerOptionList}
                  ></Select>
                ) : (
                  <p>
                    {$t('未配置任何 AI 模型供应商，')}
                    <a href="/aisetting" target="_blank" onClick={() => setAiConfigFlushed(false)}>
                      {$t('立即配置')}
                    </a>
                  </p>
                )}
              </Form.Item>
            )}

            <Form.Item<SystemConfigFieldType>
              label={$t('API 调用前缀')}
              name="prefix"
              extra={$t(
                '作为服务内所有API的前缀，比如host/{service_name}/{api_path}，影响较大，谨慎修改'
              )}
              rules={[
                { required: true, whitespace: true },
                {
                  validator: validateUrlSlash
                }
              ]}
            >
              <Input
                prefix={onEdit ? '' : '/'}
                className="w-INPUT_NORMAL"
                placeholder={$t(PLACEHOLDER.input)}
              />
            </Form.Item>
            {!onEdit && (
              <Form.Item<SystemConfigFieldType>
                label={$t('所属团队')}
                name="team"
                rules={[{ required: true }]}
              >
                <Select
                  className="w-INPUT_NORMAL"
                  disabled={onEdit}
                  placeholder={$t(PLACEHOLDER.input)}
                  options={teamOptionList}
                ></Select>
              </Form.Item>
            )}

            <Form.Item<SystemConfigFieldType>
              label={$t('订阅审核')}
              name="approvalType"
              rules={[{ required: true }]}
            >
              <Radio.Group className="flex flex-col" options={approvalOptions} />
            </Form.Item>

            {/* <Form.Item<SystemConfigFieldType>
                            label={$t("服务类型")}
                            name="serviceType"
                            rules={[{required: true}]}
                        >
                            <Radio.Group className="flex flex-col" options={visualizationOptions} onChange={(e)=>{setShowClassify(e.target.value === 'public')}} />
                        </Form.Item> */}

            {showClassify && (
              <Form.Item<SystemConfigFieldType>
                label={$t('所属服务分类')}
                name="catalogue"
                extra={$t('设置服务展示在服务市场中的哪个分类下')}
                rules={[{ required: true }]}
              >
                <TreeSelect
                  className="w-INPUT_NORMAL"
                  fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                  showSearch
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder={$t(PLACEHOLDER.select)}
                  allowClear
                  treeDefaultExpandAll
                  treeData={serviceClassifyOptionList}
                />
              </Form.Item>
            )}

            <Form.Item<SystemConfigFieldType>
              label={$t('图标')}
              name="logoFile"
              extra={$t('仅支持 .png .jpg .jpeg .svg 格式的图片文件, 大于 1KB 的文件将被压缩')}
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                listType="picture"
                beforeUpload={beforeUpload}
                onChange={handleChange}
                showUploadList={false}
                maxCount={1}
                accept=".png, .jpg, .jpeg, .svg"
              >
                <div
                  className="h-[68px] w-[68px] border-[1px] border-dashed border-BORDER flex items-center justify-center rounded bg-bar-theme cursor-pointer"
                  style={{ marginTop: 8 }}
                >
                  {imageBase64 ? (
                    <img
                      src={imageBase64}
                      alt="Logo"
                      style={{ maxWidth: '200px', width: '68px', height: '68px' }}
                    />
                  ) : (
                    uploadButton
                  )}
                </div>
              </Upload>
            </Form.Item>

            <Form.Item<SystemConfigFieldType> label={$t('描述')} name="description">
              <Input.TextArea className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
            </Form.Item>

            <Form.Item<SystemConfigFieldType> label={$t('Logo')} name="logo" hidden></Form.Item>

            <Form.Item<SystemConfigFieldType> label={$t('标签')} name="tags">
              <Select
                className="w-INPUT_NORMAL"
                mode="tags"
                placeholder={$t(PLACEHOLDER.select)}
                options={tagOptionList}
              ></Select>
            </Form.Item>

            {onEdit && (
              <>
                <Row
                  className="mb-[10px]"
                  // wrapperCol={{ offset: 5, span: 19 }}
                >
                  <WithPermission access={onEdit ? ['team.service.service.edit'] : ''}>
                    <Button type="primary" htmlType="submit">
                      {$t('保存')}
                    </Button>
                  </WithPermission>
                </Row>
              </>
            )}
          </div>
          {onEdit && (
            <>
              <WithPermission access={['team.service.service.delete']} showDisabled={false}>
                <div className="bg-[rgb(255_120_117_/_5%)] rounded-[10px] mt-[50px] p-btnrbase pb-0">
                  <p className="text-left">
                    <span className="font-bold">{$t('删除服务')}：</span>
                    {$t('删除操作不可恢复，请谨慎操作！')}
                  </p>
                  <div className="text-left">
                    <WithPermission access={['team.service.service.delete']}>
                      <Button
                        className="m-auto mt-[16px] mb-[20px]"
                        type="default"
                        danger={true}
                        onClick={deleteSystemModal}
                      >
                        {$t('删除服务')}
                      </Button>
                    </WithPermission>
                  </div>
                </div>
              </WithPermission>
            </>
          )}
        </Form>
      </WithPermission>
    </>
  )
})
export default SystemConfig
