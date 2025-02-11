import { Icon } from '@iconify/react/dist/iconify.js'
import WithPermission from '@common/components/aoplatform/WithPermission'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { Upload, UploadProps, Form, message, Select } from 'antd'
import { $t } from '@common/locales'
import { SimpleTeamItem } from '@common/const/type'
import { useFetch } from '@common/hooks/http'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import useDeployLocalModel from './deployModelUtil'

const { Dragger } = Upload
export type RestAIDeployHandle = {
    deployRestAIServer: () => Promise<boolean | string>
}
const RestAIDeploy = forwardRef<RestAIDeployHandle, any>((props: any, ref: any) => {
  const [form] = Form.useForm()
  const { fetchData } = useFetch()
  const [teamList, setTeamList] = useState<SimpleTeamItem[]>([])
  const { getTeamOptionList } = useDeployLocalModel()

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    beforeUpload: (file) => {
      form.setFieldsValue({ key: file })
      return false
    }
  }
  const getTeamList = async () => {
    const teamOptionList = await getTeamOptionList()
    setTeamList(teamOptionList)
    if (form.getFieldValue('team') === undefined && teamOptionList.length) {
      form.setFieldValue('team', teamOptionList[0].value)
    }
  }
  useEffect(() => {
    getTeamList()
  }, [])

    /**
   * 部署 rest 服务
   * @param file
   * @returns
   */
    const deployRestServer = async (file: File) => {
        return new Promise((resolve, reject) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('type', file.type)
          formData.append('team', form.getFieldValue('team'))
          fetchData<BasicResponse<{ teams: SimpleTeamItem[] }>>('quick/service/rest', {
            method: 'POST',
            body: formData
          }).then((response) => {
            const { code, msg } = response
            if (code === STATUS_CODE.SUCCESS) {
              message.success(msg || $t(RESPONSE_TIPS.success))
              resolve(true)
            } else {
              message.error(msg || $t(RESPONSE_TIPS.error))
              reject(false)
            }
          })
        })
      }

  /**
   * 部署本地AI
   * @returns 
   */
  const deployRestAIServer = () => {
    return new Promise((resolve, reject) => {
      form
        .validateFields()
        .then(async (value) => {
          await deployRestServer(value.key.file)
          resolve(true)
        })
        .catch((errorInfo) => reject(errorInfo))
    })
  }

  useImperativeHandle(ref, () => ({
    deployRestAIServer
  }))
  return (
    <WithPermission access="">
    <Form
      layout="vertical"
      labelAlign="left"
      scrollToFirstError
      form={form}
      className="mx-auto "
      name="partitionInsideCert"
      autoComplete="off"
    >
      <Form.Item
        name="key"
        className="mb-0 bg-transparent p-0 border-none rounded-none"
        rules={[{ required: true }]}
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <Icon className="text-[#ccc]" icon="tdesign:upload" width="50" height="50" />
          </p>
          <p className="ant-upload-text">{$t('选择 OpenAPI 文件 (.json / .yaml)')}</p>
        </Dragger>
      </Form.Item>
      <Form.Item label={$t('所属团队')} name="team" className="mt-[16px]" rules={[{ required: true }]}>
        <Select
          className="w-INPUT_NORMAL"
          placeholder={$t(PLACEHOLDER.input)}
          options={teamList}
          onChange={(value) => {
            form.setFieldValue('team', value)
          }}
        ></Select>
      </Form.Item>
    </Form>
  </WithPermission>
  )
})

export default RestAIDeploy
