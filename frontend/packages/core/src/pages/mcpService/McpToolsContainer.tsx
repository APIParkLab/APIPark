import { Icon } from '@iconify/react/dist/iconify.js'
import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { Card } from 'antd'

const McpToolsContainer = ({ tools = [] }: { tools: Tool[] }) => {
  return (
    <>
      <Card
        style={{ borderRadius: '10px' }}
        className={`w-full flex-1 mr-[10px]`}
        classNames={{
          body: 'p-[10px]'
        }}
      >
        <div className="mb-[10px]">
          <Icon icon="gravity-ui:plug-connection" className="align-text-bottom mr-[5px]" width="16" height="16" />
          <span className="text-[14px] font-bold align-middle">Tools</span>
        </div>
        {tools.map((tool, index) => (
          <Card style={{ borderRadius: '10px' }} key={index} className={`w-full ${index > 0 ? 'mt-[10px]' : ''}`}>
            <p className="text-[14px] font-bold">{tool.name}</p>
            <div className="leading-[28px]">{tool.description}</div>
          </Card>
        ))}
      </Card>
    </>
  )
}

export default McpToolsContainer
