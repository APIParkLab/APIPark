import InsidePage from '@common/components/aoplatform/InsidePage'
import WithPermission from '@common/components/aoplatform/WithPermission'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { App, Button, Form, Input, Row, Select, Switch } from 'antd'
import { useEffect, useState } from 'react'

type AuthSetting = {
  config: {
    clientId: string
    clientSecret: string
  }
  enabled: boolean
}

type AuthFieldType = {
  authType: string
  clientId: string
  clientSecret: string
  enabled: boolean
}

const Auth = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const { fetchData } = useFetch()
  const [, forceUpdate] = useState<unknown>(null)
  const { state } = useGlobalContext()
  const [thirdPartyDrivers, setThirdPartyDrivers] = useState<{ label: string; value: string }[]>([])
  useEffect(() => {
    forceUpdate({})
  }, [state.language])
  const onFinish = () => {
    form.validateFields().then((value) => {
      return fetchData<BasicResponse<null>>(`/account/third/${value.authType}`, {
        method: 'POST',
        eoBody: {
          enable: value.enabled,
          config: {
            client_id: value.clientId,
            client_secret: value.clientSecret
          }
        }
      })
        .then((response) => {
          const { code, msg } = response
          if (code === STATUS_CODE.SUCCESS) {
            message.success(msg || $t(RESPONSE_TIPS.success))
            return Promise.resolve(true)
          } else {
            message.error(msg || $t(RESPONSE_TIPS.error))
            return Promise.reject(msg || $t(RESPONSE_TIPS.error))
          }
        })
        .catch((errorInfo) => {
          return Promise.reject(errorInfo)
        })
    })
  }

  /**
   * 获取第三方授权列表
   */
  const getThirdPartyAuthList = () => {
    fetchData<
      BasicResponse<{
        drivers: {
          name: string
          value: string
        }[]
      }>
    >('/account/third', {
      method: 'GET',
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setThirdPartyDrivers(data.drivers.map((item: any) => ({ label: item.name, value: item.value })))
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  /**
   * 获取第三方授权配置
   */
  const getThirdPartyAuthSetting = () => {
    fetchData<BasicResponse<{ info: AuthSetting }>>(`/account/third/${form.getFieldValue('authType')}`, {
      method: 'GET',
      eoTransformKeys: ['client_id', 'client_secret']
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        form.setFieldsValue({
          clientId: data.info?.config?.clientId || '',
          clientSecret: data.info?.config?.clientSecret || '',
          enabled: data.info?.enable || false
        })
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  useEffect(() => {
    getThirdPartyAuthList()
  }, [])

  return (
    <InsidePage pageTitle={$t('鉴权')} showBorder={false} contentClassName="pr-PAGE_INSIDE_X" scrollPage={false} description={$t("系统用户账号登录授权配置")}>
      <WithPermission access="">
        <Form
          layout="vertical"
          labelAlign="left"
          scrollToFirstError
          form={form}
          className={`mx-auto`}
          name="authConfig"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<AuthFieldType>
            label={$t('授权类型')}
            name="authType"
            rules={[{ required: true, message: $t('请选择授权类型') }]}
          >
            <Select className="w-INPUT_NORMAL" placeholder={$t('请选择授权类型')} onChange={getThirdPartyAuthSetting} options={thirdPartyDrivers} />
          </Form.Item>

          <Form.Item<AuthFieldType>
            label={$t('APP ID')}
            name="clientId"
            rules={[{ required: true, whitespace: true, message: $t('请输入APP ID') }]}
            extra={$t('APP ID 参数位于飞书开发人员控制台中的应用程序凭证和基础信息页面上')}
          >
            <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} autoComplete="off" />
          </Form.Item>

          <Form.Item<AuthFieldType>
            label={$t('APP Secret')}
            name="clientSecret"
            rules={[{ required: true, whitespace: true, message: $t('请输入APP Secret') }]}
            extra={$t('APP Secret 参数位于飞书开发人员控制台中的应用程序凭证和基础信息页面上')}
          >
            <Input.Password className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} autoComplete="new-password" />
          </Form.Item>

          <Form.Item<AuthFieldType> label={$t('启用授权')} name="enabled" valuePropName="checked">
            <Switch checkedChildren={$t('启用')} unCheckedChildren={$t('停用')} />
          </Form.Item>

          <Row className="mb-[10px]">
            <WithPermission access="system.devops.system_setting.edit">
              <Button type="primary" htmlType="submit">
                {$t('保存')}
              </Button>
            </WithPermission>
          </Row>
        </Form>
      </WithPermission>
    </InsidePage>
  )
}

export default Auth
