import { Codebox } from '@common/components/postcat/api/Codebox'
import { $t } from '@common/locales'
import { AIProvider } from '@core/components/AIProviderSelect'
import { DatePicker, Form, Input, Switch } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { EditAPIKey } from '../types'

interface ApiKeyContentProps {
  provider?: AIProvider
  entity: EditAPIKey
}

const ApiKeyContent: React.FC<ApiKeyContentProps> = ({ provider, entity }) => {
  const [form] = Form.useForm()
  const [neverExpire, setNeverExpire] = useState(true)

  useEffect(() => {
    try {
      form.setFieldsValue({
        name: entity.name,
        expire_time: entity.expire_time === '0' ? 0 : dayjs(entity.expire_time),
        config: entity.config
      })
    } catch (e) {
      form.setFieldsValue({
        name: entity.name,
        expire_time: undefined,
        config: ''
      })
    }
    // setNeverExpire(entity.expire_time === '0')
  }, [])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      // onSave({
      //   ...values,
      //   expire_time: neverExpire ? null : values.expire_time.format('YYYY-MM-DD HH:mm:ss')
      // })
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleNeverExpireChange = (checked: boolean) => {
    console.log(checked)
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
          height="300px"
          language="json"
          enableToolbar={false}
        />
      </Form.Item>
      <Form.Item label={$t('过期时间')} name="neverExpire" valuePropName="checked">
        <div className="flex items-center">
          <Switch onChange={handleNeverExpireChange} />
          <span className="ml-2">{neverExpire ? $t('永不过期') : $t('设置过期时间')}</span>
        </div>
      </Form.Item>
      neverExpire:{neverExpire}
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
}

export default ApiKeyContent
