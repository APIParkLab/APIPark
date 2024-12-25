import { $t } from '@common/locales'
import { DatePicker, Form, Input, Modal, Switch } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { APIKey } from '..'

interface ApiKeyModalProps {
  visible: boolean
  onCancel: () => void
  onSave: (values: any) => void
  vendorName: string
  mode: 'add' | 'edit'
  initialValues?: Partial<APIKey>
  defaultKeyNumber?: number
}

const { TextArea } = Input

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  visible,
  onCancel,
  onSave,
  vendorName,
  mode,
  initialValues,
  defaultKeyNumber = 1
}) => {
  const [form] = Form.useForm()
  const [neverExpire, setNeverExpire] = useState(true)

  useEffect(() => {
    if (visible) {
      if (mode === 'add') {
        form.setFieldsValue({
          id: `KEY${defaultKeyNumber}`,
          neverExpire: true,
          expire_time: dayjs().add(7, 'days'),
          name: {
            openai_api_base: 'API Base',
            openai_api_key: 'API Key'
          }
        })
      } else if (initialValues) {
        form.setFieldsValue({
          id: initialValues.id,
          name: initialValues.name,
          expire_time: initialValues.expire_time ? dayjs(initialValues.expire_time) : undefined,
          enabled: initialValues.enabled,
          neverExpire: !initialValues.expire_time
        })
        setNeverExpire(!initialValues.expire_time)
      }
    }
  }, [visible, mode, initialValues, defaultKeyNumber, form])

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

  return (
    <Modal
      title={mode === 'add' ? $t('添加 {{vendorName}} APIKey', { vendorName }) : $t('编辑 APIKey')}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="id" label={$t('APIKey 名称')} rules={[{ required: true, message: $t('请输入 APIKey') }]}>
          <Input disabled={mode === 'edit'} />
        </Form.Item>

        <Form.Item
          name="name"
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>{$t('API Key')}</span>
              {mode === 'add' && (
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                  {$t('从 OpenAI 获取 API Key')}
                </a>
              )}
            </div>
          }
          rules={[{ required: true, message: $t('请输入 API Key') }]}
        >
          {mode === 'add' ? (
            <TextArea
              rows={4}
              placeholder={JSON.stringify(
                {
                  openai_api_base: 'API Base',
                  openai_api_key: 'API Key'
                },
                null,
                2
              )}
            />
          ) : (
            <Input.Password />
          )}
        </Form.Item>

        <Form.Item name="neverExpire" valuePropName="checked">
          <Switch
            checkedChildren={$t('永不过期')}
            unCheckedChildren={$t('设置过期时间')}
            onChange={handleNeverExpireChange}
          />
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
