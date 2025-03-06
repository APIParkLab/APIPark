import { App, Form, Input, Select, Tag } from 'antd'
import { $t } from '@common/locales'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { Codebox } from '@common/components/postcat/api/Codebox'
import { useFetch } from '@common/hooks/http'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
type modelFieldType = {
  name: string
  type: string
  model_parameters: string
  access_configuration: string
}

export type addModelsContentHandle = {
  save: () => Promise<boolean | string>
}

type addModelContentProps = {
  showAccessConfig: boolean
  accessConfig: string
  modelParameters?: string
  modelName?: string
  type?: 'add' | 'edit'
  providerID?: string
  modelID?: string
}

const AddModels = forwardRef<addModelsContentHandle, addModelContentProps>((props, ref) => {
  const { showAccessConfig, accessConfig, modelParameters, modelName, providerID, type, modelID } = props
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const { fetchData } = useFetch()
  const [templateList, setTemplateList] = useState<{
    id: string
    name: string
    config: string
  }[]>()
  /**
   * 获取 modelTemplateList 列表
   * @param id
   */
  const getModelTemplateList = () => {
    // 暂时先固定
    const modelTemplateList = [
      {
        id: 'customize',
        name: $t('自定义'),
        config: '{}'
      }
    ]
    setTemplateList(modelTemplateList)
    if (!modelParameters) {
      form.setFieldValue('model_parameters', modelTemplateList[0].config)
    }
    form.setFieldValue('type', 'customize')
  }

  useEffect(() => {
    getModelTemplateList()
    form.setFieldsValue({
      access_configuration: accessConfig,
      model_parameters: modelParameters || '{}',
      name: modelName || ''
    })
  }, [])

  /**
   * 保存
   * @returns
   */
  const save: () => Promise<boolean | string> = () => {
    return new Promise((resolve, reject) => {
      try {
        form
          .validateFields()
          .then((value) => {
            const finalValue = {
              ...value,
              id: modelID
            }
            delete finalValue.type
            fetchData<BasicResponse<null>>('ai/provider/model', {
              method: type === 'edit' ? 'DELETE' : 'POST',
              eoParams: { provider: providerID },
              eoBody: finalValue,
              eoTransformKeys: ['defaultLlm']
            })
              .then((response) => {
                const { code, msg } = response
                if (code === STATUS_CODE.SUCCESS) {
                  message.success($t(RESPONSE_TIPS.success) || msg)
                  resolve(true)
                } else {
                  message.error(msg || $t(RESPONSE_TIPS.error))
                  reject(msg || $t(RESPONSE_TIPS.error))
                }
              })
              .catch((errorInfo) => reject(errorInfo))
          })
          .catch((errorInfo) => reject(errorInfo))
      } catch (error) {
        reject(error)
      }
    })
  }

  useImperativeHandle(ref, () => ({
    save
  }))

  return (
    <Form
      form={form}
      layout="vertical"
      labelAlign="left"
      scrollToFirstError
      className="flex flex-col mx-auto h-full"
      name="aiServiceInsideRouterModalConfig"
      autoComplete="off"
    >
      <Form.Item<modelFieldType> label={$t('模型名称')} name="name" rules={[{ required: true }]}>
        <Input disabled={type === 'edit'} className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
      </Form.Item>
      {showAccessConfig && (
        <Form.Item<modelFieldType> label={$t('访问配置')} name="access_configuration" rules={[{ required: true }]}>
          <Codebox
            editorTheme="vs-dark"
            readOnly={false}
            width="100%"
            height="70px"
            language="json"
            enableToolbar={false}
          />
        </Form.Item>
      )}

      <Form.Item label={$t('模型参数模板')} name="type" className="mt-[16px]">
        <Select
          className="w-INPUT_NORMAL"
          placeholder={$t(PLACEHOLDER.input)}
          options={templateList?.map((x) => ({
            value: x.id,
            label: (
              <div className="flex items-center gap-[10px]">
                <span>{x.name}</span>
              </div>
            )
          }))}
          onChange={(value) => {
            form.setFieldValue('team', value)
          }}
        ></Select>
      </Form.Item>
      <Form.Item<modelFieldType> label={$t('模型参数')} name="model_parameters">
        <Codebox
          editorTheme="vs-dark"
          readOnly={false}
          width="100%"
          height="200px"
          language="json"
          enableToolbar={false}
        />
      </Form.Item>
    </Form>
  )
})

export default AddModels
