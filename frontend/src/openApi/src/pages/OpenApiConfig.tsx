import { App, Form, Input } from 'antd'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const.tsx'
import { useFetch } from '@common/hooks/http.ts'
import WithPermission from '@common/components/aoplatform/WithPermission.tsx'
import { v4 as uuidv4 } from 'uuid'
import { $t } from '@common/locales'

export type OpenApiConfigFieldType = {
  id?: string
  name: string
  desc: string
}

type OpenApiConfigProps = {
  type: 'add' | 'edit'
  entity?: OpenApiConfigFieldType
}

export type OpenApiConfigHandle = {
  save: () => Promise<boolean | string>
}

export const OpenApiConfig = forwardRef<OpenApiConfigHandle, OpenApiConfigProps>((props, ref) => {
  const { message } = App.useApp()
  const { type, entity } = props
  const [form] = Form.useForm()
  const { fetchData } = useFetch()
  const save: () => Promise<boolean | string> = () => {
    return new Promise((resolve, reject) => {
      form
        .validateFields()
        .then((value) => {
          fetchData<BasicResponse<null>>('external-app', {
            method: type === 'add' ? 'POST' : 'PUT',
            eoBody: value,
            eoParams: type === 'add' ? {} : { id: entity!.id }
          })
            .then((response) => {
              const { code, msg } = response
              if (code === STATUS_CODE.SUCCESS) {
                message.success(msg || $t(RESPONSE_TIPS.success))
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

  useImperativeHandle(ref, () => ({
    save
  }))

  useEffect(() => {
    if (type === 'edit' && entity) {
      form.setFieldsValue(entity)
    } else {
      form.setFieldValue('id', uuidv4())
    }
  }, [])

  return (
    <WithPermission access={type === 'edit' ? 'system.openapi.self.edit' : 'system.openapi.self.add'}>
      <Form
        layout="vertical"
        scrollToFirstError
        labelAlign="left"
        form={form}
        className="mx-auto "
        name="OpenApiConfig"
        autoComplete="off"
      >
        <Form.Item<OpenApiConfigFieldType>
          label={$t('消费者名称')}
          name="name"
          rules={[{ required: true, whitespace: true }]}
        >
          <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
        </Form.Item>

        <Form.Item<OpenApiConfigFieldType>
          label={$t('消费者 ID')}
          name="id"
          rules={[{ required: true, whitespace: true }]}
        >
          <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} disabled={type === 'edit'} />
        </Form.Item>

        <Form.Item label={$t('描述')} name="desc">
          <Input.TextArea className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
        </Form.Item>
      </Form>
    </WithPermission>
  )
})
