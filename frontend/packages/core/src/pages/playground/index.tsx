'use client'

import { Icon } from '@iconify/react'
import type { Edge, Node } from '@xyflow/react'
import { addEdge, Background, Controls, Handle, Position, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import React, { useCallback } from 'react'
import './styles.css'

interface ModelCardProps {
  title: string
  status: ModelCardStatus
  defaultModel: string
  onSettingClick?: () => void
}

export type ModelCardStatus = 'success' | 'failure'

const ModelCard: React.FC<ModelCardProps> = ({ title, status, defaultModel, onSettingClick }) => (
  <div className="node-card bg-white rounded-lg shadow-sm p-4 min-w-[280px] relative">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center">
        <Icon icon="mdi:robot" className="text-xl text-[--primary-color]" />
        <span className="text-base text-gray-900">{title}</span>
        <Icon
          icon={status === 'success' ? 'mdi:check-circle' : 'mdi:close-circle'}
          className={`text-xl ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}
        />
      </div>
      <Icon
        icon="mdi:cog"
        className="text-xl text-gray-400 cursor-pointer hover:text-[--primary-color]"
        onClick={onSettingClick}
      />
    </div>
    <div className="mt-2 text-sm text-gray-500">{defaultModel}</div>
  </div>
)

interface KeyStatus {
  status: ModelCardStatus
  keyID: number | string
}

interface KeyStatusCardProps {
  keys: KeyStatus[]
  title: string
}

const KeyStatusCard: React.FC<KeyStatusCardProps> = ({ keys, title }) => (
  <div className="relative p-4 bg-white rounded-lg shadow-sm node-card">
    <Handle type="target" position={Position.Left} />
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-900">{title}</div>
      <div className="flex flex-wrap gap-2 max-w-[300px]">
        {keys.map((key) => (
          <div
            key={key.keyID}
            className={`
              w-6 h-6 rounded-md 
              ${key.status === 'success' ? 'bg-green-500' : 'bg-red-500'}
              transition-transform hover:scale-105
            `}
          />
        ))}
      </div>
    </div>
  </div>
)

const ServiceCard: React.FC = () => (
  <div className="node-card bg-white rounded-lg shadow-sm p-4 min-w-[150px] relative">
    <Handle type="source" position={Position.Right} />
    <div className="flex flex-col gap-2 items-center">
      <Icon icon="mdi:robot" className="text-3xl text-[--primary-color]" />
      <span className="text-base text-gray-900">AI Service</span>
    </div>
  </div>
)

const calculateNodePositions = (models: Array<{ id: string; type: string }>, startY = 50, gap = 150) => {
  return models.reduce(
    (acc, model, index) => {
      acc[model.id] = {
        x: 400,
        y: startY + index * gap
      }
      acc[`${model.id}-keys`] = {
        x: 750,
        y: startY + index * gap
      }
      return acc
    },
    {} as Record<string, { x: number; y: number }>
  )
}

const modelData = [
  { id: 'openai', type: 'openai', title: 'OpenAI', status: 'success', defaultModel: 'gpt-4' },
  { id: 'anthropic', type: 'anthropic', title: 'Anthropic', status: 'success', defaultModel: 'claude-2' },
  { id: 'gemini', type: 'gemini', title: 'Google Gemini', status: 'failure', defaultModel: 'gemini-pro' }
]

const positions = calculateNodePositions(modelData)

const initialNodes: Node[] = [
  {
    id: 'service',
    type: 'default',
    position: { x: 50, y: 200 },
    data: { label: <ServiceCard /> }
  },
  ...modelData.map((model) => ({
    id: model.id,
    type: 'default',
    position: positions[model.id],
    data: {
      label: <ModelCard title={model.title} status={model.status} defaultModel={model.defaultModel} />
    }
  })),
  {
    id: 'openai-keys',
    type: 'default',
    position: positions['openai-keys'],
    data: {
      label: (
        <KeyStatusCard
          title="API Keys"
          keys={Array(12)
            .fill(null)
            .map((_, i) => ({
              status: i < 8 ? 'success' : 'failure',
              keyID: `key${i + 1}`
            }))}
        />
      )
    }
  },
  {
    id: 'anthropic-keys',
    type: 'default',
    position: positions['anthropic-keys'],
    data: {
      label: (
        <KeyStatusCard
          title="API Keys"
          keys={Array(3)
            .fill(null)
            .map((_, i) => ({
              status: 'success',
              keyID: `key${i + 1}`
            }))}
        />
      )
    }
  },
  {
    id: 'gemini-keys',
    type: 'default',
    position: positions['gemini-keys'],
    data: {
      label: (
        <KeyStatusCard
          title="API Keys"
          keys={Array(2)
            .fill(null)
            .map((_, i) => ({
              status: 'failure',
              keyID: `key${i + 1}`
            }))}
        />
      )
    }
  }
]

const initialEdges: Edge[] = [
  ...modelData.map((model) => ({
    id: `service-${model.id}`,
    source: 'service',
    target: model.id,
    animated: true,
    label: 'apis',
    style: { stroke: '#3d46f2', cursor: 'pointer' }
  })),
  ...modelData.map((model) => ({
    id: `${model.id}-keys`,
    source: model.id,
    target: `${model.id}-keys`,
    animated: true,
    style: { stroke: '#3d46f2' }
  }))
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
