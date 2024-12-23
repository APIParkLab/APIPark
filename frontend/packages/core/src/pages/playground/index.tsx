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
  { id: 'gemini', type: 'gemini', title: 'Google Gemini', status: 'failure', defaultModel: 'gemini-pro' },
  { id: 'mistral', type: 'mistral', title: 'Mistral AI', status: 'success', defaultModel: 'mistral-medium' },
  { id: 'cohere', type: 'cohere', title: 'Cohere', status: 'success', defaultModel: 'command' },
  { id: 'azure', type: 'azure', title: 'Azure OpenAI', status: 'success', defaultModel: 'gpt-4-turbo' }
]

const calculateNodePositions = (models: ModelData[], startY = 50, gap = 120) => {
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
    position: { x: 50, y: 50 },
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
    type: 'keyCard',
    position: calculateNodePositions(modelData)['openai-keys'],
    data: {
      title: 'API Keys',
      keys: [
        { keyID: 1, status: 'success', priority: 1 },
        { keyID: 2, status: 'success', priority: 2 },
        { keyID: 3, status: 'failure', priority: 3 },
        { keyID: 4, status: 'success', priority: 4 },
        { keyID: 5, status: 'success', priority: 5 },
        { keyID: 6, status: 'failure', priority: 6 },
        { keyID: 7, status: 'success', priority: 7 },
        { keyID: 8, status: 'success', priority: 8 },
        { keyID: 9, status: 'failure', priority: 9 },
        { keyID: 10, status: 'success', priority: 10 },
        { keyID: 11, status: 'success', priority: 11 },
        { keyID: 12, status: 'failure', priority: 12 },
        { keyID: 13, status: 'success', priority: 13 },
        { keyID: 14, status: 'success', priority: 14 },
        { keyID: 15, status: 'failure', priority: 15 },
        { keyID: 16, status: 'success', priority: 16 },
        { keyID: 17, status: 'success', priority: 17 },
        { keyID: 18, status: 'failure', priority: 18 },
        { keyID: 19, status: 'success', priority: 19 },
        { keyID: 20, status: 'success', priority: 20 }
      ]
    }
  },
  {
    id: 'anthropic-keys',
    type: 'keyCard',
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
    type: 'keyCard',
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
  },
  {
    id: 'mistral-keys',
    type: 'keyCard',
    position: calculateNodePositions(modelData)['mistral-keys'],
    data: {
      title: 'API Keys',
      keys: []
    }
  },
  {
    id: 'cohere-keys',
    type: 'keyCard',
    position: calculateNodePositions(modelData)['cohere-keys'],
    data: {
      title: 'API Keys',
      keys: [
        { keyID: 1, status: 'failure', priority: 1 },
        { keyID: 2, status: 'success', priority: 2 },
        { keyID: 3, status: 'success', priority: 3 }
      ]
    }
  },
  {
    id: 'azure-keys',
    type: 'keyCard',
    position: calculateNodePositions(modelData)['azure-keys'],
    data: {
      title: 'API Keys',
      keys: [
        { keyID: 1, status: 'success', priority: 1 },
        { keyID: 2, status: 'success', priority: 2 },
        { keyID: 3, status: 'success', priority: 3 }
      ]
    }
  }
]

const initialEdges = [
  {
    id: 'service-openai',
    source: 'service',
    target: 'openai',
    label: 'apis(12)',
    style: { stroke: '#3d46f2', cursor: 'pointer' },
    labelStyle: { fill: '#3d46f2', fontSize: 12, cursor: 'pointer' }
  },
  {
    id: 'service-anthropic',
    source: 'service',
    target: 'anthropic',
    label: 'apis(8)',
    style: { stroke: '#3d46f2', cursor: 'pointer' },
    labelStyle: { fill: '#3d46f2', fontSize: 12, cursor: 'pointer' }
  },
  {
    id: 'service-gemini',
    source: 'service',
    target: 'gemini',
    label: 'apis(5)',
    style: { stroke: '#3d46f2', cursor: 'pointer' },
    labelStyle: { fill: '#3d46f2', fontSize: 12, cursor: 'pointer' }
  },
  {
    id: 'service-mistral',
    source: 'service',
    target: 'mistral',
    label: 'apis(4)',
    style: { stroke: '#3d46f2', cursor: 'pointer' },
    labelStyle: { fill: '#3d46f2', fontSize: 12, cursor: 'pointer' }
  },
  {
    id: 'service-cohere',
    source: 'service',
    target: 'cohere',
    label: 'apis(6)',
    style: { stroke: '#3d46f2', cursor: 'pointer' },
    labelStyle: { fill: '#3d46f2', fontSize: 12, cursor: 'pointer' }
  },
  {
    id: 'service-azure',
    source: 'service',
    target: 'azure',
    label: 'apis(10)',
    style: { stroke: '#3d46f2', cursor: 'pointer' },
    labelStyle: { fill: '#3d46f2', fontSize: 12, cursor: 'pointer' }
  },
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

  const onNodeDrag = useCallback(
    (_: any, node: any) => {
      // Update positions of connected nodes during drag
      setNodes((nds) => {
        return nds.map((n) => {
          if (n.type === 'keyCard' && n.id === `${node.id}-keys`) {
            return {
              ...n,
              position: {
                x: 750,
                y: node.position.y
              }
            }
          }
          return n
        })
      })
    },
    [setNodes]
  )

  const onNodeDragStop = useCallback(
    (_: any, node: any) => {
      // Reorder nodes based on vertical position
      setNodes((nds) => {
        const modelNodes = nds.filter((n) => n.type === 'modelCard')
        const sortedNodes = [...modelNodes].sort((a, b) => a.position.y - b.position.y)

        return nds.map((n) => {
          if (n.type === 'modelCard') {
            const index = sortedNodes.findIndex((sn) => sn.id === n.id)
            return {
              ...n,
              position: {
                x: 400,
                y: 50 + index * 120
              }
            }
          }
          if (n.type === 'keyCard') {
            const modelId = n.id.replace('-keys', '')
            const modelNode = sortedNodes.find((mn) => mn.id === modelId)
            if (modelNode) {
              const index = sortedNodes.findIndex((sn) => sn.id === modelId)
              return {
                ...n,
                position: {
                  x: 750,
                  y: 50 + index * 120
                }
              }
            }
          }
          return n
        })
      })
    },
    [setNodes]
  )

  return (
    <div className="w-full h-screen bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: 'step',
          style: { stroke: '#3d46f2', strokeWidth: 2 },
          animated: true
        }}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
      />
    </div>
  )
}

export default Playground
