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
      title={mode === 'add' ? $t('Add {{vendorName}} name', { vendorName }) : $t('Edit API Key')}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="id"
          label={$t('* KEY Name')}
          rules={[{ required: true, message: $t('Please input the KEY name') }]}
        >
          <Input disabled={mode === 'edit'} />
        </Form.Item>

        <Form.Item
          name="name"
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>{$t('* API KEY')}</span>
              {mode === 'add' && (
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                  {$t('Get API KEY from OpenAI')}
                </a>
              )}
            </div>
          }
          rules={[{ required: true, message: $t('Please input the API key') }]}
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
            checkedChildren={$t('Never Expire')}
            unCheckedChildren={$t('Set Expiration')}
            onChange={handleNeverExpireChange}
          />
        </Form.Item>

        {!neverExpire && (
          <Form.Item
            name="expire_time"
            label={$t('Expiration Date')}
            rules={[{ required: true, message: $t('Please select expiration date') }]}
          >
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
        )}

        {mode === 'edit' && (
          <Form.Item name="enabled" label={$t('Enabled')} valuePropName="checked">
            <Switch checkedChildren={$t('Yes')} unCheckedChildren={$t('No')} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default ApiKeyModal
