import WithPermission from '@common/components/aoplatform/WithPermission'
import { BasicResponse, DELETE_TIPS, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { MemberItem, SimpleTeamItem } from '@common/const/type'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { useTenantManagementContext } from '@market/contexts/TenantManagementContext'
import { App, Button, Form, Input, Row } from 'antd'
import Select, { DefaultOptionType } from 'antd/es/select'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

export type ManagementConfigFieldType = {
  name: string
  description: string
  id?: string
  team?: string
  asApp?: boolean
}

type ManagementConfigProps = {
  type: 'add' | 'edit'
  teamId: string
  appId?: string
  dataShowType?: 'block' | 'list'
}

export type ManagementConfigHandle = {
  save: () => Promise<boolean | string>
}

const ManagementConfig = forwardRef<ManagementConfigHandle, ManagementConfigProps>((props, ref) => {
  const { message, modal } = App.useApp()
  const { type, teamId, appId, dataShowType } = props
  const [form] = Form.useForm()
  const { fetchData } = useFetch()
  const [delBtnLoading, setDelBtnLoading] = useState<boolean>(false)
  const { setAppName } = type === 'edit' ? useTenantManagementContext() : { setAppName: () => {} }
  const navigate = type === 'edit' ? useNavigate() : () => {}
  const [teamOptionList, setTeamOptionList] = useState<DefaultOptionType[]>()
  const { checkPermission, accessInit, getGlobalAccessData } = useGlobalContext()
  const save: () => Promise<boolean | string> = () => {
    return new Promise((resolve, reject) => {
      form
        .validateFields()
        .then((value) => {
          fetchData<BasicResponse<{ apps: ManagementConfigFieldType }>>(type === 'add' ? 'team/app' : 'app/info', {
            method: type === 'add' ? 'POST' : 'PUT',
            eoBody: value,
            eoParams:
              type === 'add' ? { team: dataShowType === 'list' ? value.team : teamId } : { app: appId, team: teamId }
          })
            .then((response) => {
              const { code, data, msg } = response
              if (code === STATUS_CODE.SUCCESS) {
                message.success(msg || $t(RESPONSE_TIPS.success))
                form.setFieldsValue(data.apps)
                type === 'edit' && setAppName(data.apps.name)
                resolve(true)
              } else {
                message.error(msg || $t(RESPONSE_TIPS.error))
                reject(msg || $t(RESPONSE_TIPS.error))
              }
            })
            .catch((errorInfo) => reject(errorInfo))
        })
        .catch((errorInfo) => reject(errorInfo))
    })
  }

  // 获取表单默认值
  const getApplicationInfo = () => {
    fetchData<BasicResponse<{ app: ManagementConfigFieldType }>>('app/info', {
      method: 'GET',
      eoParams: { app: appId, team: teamId },
      eoTransformKeys: ['as_app']
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setAppName(data.app.name)
        setTimeout(() => {
          form.setFieldsValue({ ...data.app })
        }, 0)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const getTeamOptionList = () => {
    setTeamOptionList([])

    fetchData<BasicResponse<{ teams: SimpleTeamItem[] }>>(
      !checkPermission('system.workspace.team.view_all') ? 'simple/teams/mine' : 'simple/teams',
      { method: 'GET', eoTransformKeys: [] }
    ).then((response) => {
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

  const deleteApplicationModal = async () => {
    setDelBtnLoading(true)
    modal.confirm({
      title: $t('删除'),
      content: $t(DELETE_TIPS.default),
      onOk: () => {
        return deleteApplication()
      },
      width: 600,
      okText: $t('确认'),
      okButtonProps: {
        danger: true
      },
      onCancel: () => {
        setDelBtnLoading(false)
      },
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  const deleteApplication = () => {
    fetchData<BasicResponse<null>>('app', {
      method: 'DELETE',
      eoParams: { app: appId, team: teamId }
    }).then((response) => {
      const { code, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        message.success(msg || $t(RESPONSE_TIPS.success))
        navigate(`/consumer/list`)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  useImperativeHandle(ref, () => ({
    save
  }))

  useEffect(() => {
    if (type === 'edit') {
      appId && getApplicationInfo()
    } else {
      form.setFieldsValue({
        id: uuidv4()
      })
    }
    if (type !== 'edit' && dataShowType === 'list') {
      if (accessInit) {
        getTeamOptionList()
      } else {
        getGlobalAccessData()?.then?.(() => {
          getTeamOptionList()
        })
      }
    }
  }, [appId])

  return (
    <>
      <WithPermission
        access={type === 'edit' ? 'team.application.application.edit' : 'team.application.application.add'}
      >
        <Form
          layout="vertical"
          scrollToFirstError
          labelAlign="left"
          form={form}
          className="mx-auto w-full pb-[20px]"
          name="managementConfig"
          autoComplete="off"
          onFinish={save}
        >
          <div>
            <Form.Item<ManagementConfigFieldType>
              label={$t('消费者名称')}
              name="name"
              rules={[{ required: true, whitespace: true }]}
            >
              <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
            </Form.Item>
            <Form.Item<ManagementConfigFieldType>
              label={$t('消费者 ID')}
              name="id"
              rules={[{ required: true, whitespace: true }]}
            >
              <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} disabled={type === 'edit'} />
            </Form.Item>
            {dataShowType === 'list' && (
              <Form.Item<ManagementConfigFieldType> label={$t('所属团队')} name="team" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  className="w-INPUT_NORMAL"
                  disabled={type === 'edit'}
                  placeholder={$t(PLACEHOLDER.input)}
                  options={teamOptionList}
                ></Select>
              </Form.Item>
            )}
            <Form.Item label={$t('描述')} name="description">
              <Input.TextArea className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
            </Form.Item>
            {type === 'edit' && (
              <>
                <Row className="mb-[10px]">
                  <WithPermission
                    access={type === 'edit' ? 'team.application.application.edit' : 'team.application.application.add'}
                  >
                    <Button type="primary" htmlType="submit">
                      {$t('保存')}
                    </Button>
                  </WithPermission>
                </Row>{' '}
              </>
            )}{' '}
          </div>

          {type === 'edit' && (
            <>
              <WithPermission access="team.application.application.delete" showDisabled={false}>
                <div className="bg-[rgb(255_120_117_/_5%)] rounded-[10px] mt-[50px] p-btnrbase pb-0">
                  <p className="text-left">
                    <span className="font-bold">{$t('删除消费者')}：</span>
                    {$t('删除操作不可恢复，请谨慎操作！')}
                  </p>
                  <div className="text-left">
                    <WithPermission access="team.application.application.delete">
                      <Button
                        className="m-auto mt-[16px] mb-[20px]"
                        type="default"
                        danger={true}
                        onClick={deleteApplicationModal}
                        loading={delBtnLoading}
                      >
                        {$t('删除消费者')}
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

export default ManagementConfig
