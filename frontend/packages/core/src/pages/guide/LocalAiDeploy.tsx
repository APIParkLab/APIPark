import { Icon } from '@iconify/react/dist/iconify.js'
import WithPermission from '@common/components/aoplatform/WithPermission'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { Form, message, Select } from 'antd'
import { $t } from '@common/locales'
import { LocalModelItem, SimpleTeamItem } from '@common/const/type'
import { useFetch } from '@common/hooks/http'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import useDeployLocalModel from './deployModelUtil'
export type LocalAiDeployHandle = {
  deployLocalAIServer: () => Promise<boolean | string>
}
const LocalAiDeploy = forwardRef<LocalAiDeployHandle, any>((props: any, ref: any) => {
  const { onClose } = props
  const [form] = Form.useForm()
  const { fetchData } = useFetch()
  const [modelList, setModelList] = useState<any[]>([])
  const [teamList, setTeamList] = useState<SimpleTeamItem[]>([])
  const { deployLocalModel, getTeamOptionList } = useDeployLocalModel()

  /**
   * 获取本地模型列表
   * @returns 本地模型列表
   */
  const getLocalModelList = async () => {
    const response = await fetchData<BasicResponse<{ models: LocalModelItem[] }>>(
      'model/local/can_deploy',
      { method: 'GET', eoTransformKeys: ['is_popular'] }
    )
    const { code, data, msg } = response
    if (code === STATUS_CODE.SUCCESS) {
      const modelList = data.models?.map((x: LocalModelItem) => {
        return { ...x, label: x.name, value: x.id }
      })
      setModelList(modelList)
    } else {
      message.error(msg || $t(RESPONSE_TIPS.error))
      return []
    }
  }

  /**
   * 部署热门模型
   * @param id 模型ID
   * @returns 
   */
  const deployPopularModel = async (id: string) => {
    await deployLocalModel({
      modelID: id,
      team: form.getFieldValue('team')
    })
    onClose?.()
  }

  const getTeamList = async () => {
    const teamOptionList = await getTeamOptionList()
    setTeamList(teamOptionList)
    if (form.getFieldValue('team') === undefined && teamOptionList.length) {
      form.setFieldValue('team', teamOptionList[0].value)
    }
  }
  useEffect(() => {
    getLocalModelList()
    getTeamList()
  }, [])

  /**
   * 部署本地AI
   * @returns 
   */
  const deployLocalAIServer = () => {
    return new Promise((resolve, reject) => {
      form
        .validateFields()
        .then(async (value) => {
          await deployLocalModel(value)
          resolve(true)
        })
        .catch((errorInfo) => reject(errorInfo))
    })
  }

  useImperativeHandle(ref, () => ({
    deployLocalAIServer
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
        <Form.Item label={$t('模型名称')} name="modelID" rules={[{ required: true }]}>
          <Select
            showSearch
            className="w-INPUT_NORMAL"
            filterOption={(input, option) => (option?.searchText ?? '').includes(input.toLowerCase())}
            placeholder={$t(PLACEHOLDER.input)}
            options={modelList.map((provider) => ({
              label: (
                <div className='relative'>
                  <span>{provider.name}</span>
                  <span className='absolute right-[10px] text-[#999]' >{provider.size}</span>
                  </div>
              ),
              value: provider.id,
              searchText: provider.name.toLowerCase()
            }))}
            onChange={(value) => {
              form.setFieldValue('modelID', value)
            }}
          ></Select>
          <div className="mt-[10px] mb-[5px]">
            <Icon className="align-text-top" icon="noto-v1:fire" width="17" height="17" />
            {$t('热点模型')}
          </div>
          <div className="pl-[5px] flex flex-wrap">
            {modelList.length ?
              modelList
                .filter((item) => item.is_popular)
                .map((item) => (
                  <span
                    key={item.id}
                    className="text-[#2196f3] text-[15px] hover:text-[#1976d2] mr-[20px] cursor-pointer
  "
                    onClick={() => {
                      deployPopularModel(item.id)
                    }}
                  >
                    {item.name}
                  </span>
                )) : null}
          </div>
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

export default LocalAiDeploy
