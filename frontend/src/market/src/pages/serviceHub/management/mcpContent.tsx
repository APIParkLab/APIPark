import { $t } from '@common/locales'
import { IntegrationAIContainer } from '@core/pages/mcpService/IntegrationAIContainer'
import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { useEffect, useState } from 'react'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import McpToolsContainer from '@core/pages/mcpService/McpToolsContainer'
import { useParams } from 'react-router-dom'
import { RouterParams } from '@common/const/type'

const mcpContent = () => {
  const [tools, setTools] = useState<Tool[]>([])
  const [, forceUpdate] = useState<unknown>(null)
  const { teamId, appId } = useParams<RouterParams>()
  const { state } = useGlobalContext()
  const handleToolsChange = (value: Tool[]) => {
    setTools(value)
  }
  useEffect(() => {
    forceUpdate({})
  }, [state.language])
  return (
    <div className=" h-full pt-[32px]">
      <div className="flex items-center justify-between w-full ml-[10px] text-[18px] leading-[25px] pb-[16px]">
        <span className="font-bold">{$t('MCP 服务')}</span>
      </div>
      <div className="h-[calc(100%-41px)] flex flex-col ">
        <div className="flex mt-[10px] pr-[40px]">
          <McpToolsContainer tools={tools} />
          <IntegrationAIContainer
            consumerParams={{ consumerId: appId!, teamId: teamId! }}
            type={'consumer'}
            handleToolsChange={handleToolsChange}
          ></IntegrationAIContainer>
        </div>
      </div>
    </div>
  )
}

export default mcpContent
