import InsidePage from '@common/components/aoplatform/InsidePage'
import { $t } from '@common/locales'
import { Tabs } from 'antd'
import AIFlowChart from './AIFlowChart'
import AIUnConfigure from './AIUnconfigure'
import { AiSettingProvider } from './contexts/AiSettingContext'

const AiSettingContent = () => {
  return (
    <InsidePage
      className="overflow-y-auto pb-PAGE_INSIDE_B"
      pageTitle={$t('AI 模型')}
      description={$t('配置好 AI 模型后，你可以使用对应的大模型来创建 AI 服务')}
      showBorder={false}
      scrollPage={false}
    >
      <div className="flex flex-col h-full">
        <Tabs
          className="flex-shrink-0"
          items={[
            {
              key: 'flow',
              label: $t('已设置'),
              children: <AIFlowChart />
            },
            {
              key: 'config',
              label: $t('未设置'),
              children: (
                <div className="overflow-auto flex-grow">
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
