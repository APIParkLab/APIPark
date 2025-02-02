import InsidePage from '@common/components/aoplatform/InsidePage'
import { useI18n } from '@common/locales'
import { Tabs } from 'antd'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AIFlowChart from './AIFlowChart'
import AIUnConfigure from './AIUnconfigure'
import { AiSettingProvider } from './contexts/AiSettingContext'

const CONTENT_STYLE = { height: 'calc(-300px + 100vh)' } as const

const AiSettingContent = () => {
  const $t = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeKey, setActiveKey] = useState(searchParams.get('status') === 'unconfigure' ? 'config' : 'flow')

  useEffect(() => {
    const newActiveKey = searchParams.get('status') === 'unconfigure' ? 'config' : 'flow'
    setActiveKey(newActiveKey)
  }, [searchParams])

  return (
    <InsidePage
      className="h-full pb-PAGE_INSIDE_B"
      pageTitle={$t('AI 模型')}
      description={$t('配置好 AI 模型后，你可以使用对应的大模型来创建 AI 服务')}
      showBorder={false}
      scrollPage={false}
    >
      <div className="flex flex-col h-full">
        <Tabs
          activeKey={activeKey}
          onChange={(key) => {
            setActiveKey(key)
            setSearchParams({ status: key === 'config' ? 'unconfigure' : 'configure' })
          }}
          className="sticky top-0 flex-shrink-0"
          items={[
            {
              key: 'flow',
              label: $t('已设置'),
              children: (
                <div className="overflow-auto" style={CONTENT_STYLE}>
                  <AIFlowChart />
                </div>
              )
            },
            {
              key: 'config',
              label: $t('未设置'),
              children: (
                <div className="overflow-auto" style={CONTENT_STYLE}>
                  <AIUnConfigure />
                </div>
              )
            }
          ]}
        />
      </div>
    </InsidePage>
  )
}

const AiSettingList = () => {
  return (
    <AiSettingProvider>
      <AiSettingContent />
    </AiSettingProvider>
  )
}

export default AiSettingList
