import InsidePage from '@common/components/aoplatform/InsidePage'
import { $t } from '@common/locales'
import React from 'react'

const KeySettings: React.FC = () => {
  return (
    <InsidePage
      className="overflow-y-auto pb-PAGE_INSIDE_B"
      pageTitle={$t('key 模型')}
      description={$t('配置好 AI 模型后，你可以使用对应的大模型来创建 AI 服务')}
      showBorder={false}
      scrollPage={false}
    ></InsidePage>
  )
}

export default KeySettings
