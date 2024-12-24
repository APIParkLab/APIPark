'use client'

import { useFetch } from '@common/hooks/http'
import { addEdge, NodeTypes, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useState } from 'react'
import { KeyStatusNode } from './components/KeyStatusNode'
import { ModelCardNode } from './components/ModelCardNode'
import { ServiceCardNode } from './components/NodeComponents'
import { ModelData } from './components/types'
import { LAYOUT } from './constants'
import './styles.css'

interface ApiResponse {
  data: {
    backup: {
      id: string
      name: string
    }
    providers: ModelData[]
  }
  code: number
  success: string
}

const calculateNodePositions = (models: ModelData[], startY = LAYOUT.NODE_START_Y, gap = LAYOUT.NODE_GAP) => {
  return models.reduce(
    (acc, model, index) => {
      acc[model.id] = {
        x: LAYOUT.MODEL_NODE_X,
        y: startY + index * gap
      }
      acc[`${model.id}-keys`] = {
        x: LAYOUT.KEY_NODE_X,
        y: startY + index * gap
      }
      return acc
    },
    {} as Record<string, { x: number; y: number }>
  )
}

const nodeTypes: NodeTypes = {
  modelCard: ModelCardNode,
  keyCard: KeyStatusNode,
  serviceCard: ServiceCardNode
} as const

const AIFlowChart = () => {
  const [modelData, setModelData] = useState<ModelData[]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fetchData } = useFetch()

  useEffect(() => {
    // Mock API call - replace with actual API call
    fetchData<ApiResponse>('ai/providers/configured', {
      method: 'GET',
      eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
    }).then((response) => {
      const mockApiResponse: ApiResponse = response as ApiResponse
      setModelData(mockApiResponse.data.providers)
    })
  }, [])

  useEffect(() => {
    if (!modelData.length) return

    const newNodes = [
      {
        id: 'service',
        type: 'serviceCard',
        position: { x: LAYOUT.SERVICE_NODE_X, y: LAYOUT.NODE_START_Y },
        data: {}
      },
      ...modelData.map((model) => ({
        id: model.id,
        type: 'modelCard',
        position: calculateNodePositions(modelData)[model.id],
        data: {
          title: model.name,
          status: model.status,
          defaultModel: model.default_llm,
          logo: model.logo
        }
      })),
      ...modelData.map((model) => ({
        id: `${model.id}-keys`,
        type: 'keyCard',
        position: calculateNodePositions(modelData)[`${model.id}-keys`],
        data: {
          title: 'API Keys',
          keys: model.keys.map((key, index) => ({
            id: key.id,
            status: key.status === 'normal' ? 'enabled' : 'disable',
            priority: index + 1
          }))
        }
      }))
    ]

    const newEdges = [
      ...modelData.map((model) => ({
        id: `service-${model.id}`,
        source: 'service',
        target: model.id,
        label: `apis(${model.api_count})`,
        style: { stroke: '#ddd', cursor: 'pointer' },
        type: 'smoothstep',
        markerEnd: { type: 'arrow' }
      })),
      ...modelData.map((model) => ({
        id: `${model.id}-keys`,
        source: model.id,
        type: 'smoothstep',
        target: `${model.id}-keys`,
        animated: true,
        style: { stroke: '#ddd' }
      }))
    ]

    setNodes(newNodes)
    setEdges(newEdges)
  }, [modelData])

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onNodeDrag = useCallback(
    (_: any, node: any) => {
      if (node.type !== 'modelCard') return

      setNodes((nds) => {
        return nds.map((n) => {
          if (n.type === 'keyCard' && n.id === `${node.id}-keys`) {
            return {
              ...n,
              position: {
                x: LAYOUT.KEY_NODE_X,
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
      if (node.type !== 'modelCard') return

      setNodes((nds) => {
        const modelNodes = nds.filter((n) => n.type === 'modelCard')
        const sortedNodes = [...modelNodes].sort((a, b) => a.position.y - b.position.y)

        return nds.map((n) => {
          if (n.type === 'modelCard') {
            const index = sortedNodes.findIndex((sn) => sn.id === n.id)
            return {
              ...n,
              position: {
                x: LAYOUT.MODEL_NODE_X,
                y: LAYOUT.NODE_START_Y + index * LAYOUT.NODE_GAP
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
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      />
    </div>
  )
}

export default AIFlowChart
