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
    const side = indicatorInfo?.serviceKind === 'ai' ? 'aiInside' : 'inside'
    setIndicator([
      {
        title: indicatorInfo?.enableMcp ? 'APIs / Tools' : 'APIs',
        link: `/service/${indicatorInfo?.teamId}/${side}/${indicatorInfo?.serviceId}/route`,
        content: indicatorInfo?.apiNum ?? 0
      },
      {
        title: $t('订阅数量'),
        link: `/service/${indicatorInfo?.teamId}/${side}/${indicatorInfo?.serviceId}/subscriber`,
        content: indicatorInfo?.subscriberNum ?? 0
      },
      {
        title: 'MCP',
        link: `/service/${indicatorInfo?.teamId}/${side}/${indicatorInfo?.serviceId}/setting`,
        content: (
          <>
            <Button
              color={indicatorInfo?.enableMcp ? 'green' : 'primary'}
              className="w-full rounded-[10px]"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation()
                navigateTo(`/service/${indicatorInfo?.teamId}/${side}/${indicatorInfo?.serviceId}/setting`)
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
          className={`flex-1 cursor-pointer rounded-[10px] ${index > 0 ? 'ml-[10px]' : ''}`}
          classNames={{
            body: 'py-[20px] px-[18px]'
          }}
          onClick={() => {
            if (item.link) {
              navigateTo(item.link)
            }
          }}
        >
          <div className="text-[14px] text-[#999999] mb-[10px]" style={{ fontFamily: 'Microsoft YaHei' }}>
            {item.title}
            {item.link && <Icon icon="uiw:right" width="16" height="16" className="absolute top-[14px] right-[14px]" />}
          </div>
          <div className={`${index < 2 ? 'text-[32px] font-medium text-[#101010]' : 'block mt-[30px]'}`} style={{ fontFamily: 'Microsoft YaHei' }}>
            {item.content}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default Indicator
