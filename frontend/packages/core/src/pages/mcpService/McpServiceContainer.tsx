import InsidePage from "@common/components/aoplatform/InsidePage"
import { $t } from '@common/locales/index.ts'
import { Card } from "antd"
import IntegrationAIContainer from "./IntegrationAIContainer"

const McpServiceContainer = () => {
  const handleApiKeyChange = (value: string) => {
    console.log(value)
  }
  return (
    <>
      <InsidePage
        pageTitle={$t('MCP 服务')}
        description={$t('MCP Service 充当 AI 模型与 API 之间的桥梁，允许智能助手（如 Claude）动态发现和调用 Gateway 上的 API，无需繁琐的手动配置或自定义集成。')}
        showBorder={false}
        scrollPage={false}
      >
        <div className="flex mt-[10px] pr-[40px]">
        <Card style={{ borderRadius: '10px' }} className="flex-1 w-[400px] mr-[10px]">
          444
        </Card>
        <IntegrationAIContainer type={'global'} handleApiKeyChange={handleApiKeyChange}></IntegrationAIContainer>
        </div>
      </InsidePage>
    </>
  )
}

export default McpServiceContainer