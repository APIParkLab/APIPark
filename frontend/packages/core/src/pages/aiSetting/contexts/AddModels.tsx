import { App, Dropdown, Form, Input } from 'antd'
import { $t } from '@common/locales'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { Codebox } from '@common/components/postcat/api/Codebox'
import { useFetch } from '@common/hooks/http'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
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

type TemplatesItems = {
  providerName: string
  modelName: string
  modelParameters: string
}

const AddModels = forwardRef<addModelsContentHandle, addModelContentProps>((props, ref) => {
  const { showAccessConfig, accessConfig, modelParameters, modelName, providerID, type, modelID } = props
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const { fetchData } = useFetch()
  const [templateList, setTemplateList] = useState<
    {
      key: string
      label: string
      config: string
    }[]
  >([])

  /**
   * 获取 modelTemplateList 列表
   * @param id
   */
  const getModelTemplateList = () => {
    fetchData<BasicResponse<{ templates: TemplatesItems[] }>>(`ai/provider/model/templates`, {
      method: 'GET',
      eoTransformKeys: ['provider_name', 'model_name', 'model_parameters']
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          const templates = data.templates || []
          setTemplateList(templates.map((template: any) => ({
            key: template.id,
            label: `${template.providerName} ${template.modelName}`,
            config: template.modelParameters
          })))
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
  }

  useEffect(() => {
    getModelTemplateList()
    form.setFieldsValue({
      access_configuration: accessConfig || '{}',
      model_parameters: modelParameters || '{}',
      name: modelName || ''
    })
  }, [])

  const modelParameterClick = ({ key }: { key: string }) => {
    const config = templateList.find((item) => item.key === key)?.config
    form.setFieldValue('model_parameters', config || '{}')
  }

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
            fetchData<BasicResponse<null>>('ai/provider/model', {
              method: type === 'edit' ? 'PUT' : 'POST',
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
      <Form.Item<modelFieldType> label={$t('模型参数')}>
        <span className="absolute top-[-28px] right-0 text-theme cursor-pointer">
          <Icon icon="ph:download-simple-light" className="align-sub mr-[5px]" width={20} height={20} />
          <Dropdown overlayClassName="w-[200px] [&>.ant-dropdown-menu>.ant-dropdown-menu-item>.ant-dropdown-menu-title-content]:truncate" placement="bottom" trigger={['click']} key="menu" menu={{ items: templateList, onClick: modelParameterClick }}>
            <span>{$t('载入预置模板')}</span>
          </Dropdown>
        </span>

        <Form.Item<modelFieldType> name="model_parameters">
          <Codebox
            editorTheme="vs-dark"
            readOnly={false}
            width="100%"
            height="200px"
            language="json"
            enableToolbar={false}
          />
        </Form.Item>
      </Form.Item>
    </Form>
  )
})

export default AddModels
