'use client'

import { Icon } from '@iconify/react'
import type { Edge, Node } from '@xyflow/react'
import { addEdge, Background, Controls, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import React, { useCallback } from 'react'
import './styles.css'

interface ModelCardProps {
  title: string
  status: 'success' | 'failure'
  defaultModel: string
  onSettingClick?: () => void
}

const ModelCard: React.FC<ModelCardProps> = ({ title, status, defaultModel, onSettingClick }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 w-[280px] border border-[#ededed]">
    <div className="flex justify-between items-center mb-3">
      <div className="flex gap-2 items-center">
        <Icon icon="mdi:robot" className="text-xl text-[--primary-color]" />
        <span className="font-medium text-gray-800">{title}</span>
      </div>
      <div className="flex gap-2 items-center">
        <span
          className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          title={status === 'success' ? 'Connected' : 'Disconnected'}
        />
        <Icon
          icon="mdi:cog"
          className="text-xl text-gray-400 cursor-pointer hover:text-[--primary-color]"
          onClick={onSettingClick}
        />
      </div>
    </div>
    <div className="text-sm text-gray-500">{defaultModel}</div>
  </div>
)

interface KeyStatusCardProps {
  keys: Array<'success' | 'failure'>
  title: string
}

const KeyStatusCard: React.FC<KeyStatusCardProps> = ({ keys, title }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 w-[280px] border border-[#ededed]">
    <div className="flex items-center mb-3">
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {keys.map((status, index) => (
        <div
          key={index}
          className={`aspect-square rounded-md ${status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          title={status === 'success' ? 'Active' : 'Inactive'}
        />
      ))}
    </div>
  </div>
)

const ServiceCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 w-[200px] border border-[#ededed]">
    <div className="flex flex-col gap-3 items-center">
      <Icon icon="mdi:robot" className="text-3xl text-[--primary-color]" />
      <span className="font-medium text-gray-800">AI Service</span>
    </div>
  </div>
)

const initialNodes: Node[] = [
  {
    id: 'service',
    type: 'custom',
    position: { x: 50, y: 100 },
    data: { component: <ServiceCard /> }
  },
  {
    id: 'openai',
    type: 'custom',
    position: { x: 400, y: 50 },
    data: {
      component: <ModelCard title="OpenAI" status="success" defaultModel="gpt-4" />
    }
  },
  {
    id: 'anthropic',
    type: 'custom',
    position: { x: 400, y: 200 },
    data: {
      component: <ModelCard title="Anthropic" status="success" defaultModel="claude-2" />
    }
  },
  {
    id: 'gemini',
    type: 'custom',
    position: { x: 400, y: 350 },
    data: {
      component: <ModelCard title="Google Gemini" status="failure" defaultModel="gemini-pro" />
    }
  },
  {
    id: 'openai-keys',
    type: 'custom',
    position: { x: 750, y: 50 },
    data: {
      component: <KeyStatusCard title="API Keys" keys={['success', 'success', 'failure', 'success']} />
    }
  },
  {
    id: 'anthropic-keys',
    type: 'custom',
    position: { x: 750, y: 200 },
    data: {
      component: <KeyStatusCard title="API Keys" keys={['success', 'success', 'success']} />
    }
  },
  {
    id: 'gemini-keys',
    type: 'custom',
    position: { x: 750, y: 350 },
    data: {
      component: <KeyStatusCard title="API Keys" keys={['failure', 'failure']} />
    }
  }
]

const initialEdges: Edge[] = [
  { id: 'service-openai', source: 'service', target: 'openai', animated: true, label: 'Connected' },
  { id: 'service-anthropic', source: 'service', target: 'anthropic', animated: true, label: 'Connected' },
  { id: 'service-gemini', source: 'service', target: 'gemini', animated: true, label: 'Disconnected' },
  { id: 'openai-keys', source: 'openai', target: 'openai-keys', animated: true },
  { id: 'anthropic-keys', source: 'anthropic', target: 'anthropic-keys', animated: true },
  { id: 'gemini-keys', source: 'gemini', target: 'gemini-keys', animated: true }
]

const Playground: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  return (
    <div className="w-full h-screen bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default Playground
