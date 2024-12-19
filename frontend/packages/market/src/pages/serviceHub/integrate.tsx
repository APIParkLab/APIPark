import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { RouterParams } from '@common/const/type'
import useCopyToClipboard from '@common/hooks/copy.ts'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { ServiceDetailType } from '@market/const/serviceHub/type'
import { Button, Input, Space, message } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const Integrate = ({ service }: { service: ServiceDetailType }) => {
  const stepClass = 'leading-[20px] truncate font-bold items-center gap-[4px] mt-[15px]'
  const [url, setUrl] = useState('')
  const { serviceId } = useParams<RouterParams>()
  const { fetchData } = useFetch()
  const { copyToClipboard } = useCopyToClipboard()

  useEffect(() => {
    setUrl(`${service?.basic?.sitePrefix || window.location?.origin}/api/v1/service/swagger/${serviceId}`)
  }, [service])
  /**
   * Agent 平台地址
   */
  const agentAddress = '/cluster'
  /**
   * 消费者地址
   */
  const consumerAddress = '/consumer/list'
  /**
   * 复制代码
   */
  const copyURL = async (): Promise<void> => {
    copyToClipboard(url)
  }
  /**
   * 下载文件
   */
  const onDownload = () => {
    fetchData<BasicResponse<null>>(`export/openapi/${serviceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    }).then((response) => {
      const { code, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        message.success(msg || $t(RESPONSE_TIPS.success))
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }
  return (
    <div>
      <div>
        {$t('支持把当前服务对接主流的 AI Agent平台，实现在 Agent 平台上快速、安全和合规地使用企业开放的 API 能力。')}
      </div>
      <div className="my-[10px]">{$t('可按以下步骤进行对接：')}</div>
      <p className={stepClass}>{$t('步骤一：Agent 平台上创建自定义插件')}</p>
      <div className="my-[10px]">
        {$t('不同 Agent 平台的操作细节可查看')}{' '}
        <a href={agentAddress} target="_blank" rel="noreferrer">
          {$t('《 Agent 对接手册》')}
        </a>
        。
      </div>
      <p className={stepClass}>{$t('步骤二：导入 API 文档数据')}</p>
      <div className="my-[10px]">{$t('可通过以下 URL 或 下载 Json 文件，导入 API 文档数据到 Agent 平台中。')}</div>
      <div className="flex w-full items-center gap-[30px]">
        <Space.Compact className="w-[700px]">
          <Input className="truncate" disabled title={url} value={url} />
          <Button type="primary" onClick={copyURL}>
            {$t('复制 URL')}
          </Button>
        </Space.Compact>
        <span className="text-[14px] font-bold">OR</span>
        <Button href={`/api/v1/export/openapi/${serviceId}`} target="_blank">
          {$t('下载 Json 文件')}
        </Button>
      </div>
      <p className={stepClass}>{$t('步骤三：配置 API 密钥')}</p>
      <div className="my-[10px]">
        {$t('在')}
        <a href={consumerAddress} target="_blank" rel="noreferrer">
          {' '}
          {$t('消费者')}{' '}
        </a>
        {$t('菜单中，选择已通过本 API 服务申请的消费者，')}
      </div>
      <div className="my-[10px]">{$t('把 "访问权限" 菜单下的密钥填入到 Agent 平台对应的插件密钥配置中。')}</div>
    </div>
  )
}
export default Integrate
