import restAPIPic from '@common/assets/restAPI.svg'
import onlineAIPic from '@common/assets/onlineAI.svg'
import localAIPic from '@common/assets/localAI.svg'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { $t } from '@common/locales'
import { Icon } from '@iconify/react/dist/iconify.js'
import { App, Upload, UploadProps, Form, message, Select } from 'antd'
import { Card } from 'antd'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WithPermission from '@common/components/aoplatform/WithPermission'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { LocalModelItem, MemberItem, SimpleTeamItem } from '@common/const/type'
import AiSettingModalContent, { AiSettingModalContentHandle } from '../aiSetting/AiSettingModal'
import { checkAccess } from '@common/utils/permission'
const { Dragger } = Upload
export const AIModelGuide = () => {
  const { modal } = App.useApp()
  const [, forceUpdate] = useState<unknown>(null)
  const [form] = Form.useForm()
  const entityData = useRef<any>(null)
  const { fetchData } = useFetch()
  const navigateTo = useNavigate()
  const { checkPermission, accessData } = useGlobalContext()
  const modalRef = useRef<AiSettingModalContentHandle>()

  /**
   * 获取 team 选项列表
   * @returns
   */
  const getTeamOptionList = async (): any[] => {
    const response = await fetchData<BasicResponse<{ teams: SimpleTeamItem[] }>>(
      !checkPermission('system.workspace.team.view_all') ? 'simple/teams/mine' : 'simple/teams',
      { method: 'GET', eoTransformKeys: [] }
    )
    const { code, data, msg } = response
    if (code === STATUS_CODE.SUCCESS) {
      const teamOptionList = data.teams?.map((x: MemberItem) => {
        return { ...x, label: x.name, value: x.id }
      })
      if (form.getFieldValue('team') === undefined && data.teams?.length) {
        form.setFieldValue('team', data.teams[0].id)
      }
      return teamOptionList
    } else {
      message.error(msg || $t(RESPONSE_TIPS.error))
      return []
    }
  }

  /**
   * 部署 rest 服务
   * @param file
   * @returns
   */
  const deployRestServer = async (file: File) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', file.type)
      formData.append('team', form.getFieldValue('team'))
      fetchData<BasicResponse<{ teams: SimpleTeamItem[] }>>('quick/service/rest', {
        method: 'POST',
        body: formData
      }).then((response) => {
        const { code, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          message.success(msg || $t(RESPONSE_TIPS.success))
          resolve(true)
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
          reject(false)
        }
      })
    })
  }

  const deployPopularModel = async (id: string, modalInstance: any) => {
    await deployLocalModel({
      modelID: id,
      team: form.getFieldValue('team')
    })
    modalInstance.destroy()
    navigateTo(`/service/list`)
  }

  /**
   * 部署本地模型
   * @param value 
   * @returns 
   */
  const deployLocalModel = (value: { modelID: string; team?: number }) => {
    return new Promise((resolve, reject) => {
      fetchData<BasicResponse<null>>('model/local/deploy/start', {
        method: 'POST',
        eoBody: {
          model: value.modelID,
          team: value?.team
        }
      })
        .then((response) => {
          const { code, msg } = response
          if (code === STATUS_CODE.SUCCESS) {
            message.success(msg || $t(RESPONSE_TIPS.success))
            resolve(true)
          } else {
            message.error(msg || $t(RESPONSE_TIPS.error))
            reject(false)
          }
        })
        .catch((errorInfo) => reject(errorInfo))
    })
  }

  /**
   * 获取本地模型列表
   * @returns 本地模型列表
   */
  const getLocalModelList = async (): any[] => {
    const response = await fetchData<BasicResponse<{ models: LocalModelItem[] }>>(
      'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/model/local/can_deploy',
      // 'model/local/can_deploy'
      { method: 'GET', custom: true, eoTransformKeys: ['is_popular'] }
    )
    // TODO_数据模拟
    if (response.ok) {
      const datas = await response.json()
      const { code, data, msg } = datas
      if (code === STATUS_CODE.SUCCESS) {
        const modelList = data.models?.map((x: LocalModelItem) => {
          return { ...x, label: x.name, value: x.id }
        })
        return modelList
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
        return []
      }
    } else {
      console.error('HTTP error', response.status)
    }
    // const { code, data, msg } = response
    // if (code === STATUS_CODE.SUCCESS) {
    //   const modelList = data.models?.map((x: LocalModelItem) => {
    //     return { ...x, label: x.name, value: x.id }
    //   })
    //   console.log('modelList===', modelList);

    //   return modelList
    // } else {
    //   message.error(msg || $t(RESPONSE_TIPS.error))
    //   return []
    // }
  }

  /**
   * rest 服务卡片点击事件
   */
  const restCardClick = async () => {
    form.resetFields()
    const teamList = await getTeamOptionList()
    const props: UploadProps = {
      name: 'file',
      multiple: false,
      maxCount: 1,
      beforeUpload: (file) => {
        form.setFieldsValue({ key: file })
        forceUpdate({})
        return false
      }
    }

    modal.confirm({
      title: $t('添加 Rest 服务'),
      content: (
        <WithPermission access="">
          <Form
            layout="vertical"
            labelAlign="left"
            scrollToFirstError
            form={form}
            className="mx-auto "
            name="partitionInsideCert"
            autoComplete="off"
          >
            <Form.Item
              name="key"
              className="mb-0 bg-transparent p-0 border-none rounded-none"
              rules={[{ required: true }]}
            >
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <Icon className="text-[#ccc]" icon="tdesign:upload" width="50" height="50" />
                </p>
                <p className="ant-upload-text">{$t('选择 OpenAPI 文件 (.json / .yaml)')}</p>
              </Dragger>
            </Form.Item>
            <Form.Item label={$t('所属团队')} name="team" className="mt-[16px]" rules={[{ required: true }]}>
              <Select
                className="w-INPUT_NORMAL"
                placeholder={$t(PLACEHOLDER.input)}
                options={teamList}
                onChange={(value) => {
                  form.setFieldValue('team', value)
                }}
              ></Select>
            </Form.Item>
          </Form>
        </WithPermission>
      ),
      onOk: () => {
        return new Promise((resolve, reject) => {
          form
            .validateFields()
            .then(async (value) => {
              await deployRestServer(value.key.file)
              resolve(true)
              navigateTo(`/service/list`)
            })
            .catch((errorInfo) => reject(errorInfo))
        })
      },
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  /**
   * AI 模型配置弹窗
   */
  const aiCardClick = () => {
    // 更新弹窗
    const updateEntityData = (data: any) => {
      entityData.current = data
      // 更新弹窗
      modalInstance.update({})
    }
    const modalInstance = modal.confirm({
      title: $t('模型配置'),
      content: (
        <AiSettingModalContent
          ref={modalRef}
          modelMode="manual"
          updateEntityData={updateEntityData}
          readOnly={!checkAccess('system.devops.ai_provider.edit', accessData)}
        />
      ),
      onOk: () => {
        return modalRef.current?.deployAIServer().then((res) => {
          if (res === true) {
            navigateTo(`/service/list`)
          }
        })
      },
      width: 600,
      okText: $t('确认'),
      footer: (_, { OkBtn, CancelBtn }) => {
        return (
          <div className="flex justify-between items-center">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={entityData.current?.getApikeyUrl}
              className="flex items-center gap-[8px]"
            >
              <span>{$t('从 (0) 获取 API KEY', [entityData.current?.name])}</span>
              <Icon icon="ic:baseline-open-in-new" width={16} height={16} />
            </a>
            <div>
              <CancelBtn />
              {checkAccess('system.devops.ai_provider.edit', accessData) ? <OkBtn /> : null}
            </div>
          </div>
        )
      },
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  /**
   * 本地部署 AI 并生成 API
   */
  const localModelCardClick = async () => {
    form.resetFields()
    const teamList = await getTeamOptionList()
    const modelList = await getLocalModelList()
    const modalInstance = modal.confirm({
      title: $t('部署 AI 模型'),
      content: (
        <WithPermission access="">
          <Form
            layout="vertical"
            labelAlign="left"
            scrollToFirstError
            form={form}
            className="mx-auto "
            name="partitionInsideCert"
            autoComplete="off"
          >
            <Form.Item label={$t('模型名称')} name="modelID" rules={[{ required: true }]}>
              <Select
                showSearch
                className="w-INPUT_NORMAL"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                placeholder={$t(PLACEHOLDER.input)}
                options={modelList}
                onChange={(value) => {
                  form.setFieldValue('modelID', value)
                }}
              ></Select>
              <div className="mt-[10px] mb-[5px]">
                <Icon className="align-text-top" icon="noto-v1:fire" width="17" height="17" />
                {$t('热点模型')}
              </div>
              <div className="pl-[5px] flex flex-wrap">
                {modelList.length &&
                  modelList
                    .filter((item) => item.is_popular)
                    .map((item) => (
                      <span
                        key={item.id}
                        className="text-[#2196f3] text-[15px] hover:text-[#1976d2] mr-[20px] cursor-pointer
  "
                        onClick={() => {
                          deployPopularModel(item.id, modalInstance)
                        }}
                      >
                        {item.name}
                      </span>
                    ))}
              </div>
            </Form.Item>
            <Form.Item label={$t('所属团队')} name="team" className="mt-[16px]" rules={[{ required: true }]}>
              <Select
                className="w-INPUT_NORMAL"
                placeholder={$t(PLACEHOLDER.input)}
                options={teamList}
                onChange={(value) => {
                  form.setFieldValue('team', value)
                }}
              ></Select>
            </Form.Item>
          </Form>
        </WithPermission>
      ),
      onOk: () => {
        return new Promise((resolve, reject) => {
          form
            .validateFields()
            .then(async (value) => {
              await deployLocalModel(value)
              resolve(true)
              navigateTo(`/service/list`)
            })
            .catch((errorInfo) => reject(errorInfo))
        })
      },
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }
  const deployDeepSeek = (e: any) => {
    e.stopPropagation()
    deployLocalModel({
      modelID: 'deepseek-r1'
    })
  }

  const cardList = [
    {
      imgSrc: restAPIPic,
      title: $t('添加 Rest 服务'),
      description: $t('支持批量添加现有 API 文档以实现统一的外部访问。'),
      click: restCardClick
    },
    {
      imgSrc: onlineAIPic,
      title: $t('添加在线 AI API'),
      description: $t('快速调用 AI 模型的云服务 API，方便管理提示词和统一计费。'),
      click: aiCardClick
    },
    {
      imgSrc: localAIPic,
      title: $t('本地部署 AI 并生成 API'),
      description: $t('快速在本地部署开源模型并自动生成 API。'),
      click: localModelCardClick,
      bottomRender: (
        <span className="text-[#2196f3] text-[13px] hover:text-[#1976d2]" onClick={deployDeepSeek}>
          <Icon className="align-sub mr-[5px]" icon="lsicon:lightning-filled" width="15" height="15" />
          {$t('部署')} Deepseek-R1
        </span>
      )
    }
  ]
  return (
    <div className="mb-[20px] flex justify-center">
      {cardList.map((item, itemIndex) => (
        <Card
          key={itemIndex}
          className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] bg-[linear-gradient(153.41deg,rgba(244,245,255,1)_0.23%,rgba(255,255,255,1)_83.32%)] mr-[30px] rounded-[10px] overflow-visible cursor-pointer w-[250px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]"
          classNames={{
            header: 'border-b-[0px] p-[20px] pb-[10px] text-[14px] font-normal',
            body: 'p-[20px] pt-[50px] pb-[50px] text-[12px] text-[#666] text-center'
          }}
          onClick={item.click}
        >
          <img src={item.imgSrc} alt="" width={60} height={60} />
          <p className="text-[13px] font-bold text-black mt-[10px] mb-[10px]">{item.title}</p>
          <p className="break-words mb-[10px]">{item.description}</p>
          {item.bottomRender ? item.bottomRender : null}
        </Card>
      ))}
    </div>
  )
}
