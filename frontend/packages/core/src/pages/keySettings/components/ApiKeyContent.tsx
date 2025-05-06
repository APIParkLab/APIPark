import { Codebox } from '@common/components/postcat/api/Codebox'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { AIProvider } from '@core/components/AIProviderSelect'
import { App, DatePicker, Form, Input, Switch } from 'antd'
import dayjs from 'dayjs'
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { EditAPIKey } from '../types'

interface ApiKeyContentProps {
  provider?: AIProvider
  entity: EditAPIKey
}

const ApiKeyContent: React.FC<ApiKeyContentProps> = forwardRef(({ provider, entity }, ref) => {
  const [form] = Form.useForm()
  const [neverExpire, setNeverExpire] = useState(true)
  const { fetchData } = useFetch()
  const { message } = App.useApp()

  useEffect(() => {
    try {
      const isNeverExpire = entity.expire_time === 0
      setNeverExpire(isNeverExpire)
      form.setFieldsValue({
        name: entity.name,
        expire_time: isNeverExpire ? undefined : dayjs(entity.expire_time * 1000),
        config: entity.config ? JSON.stringify(JSON.parse(entity.config), null, 2) : ''
      })
    } catch (e) {
      form.setFieldsValue({
        name: entity.name,
        expire_time: undefined,
        config: ''
      })
    }
  }, [])

  const handleOk = async () => {
    try {
      // 表单校验
      const values = await form.validateFields()
      const { expire_time, ...restValues } = values
      const expireTime = neverExpire ? 0 : Math.trunc(expire_time.valueOf() / 1000)

      const response = await fetchData<BasicResponse<null>>('ai/resource/key', {
        method: entity.id ? 'PUT' : 'POST',
        eoParams: { provider: provider?.id, id: entity.id },
        eoBody: { ...restValues, expire_time: expireTime },
        eoTransformKeys: ['config']
      })

      const { code, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        message.success(msg || $t(RESPONSE_TIPS.success))
        return true
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
        return false
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }
  useImperativeHandle(ref, () => ({
    handleOk
  }))
  const handleNeverExpireChange = (checked: boolean) => {
    setNeverExpire(checked)
    if (!checked) {
      form.setFieldsValue({
        expire_time: dayjs().add(7, 'days')
      })
    }
  }

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="name" label={$t('名称')} rules={[{ required: true, message: $t('请输入 APIKey') }]}>
        <Input />
      </Form.Item>
      <Form.Item label={$t('API Key')} name="config" rules={[{ required: true, message: $t('请填写 APIKey') }]}>
        <Codebox
          editorTheme="vs-dark"
          readOnly={false}
          width="100%"
          height="150px"
          language="json"
          enableToolbar={false}
        />
      </Form.Item>
      <Form.Item label={$t('过期时间')} name="neverExpire" valuePropName="checked">
        <div className="flex items-center">
          <Switch onChange={handleNeverExpireChange} checked={neverExpire} />
          <span className="ml-2">{neverExpire ? $t('永不过期') : $t('设置过期时间')}</span>
        </div>
      </Form.Item>
      {!neverExpire && (
        <Form.Item
          name="expire_time"
          label={$t('过期时间')}
          rules={[{ required: true, message: $t('请选择过期时间') }]}
        >
          <DatePicker style={{ width: '100%' }} showTime />
        </Form.Item>
      )}
    </Form>
  )
})

export default ApiKeyContent
