'use client'

import { Icon } from '@iconify/react'
import type { Edge, Node } from '@xyflow/react'
import { addEdge, Background, Controls, Handle, Position, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
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
  <div className="node-card bg-white rounded-lg shadow-sm p-4 min-w-[280px] relative">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center">
        <Icon icon="mdi:robot" className="text-xl text-[--primary-color]" />
        <span className="text-base text-gray-900">{title}</span>
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
    <div className="mt-2 text-sm text-gray-500">{defaultModel}</div>
  </div>
)

interface KeyStatusCardProps {
  keys: Array<'success' | 'failure'>
  title: string
}

const KeyStatusCard: React.FC<KeyStatusCardProps> = ({ keys, title }) => (
  <div className="node-card bg-white rounded-lg shadow-sm p-4 min-w-[280px] relative">
    <Handle type="target" position={Position.Left} />
    <div className="mb-3 text-sm text-gray-900">{title}</div>
    <div className="grid grid-cols-4 gap-2">
      {keys.map((status, index) => (
        <div
          key={index}
          className={`
            aspect-square rounded-md 
            ${status === 'success' ? 'bg-green-500' : 'bg-red-500'}
            transition-transform hover:scale-105
          `}
          title={status === 'success' ? 'Active' : 'Inactive'}
        />
      ))}
    </div>
  </div>
)

const ServiceCard: React.FC = () => (
  <div className="node-card bg-white rounded-lg shadow-sm p-4 min-w-[200px] relative">
    <Handle type="source" position={Position.Right} />
    <div className="flex flex-col gap-2 items-center">
      <Icon icon="mdi:robot" className="text-3xl text-[--primary-color]" />
      <span className="text-base text-gray-900">AI Service</span>
    </div>
  </div>
)

const initialNodes: Node[] = [
  {
    id: 'service',
    type: 'default',
    position: { x: 50, y: 100 },
    data: { label: <ServiceCard /> }
  },
  {
    id: 'openai',
    type: 'default',
    position: { x: 400, y: 50 },
    data: {
      label: <ModelCard title="OpenAI" status="success" defaultModel="gpt-4" />
    }
  },
  {
    id: 'anthropic',
    type: 'default',
    position: { x: 400, y: 200 },
    data: {
      label: <ModelCard title="Anthropic" status="success" defaultModel="claude-2" />
    }
  },
  {
    id: 'gemini',
    type: 'default',
    position: { x: 400, y: 350 },
    data: {
      label: <ModelCard title="Google Gemini" status="failure" defaultModel="gemini-pro" />
    }
  },
  {
    id: 'openai-keys',
    type: 'default',
    position: { x: 750, y: 50 },
    data: {
      label: <KeyStatusCard title="API Keys" keys={['success', 'success', 'failure', 'success']} />
    }
  },
  {
    id: 'anthropic-keys',
    type: 'default',
    position: { x: 750, y: 200 },
    data: {
      label: <KeyStatusCard title="API Keys" keys={['success', 'success', 'success']} />
    }
  },
  {
    id: 'gemini-keys',
    type: 'default',
    position: { x: 750, y: 350 },
    data: {
      label: <KeyStatusCard title="API Keys" keys={['failure', 'failure']} />
    }
  }
]

const initialEdges: Edge[] = [
  {
    id: 'service-openai',
    source: 'service',
    target: 'openai',
    animated: true,
    label: 'apis',
    style: { stroke: '#3d46f2', cursor: 'pointer' }
  },
  {
    id: 'service-anthropic',
    source: 'service',
    target: 'anthropic',
    animated: true,
    label: 'apis',
    style: { stroke: '#3d46f2', cursor: 'pointer' }
  },
  {
    id: 'service-gemini',
    source: 'service',
    target: 'gemini',
    animated: true,
    label: 'apis',
    style: { stroke: '#3d46f2', cursor: 'pointer' }
  },
  {
    id: 'openai-keys',
    source: 'openai',
    target: 'openai-keys',
    animated: true,
    style: { stroke: '#3d46f2' }
  },
  {
    id: 'anthropic-keys',
    source: 'anthropic',
    target: 'anthropic-keys',
    animated: true,
    style: { stroke: '#3d46f2' }
  },
  {
    id: 'gemini-keys',
    source: 'gemini',
    target: 'gemini-keys',
    animated: true,
    style: { stroke: '#3d46f2' }
  }
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
