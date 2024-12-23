'use client'

import { addEdge, NodeTypes, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback } from 'react'
import { KeyStatusNode, ModelCardNode, ServiceCardNode } from './components/NodeComponents'
import { ModelData } from './components/types'
import './styles.css'

const modelData: ModelData[] = [
  { id: 'openai', type: 'openai', title: 'OpenAI', status: 'success', defaultModel: 'gpt-4' },
  { id: 'anthropic', type: 'anthropic', title: 'Anthropic', status: 'success', defaultModel: 'claude-2' },
  { id: 'gemini', type: 'gemini', title: 'Google Gemini', status: 'failure', defaultModel: 'gemini-pro' }
]

const calculateNodePositions = (models: ModelData[], startY = 50, gap = 150) => {
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

const nodeTypes: NodeTypes = {
  modelCard: ModelCardNode,
  keyStatus: KeyStatusNode,
  serviceCard: ServiceCardNode
} as const

const initialNodes = [
  {
    id: 'service',
    type: 'serviceCard',
    position: { x: 50, y: 200 },
    data: {}
  },
  ...modelData.map((model) => ({
    id: model.id,
    type: 'modelCard',
    position: calculateNodePositions(modelData)[model.id],
    data: {
      title: model.title,
      status: model.status,
      defaultModel: model.defaultModel
    }
  })),
  {
    id: 'openai-keys',
    type: 'keyStatus',
    position: calculateNodePositions(modelData)['openai-keys'],
    data: {
      title: 'API Keys',
      keys: [
        { keyID: 1, status: 'success', priority: 1 },
        { keyID: 2, status: 'success', priority: 2 },
        { keyID: 3, status: 'failure', priority: 3 }
      ]
    }
  },
  {
    id: 'anthropic-keys',
    type: 'keyStatus',
    position: calculateNodePositions(modelData)['anthropic-keys'],
    data: {
      title: 'API Keys',
      keys: [
        { keyID: 1, status: 'success', priority: 1 },
        { keyID: 2, status: 'success', priority: 2 }
      ]
    }
  },
  {
    id: 'gemini-keys',
    type: 'keyStatus',
    position: calculateNodePositions(modelData)['gemini-keys'],
    data: {
      title: 'API Keys',
      keys: [
        { keyID: 1, status: 'failure', priority: 1 },
        { keyID: 2, status: 'failure', priority: 2 },
        { keyID: 3, status: 'failure', priority: 3 },
        { keyID: 4, status: 'failure', priority: 4 }
      ]
    }
  }
]

const initialEdges = [
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

const Playground = () => {
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
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
      />
    </div>
  )
}

export default Playground
