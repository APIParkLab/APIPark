import { Button, Card } from 'antd'
import { useEffect, useState } from 'react'
import { $t } from '@common/locales'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react/dist/iconify.js'

/** 服务指标 */
type IndicatorType = {
  title: string
  link?: string
  content: string | React.ReactNode
}
const Indicator = ({ indicatorInfo }: { indicatorInfo: any }) => {
  /** 服务指标 */
  const [indicatorList, setIndicator] = useState<IndicatorType[]>([])
  /** 路由跳转 */
  const navigateTo = useNavigate()

  /** 设置服务指标 */
  const setIndicatorList = () => {
    setIndicator([
      {
        title: indicatorInfo?.enableMcp ? 'APIs / Tools' : 'APIs',
        link: `/serviceHub/detail/${indicatorInfo?.serviceId}`,
        content: indicatorInfo?.apiNum ?? 0
      },
      {
        title: $t('订阅数量'),
        link: `/consumer/list/${indicatorInfo?.teamId}`,
        content: indicatorInfo?.subscriberNum ?? 0
      },
      {
        title: 'MCP',
        content: (
          <>
            {/* green */}
            <Button
              color={indicatorInfo?.enableMcp ? 'green' : 'primary'}
              className="w-full rounded-[10px]"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation()
                if (indicatorInfo?.enableMcp) {
                  window.open(`/serviceHub/detail/${indicatorInfo?.serviceId}`, '_blank')
                } else {
                  navigateTo(`/service/${indicatorInfo?.teamId}/aiInside/${indicatorInfo?.serviceId}/setting`)
                }
              }}
            >
              {indicatorInfo?.enableMcp ? $t('已开启') : $t('开启 MCP')}
            </Button>
          </>
        )
      }
    ])
  }

  useEffect(() => {
    if (!indicatorInfo) return
    setIndicatorList()
  }, [indicatorInfo])

  return (
    <div className="flex">
      {indicatorList.map((item, index) => (
        <Card
          key={index}
          className={`flex-1 cursor-pointer shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.02] ${index > 0 ? 'ml-[10px]' : ''}`}
          classNames={{
            body: 'p-[15px]'
          }}
          onClick={() => {
            window.open(item.link)
          }}
        >
          <div className="text-[14px] font-semibold text-gray-400 mb-[15px]">
            {item.title}
            {item.link && <Icon icon="uiw:right" width="16" height="16" className="absolute top-[14px] right-[14px]" />}
          </div>
          <div className={`${index < 2 ? 'text-[40px] font-semibold' : 'block mt-[30px]'}`}>{item.content}</div>
        </Card>
      ))}
    </div>
  )
}

export default Indicator
