import InsidePage from "@common/components/aoplatform/InsidePage"
import { $t } from '@common/locales/index.ts'
import { IntegrationAIContainer } from "./IntegrationAIContainer"
import { Tool } from "@modelcontextprotocol/sdk/types.js"
import { useEffect, useState } from "react"
import McpToolsContainer from "./McpToolsContainer"
import { useGlobalContext } from "@common/contexts/GlobalStateContext"

const McpServiceContainer = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [, forceUpdate] = useState<unknown>(null)
  const { state } = useGlobalContext()
  const handleToolsChange = (value: Tool[]) => {
    setTools(value)
  }
  useEffect(() => {
    forceUpdate({})
  }, [state.language])
  return (
    <>
      <InsidePage
        pageTitle={$t('MCP 服务')}
        description={$t('MCP Service 充当 AI 模型与 API 之间的桥梁，允许智能助手（如 Claude）动态发现和调用 Gateway 上的 API，无需繁琐的手动配置或自定义集成。')}
        showBorder={false}
        scrollPage={false}
      >
        
        <div className="flex mt-[10px] pr-[40px]">
          <McpToolsContainer tools={tools} />
          <IntegrationAIContainer type={'global'} handleToolsChange={handleToolsChange}></IntegrationAIContainer>
        </div>
      </InsidePage>
    </>
  )
}

export default McpServiceContainer