import Icon from '@ant-design/icons'
import { Codebox } from '@common/components/postcat/api/Codebox'
import { $t } from '@common/locales'
import { AIProvider } from '@core/components/AIProviderSelect'
import { DatePicker, Form, Input, Modal, Switch } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { APIKey } from '../types'

interface ApiKeyModalProps {
  visible: boolean
  onCancel: () => void
  onSave: (values: any) => void
  provider?: AIProvider
  mode: 'add' | 'edit'
  entity: APIKey | null
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ visible, onCancel, onSave, provider, mode, entity }) => {
  const [form] = Form.useForm()
  const [neverExpire, setNeverExpire] = useState(true)

  useEffect(() => {
    try {
      form.setFieldsValue({
        name: entity?.name,
        expire_time: entity?.expire_time ? dayjs(entity.expire_time) : undefined,
        config: entity?.config ? JSON.stringify(JSON.parse(entity?.config), null, 2) : JSON.parse(provider?.config)
      })
      setNeverExpire(!entity?.expire_time)
    } catch (e) {
      console.error('Error setting form values:', e)
      form.setFieldsValue({
        name: entity?.name,
        expire_time: undefined,
        config: ''
      })
    }
  }, [])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSave({
        ...values,
        expire_time: neverExpire ? null : values.expire_time.format('YYYY-MM-DD HH:mm:ss')
      })
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleNeverExpireChange = (checked: boolean) => {
    setNeverExpire(checked)
    if (!checked) {
      form.setFieldsValue({
        expire_time: dayjs().add(7, 'days')
      })
    }
  }

  const getProviderKeyUrl = (provider: string): string => {
    const urls: Record<string, string> = {
      openai: 'https://platform.openai.com/api-keys',
      anthropic: 'https://console.anthropic.com/account/keys',
      google: 'https://console.cloud.google.com/apis/credentials',
      azure: 'https://portal.azure.com/#blade/Microsoft_Azure_ProjectOxford/CognitiveServicesHub/OpenAI',
      stability: 'https://platform.stability.ai/account/keys'
    }
    return urls[provider.toLowerCase()] || '#'
  }

  console.log(provider)
  return (
    <Modal
      title={mode === 'add' ? $t(`添加 ${provider?.name} APIKey`) : $t('编辑 APIKey')}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
      maskClosable={false}
      footer={(_, { OkBtn, CancelBtn }) => (
        <div className="flex justify-between items-center">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={provider?.getApikeyUrl}
            className="flex items-center gap-[8px]"
          >
            <span>{$t('从 (0) 获取 API KEY', [provider?.name])}</span>
            <Icon icon="ic:baseline-open-in-new" width={16} height={16} />
          </a>
          <div>
            <CancelBtn />
            <OkBtn />
          </div>
        </div>
      )}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="id" label={$t('APIKey 名称')} rules={[{ required: true, message: $t('请输入 APIKey') }]}>
          <Input disabled={mode === 'edit'} />
        </Form.Item>

        <Form.Item label={$t('API Key')} name="config">
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

        {!neverExpire && (
          <Form.Item
            name="expire_time"
            label={$t('过期时间')}
            rules={[{ required: true, message: $t('请选择过期时间') }]}
          >
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
        )}

        {mode === 'edit' && (
          <Form.Item name="enabled" label={$t('启用状态')} valuePropName="checked">
            <Switch checkedChildren={$t('是')} unCheckedChildren={$t('否')} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default ApiKeyModal
