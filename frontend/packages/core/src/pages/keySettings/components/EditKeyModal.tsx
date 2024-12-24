import { $t } from '@common/locales'
import { DatePicker, Form, Input, Modal, Switch, theme } from 'antd'
import dayjs from 'dayjs'
import React from 'react'

interface EditKeyModalProps {
  visible: boolean
  onCancel: () => void
  onSave: (values: any) => void
  initialValues?: {
    key: string
    expirationDate: string
    enabled: boolean
  }
}

const EditKeyModal: React.FC<EditKeyModalProps> = ({ visible, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm()
  const { token } = theme.useToken()

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSave({
        ...values,
        expirationDate: values.expirationDate.format('YYYY-MM-DD')
      })
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <Modal title={$t('Edit API Key')} open={visible} onCancel={onCancel} onOk={handleOk} destroyOnClose>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...initialValues,
          expirationDate: initialValues?.expirationDate ? dayjs(initialValues.expirationDate) : undefined
        }}
      >
        <Form.Item
          name="key"
          label={$t('API Key')}
          rules={[{ required: true, message: $t('Please input the API key') }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="expirationDate"
          label={$t('Expiration Date')}
          rules={[{ required: true, message: $t('Please select expiration date') }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="enabled" label={$t('Enabled')} valuePropName="checked">
          <Switch checkedChildren={$t('Yes')} unCheckedChildren={$t('No')} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditKeyModal
