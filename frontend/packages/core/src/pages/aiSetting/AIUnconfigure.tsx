import Icon, { LoadingOutlined } from '@ant-design/icons'
import WithPermission from '@common/components/aoplatform/WithPermission'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { App, Button, Card, Empty, Spin, Tag } from 'antd'
import { memo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAiSetting } from './contexts/AiSettingContext'
import { AiSettingListItem } from './types'

const CardBox = memo(({ provider }: { provider: AiSettingListItem }) => {
  const { openConfigModal } = useAiSetting()
  const navigate = useNavigate()

  const handleOpenModal = async (provider: AiSettingListItem) => {
    await openConfigModal(provider)
    navigate('/aisetting?status=configure')
  }

  return (
    <Card
      title={
        <div className="flex w-full items-center justify-between gap-[4px]">
          <div className="flex flex-1 overflow-hidden items-center  gap-[4px]">
            <span
              className=" flex items-center h-[22px]  ai-setting-svg-container"
              dangerouslySetInnerHTML={{ __html: provider.logo }}
            ></span>
            <span className="font-normal truncate">{provider.name}</span>
          </div>
          <Tag
            bordered={false}
            color={provider.configured ? 'green' : undefined}
            className="h-[22px] px-[4px] text-center"
          >
            {provider.configured ? $t('已配置') : $t('未配置')}
          </Tag>
        </div>
      }
      className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible  h-[156px] m-0 flex flex-col "
      classNames={{ header: 'border-b-[0px] p-[20px] px-[24px]', body: 'pt-0 flex-1' }}
    >
      <div className="flex flex-col justify-between h-full gap-btnbase">
        <div className="flex items-center w-full h-[32px]  flex-1">
          {provider.configured && (
            <>
              <label className="text-nowrap">{$t('默认')}：</label>
              <span className="overflow-hidden flex-1 truncate">{provider.defaultLlm}</span>
            </>
          )}
        </div>
        <WithPermission access="system.settings.ai_provider.view">
          <Button
            block
            icon={<Icon icon="ic:outline-settings" width={18} height={18} />}
            onClick={() => handleOpenModal(provider)}
            classNames={{ icon: 'h-[18px]' }}
          >
            {$t('设置')}
          </Button>
        </WithPermission>
      </div>
    </Card>
  )
})
const ModelCardArea = ({ modelList, className }: { modelList: AiSettingListItem[]; className?: string }) => {
  return (
    <>
      {modelList.length > 0 ? (
        <div
          className={className}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}
        >
          {modelList.map((provider: AiSettingListItem) => (
            <CardBox key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </>
  )
}

const AIUnConfigure = () => {
  const [modelData, setModelData] = useState<AiSettingListItem[]>([])
  const { fetchData } = useFetch()
  const [loading, setLoading] = useState<boolean>(false)
  const { aiConfigFlushed } = useGlobalContext()

  useEffect(() => {
    setLoading(true)
    fetchData<BasicResponse<{ providers: Omit<AiSettingListItem>[] }>>(`ai/providers/unconfigured`, {
      method: 'GET',
      eoTransformKeys: ['default_llm', 'default_llm_logo']
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setModelData(data.providers)
        } else {
          const { message } = App.useApp()
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .finally(() => setLoading(false))
  }, [aiConfigFlushed])

  return (
    <Spin
      className="h-full"
      wrapperClassName="h-full pr-PAGE_INSIDE_X"
      indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      spinning={loading}
    >
      {modelData && modelData.length > 0 ? (
        <div>
          {modelData.filter((item) => !item.configured).length > 0 && (
            <>
              <ModelCardArea modelList={modelData.filter((item) => !item.configured) || []} />
            </>
          )}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Spin>
  )
}
export default AIUnConfigure
