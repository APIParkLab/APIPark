import { Avatar, Button, Card, Tag, Tooltip, App } from 'antd'
import { Icon } from '@iconify/react/dist/iconify.js'
import { $t } from '@common/locales/index.ts'
import { ApiOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { SERVICE_KIND_OPTIONS } from '@core/const/system/const'
import { IconButton } from '@common/components/postcat/api/IconButton'
import useCopyToClipboard from '@common/hooks/copy'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'

export type ServiceBasicInfoType = {
  id?: string
  logo?: string
  name: string
  description: string
  appNum: number
  apiNum: number
  serviceName: string
  serviceDesc: string
  invokeCount: number
  catalogue: {
    name: string
  }
  serviceKind: string
  service_kind: string
  enableMcp: boolean
  enable_mcp: boolean
  isReleased?: boolean
}

type ServiceInfoCardProps = {
  actionSlot?: React.ReactNode
  customClassName?: string
  serviceId?: string
  serviceBasicInfo?: ServiceBasicInfoType
  teamId?: string
}
const ServiceInfoCard = ({
  actionSlot,
  customClassName,
  serviceId,
  serviceBasicInfo,
  teamId
}: ServiceInfoCardProps) => {
  /** 服务指标 */
  const [serviceMetrics, setServiceMetrics] = useState<{ title: string; icon: React.ReactNode; value: string }[]>([])
  /** 服务标签 */
  const [serviceTags, setServiceTags] = useState<
    { color: string; textColor: string; title: string; content: React.ReactNode }[]
  >([])
  /** 剪切板 */
  const { copyToClipboard } = useCopyToClipboard()
  /** 弹窗组件 */
  const { message } = App.useApp()
  /** 获取服务信息 */
  const { fetchData } = useFetch()
  /** 服务信息 */
  const [serviceOverview, setServiceOverview] = useState<ServiceBasicInfoType>()

  /**
   * 复制
   * @param value
   * @returns
   */
  const handleCopy = async (value: string): Promise<void> => {
    if (value) {
      copyToClipboard(value)
      message.success($t(RESPONSE_TIPS.copySuccess))
    }
  }

  /** 获取服务信息 */
  const getServiceOverview = () => {
    fetchData<BasicResponse<{ overview: ServiceBasicInfoType }>>('service/overview/basic', {
      method: 'GET',
      eoParams: { service: serviceId, team: teamId },
      eoTransformKeys: [
        'api_num',
        'enable_mcp',
        'service_kind',
        'subscriber_num',
        'invoke_num',
        'avaliable_monitor',
        'is_released'
      ]
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        const serviceOverview = {
          ...data.overview,
          appNum: data.overview.subscriberNum,
          invokeCount: data.overview.invokeNum,
          serviceName: data.overview.name,
          serviceDesc: data.overview.description
        }
        setServiceOverview(serviceOverview)
        setServiceMetricsList(serviceOverview)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  /**
   * 打开服务详情页面
   */
  const openInPortal = () => {
    window.open(`/portal/detail/${serviceOverview?.id}`, '_blank')
  }

  // 格式化调用次数，添加K和M单位
  const formatInvokeCount = (count: number | null | undefined): string => {
    if (count === null || count === undefined) return '-'
    if (count >= 1000000) {
      const value = Math.floor(count / 100000) / 10
      return `${value}M`
    }
    if (count >= 1000) {
      const value = Math.floor(count / 100) / 10
      return `${value}K`
    }
    return count.toString()
  }

  const setServiceMetricsList = (serviceOverview: ServiceBasicInfoType) => {
    // 设置服务指标数据
    setServiceMetrics([
      {
        title: 'API 数量',
        icon: <ApiOutlined className="mr-[1px] text-[14px] h-[14px] w-[14px]" />,
        value: serviceOverview.apiNum?.toString() || '0'
      },
      {
        title: '接入消费者数量',
        icon: <Icon icon="tabler:api-app" width="14" height="14" />,
        value: serviceOverview.appNum?.toString() || '0'
      },
      {
        title: '30天内调用次数',
        icon: <Icon icon="iconoir:graph-up" width="14" height="14" />,
        value: formatInvokeCount(serviceOverview.invokeCount ?? 0)
      }
    ])
    const serviceKind = serviceOverview?.serviceKind || serviceOverview?.service_kind
    // 设置服务标签数据
    const tags = [
      {
        color: '#7371fc1b',
        textColor: 'text-theme',
        title: serviceOverview?.catalogue?.name || '-',
        content: serviceOverview?.catalogue?.name || '-'
      },
      {
        color: `#${serviceKind === 'ai' ? 'EADEFF' : 'DEFFE7'}`,
        textColor: 'text-[#000]',
        title: serviceKind || '-',
        content: SERVICE_KIND_OPTIONS.find((x) => x.value === serviceKind)?.label || '-'
      }
    ]

    // 如果启用了MCP，添加MCP标签
    if (serviceOverview?.enableMcp) {
      tags.push({
        color: '#FFF0C1',
        textColor: 'text-[#000]',
        title: 'MCP',
        content: 'MCP'
      })
    }

    setServiceTags(tags)
  }
  useEffect(() => {
    if (!serviceId && serviceBasicInfo) {
      setServiceMetricsList(serviceBasicInfo)
      setServiceOverview(serviceBasicInfo)
      return
    }
    getServiceOverview()
  }, [serviceId, serviceBasicInfo])
  return (
    <>
      <Card
        style={{
          borderRadius: '10px',
          background: 'linear-gradient(35deg, rgb(246, 246, 260) 0%, rgb(255, 255, 255) 40%)'
        }}
        className={`w-full ${customClassName}`}
        classNames={{
          body: `p-[15px] ${actionSlot ? 'h-[180px]' : 'max-h-[130px]'}`
        }}
      >
        {serviceOverview && (
          <>
            <div className="service-info">
              <div className="flex items-center">
                <div>
                  <Avatar
                    shape="square"
                    size={50}
                    className={`rounded-[12px] border-none rounded-[12px] ${serviceOverview.logo ? 'bg-[linear-gradient(135deg,white,#f0f0f0)]' : 'bg-theme'}`}
                    src={
                      serviceOverview.logo ? (
                        <img
                          src={serviceOverview.logo}
                          alt="Logo"
                          style={{ maxWidth: '200px', width: '45px', height: '45px', objectFit: 'unset' }}
                        />
                      ) : undefined
                    }
                    icon={serviceOverview.logo ? '' : <Icon icon="tabler:api-app" />}
                  >
                    {' '}
                  </Avatar>
                </div>
                <div className="pl-[20px] w-[calc(100%-50px)] overflow-hidden">
                  <p
                    className={`text-[14px] h-[20px] leading-[20px] truncate font-bold w-full flex items-center gap-[4px]`}
                  >
                    {serviceOverview.serviceName}
                  </p>
                  <div className="mt-[5px] h-[20px] flex items-center font-normal">
                    {serviceTags.map((tag, index) => (
                      <Tag
                        key={index}
                        color={tag.color}
                        className={`${tag.textColor} font-normal border-0 mr-[12px] max-w-[150px] truncate`}
                        bordered={false}
                        title={tag.title}
                      >
                        {tag.content}
                      </Tag>
                    ))}
                    {serviceMetrics.map((item, index) => (
                      <Tooltip key={index} title={$t(item.title)}>
                        <span className="mr-[12px] flex items-center">
                          <span className="h-[14px] mr-[4px] flex items-center">{item.icon}</span>
                          <span className="font-normal text-[14px]">{item.value}</span>
                        </span>
                      </Tooltip>
                    ))}
                  </div>
                </div>
                {serviceOverview.id && (
                  <>
                    <div className="absolute top-[14px] right-[20px]">
                      <span className="bg-white relative py-[2px] pl-[10px] pr-[30px] inline-block border-solid border-[1px] border-BORDER rounded-lg">
                        {$t('服务 ID')}：{serviceOverview.id || '-'}
                        <IconButton
                          name="copy"
                          onClick={() => handleCopy(serviceOverview.id || '')}
                          sx={{
                            position: 'absolute',
                            top: '0px',
                            right: '5px',
                            color: '#999',
                            transition: 'none',
                            '&.MuiButtonBase-root:hover': {
                              background: 'transparent',
                              color: '#3D46F2',
                              transition: 'none'
                            }
                          }}
                        ></IconButton>
                      </span>
                      <Tooltip title={serviceOverview.isReleased ? '' : $t('服务尚未发布')}>
                        <Button
                          disabled={!serviceOverview.isReleased}
                          className="ml-[10px] !max-h-[28px] rounded-[13px]"
                          type="primary"
                          onClick={() => openInPortal()}
                        >
                          {$t('跳转至详情页')}
                        </Button>
                      </Tooltip>
                    </div>
                  </>
                )}
              </div>
              <span className="line-clamp-2 mt-[15px] text-[12px] text-[#666]" title={serviceOverview.serviceDesc}>
                {serviceOverview.serviceDesc || $t('暂无服务描述')}
              </span>
            </div>
          </>
        )}
        <div className="absolute bottom-[15px]">{actionSlot}</div>
      </Card>
    </>
  )
}

export default ServiceInfoCard
