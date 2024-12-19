import { LoadingOutlined } from '@ant-design/icons'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE, STATUS_COLOR } from '@common/const/const'
import { EntityItem } from '@common/const/type'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { App, Table, Tooltip } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { SYSTEM_PUBLISH_ONLINE_COLUMNS } from '../../../const/system/const'

type AiServiceInsidePublishOnlineProps = {
  serviceId: string
  teamId: string
  id: string
}

export type AiServiceInsidePublishOnlineItems = {
  cluster: EntityItem
  status: 'done' | 'error' | 'publishing'
  error: string
}
export default function AiServiceInsidePublishOnline(props: AiServiceInsidePublishOnlineProps) {
  const { serviceId, teamId, id } = props
  const { message } = App.useApp()
  const [dataSource, setDataSource] = useState<[]>()
  const { fetchData } = useFetch()
  const [isStopped, setIsStopped] = useState(false)
  const { state } = useGlobalContext()

  const getOnlineStatus = () => {
    fetchData<BasicResponse<{ publishStatusList: AiServiceInsidePublishOnlineItems[] }>>(
      'service/publish/status',
      {
        method: 'GET',
        eoParams: { service: serviceId, team: teamId, id },
        eoTransformKeys: ['publish_status_list']
      }
    )
      .then(response => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setDataSource(data.publishStatusList)
          if (
            data.publishStatusList.filter(
              (x: AiServiceInsidePublishOnlineItems) => x.status === 'publishing'
            ).length === 0
          ) {
            setIsStopped(true)
          }
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .catch(errorInfo => message.error(errorInfo))
  }

  useEffect(() => {
    getOnlineStatus()
  }, [])

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    if (!isStopped) {
      intervalId = setInterval(() => {
        !isStopped && getOnlineStatus()
      }, 5000)
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [isStopped])

  const translatedPublishColumns = useMemo(
    () =>
      SYSTEM_PUBLISH_ONLINE_COLUMNS.map(x => {
        if (x.dataIndex === 'status') {
          return {
            ...x,
            title: $t(x.title),
            render: (_: unknown, entity: AiServiceInsidePublishOnlineItems) => {
              switch (entity.status) {
                case 'done':
                  return (
                    <span className={STATUS_COLOR[entity.status as keyof typeof STATUS_COLOR]}>
                      {$t('成功')}
                    </span>
                  )
                case 'error':
                  return (
                    <Tooltip title={entity.error || $t('上线失败')}>
                      <span
                        className={`${STATUS_COLOR[entity.status as keyof typeof STATUS_COLOR]} truncate block`}
                      >
                        {$t('失败')} {entity.error}
                      </span>
                    </Tooltip>
                  )
                default:
                  return <LoadingOutlined className="text-theme" spin />
              }
            }
          }
        }
      }),
    [state.language]
  )

  return (
    <Table
      className="min-h-[100px] h-full"
      bordered={true}
      columns={translatedPublishColumns}
      size="small"
      rowKey="id"
      dataSource={dataSource}
      pagination={false}
    />
  )
}
