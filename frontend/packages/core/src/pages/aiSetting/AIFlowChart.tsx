'use client'

import { BasicResponse } from '@common/const/const'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http'
import {
  CoordinateExtent,
  Edge,
  EdgeTypes,
  Node,
  NodeTypes,
  PanOnScrollMode,
  ReactFlow,
  useEdgesState,
  useNodesState
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useState } from 'react'
import CustomEdge from './components/CustomEdge'
import { KeyStatusNode } from './components/KeyStatusNode'
import { ModelCardNode } from './components/ModelCardNode'
import { ServiceCardNode } from './components/NodeComponents'
import { LAYOUT } from './constants'
import './styles.css'
import { ModelData } from './types'

export type ApiResponse = BasicResponse<{
  backup: {
    id: string
    name: string
  }
  providers: ModelData[]
}>

const calculateNodePositions = (models: ModelData[], startY = LAYOUT.NODE_START_Y, gap = LAYOUT.NODE_GAP) => {
  return models.reduce(
    (acc, model, index) => {
      const y = startY + index * gap
      return {
        ...acc,
        [model.id]: {
          x: LAYOUT.MODEL_NODE_X,
          y
        },
        [`${model.id}-keys`]: {
          x: LAYOUT.KEY_NODE_X,
          y: y + 16
        }
      }
    },
    {} as Record<string, { x: number; y: number }>
  )
}

const nodeTypes: NodeTypes = {
  modelCard: ModelCardNode,
  keyCard: KeyStatusNode,
  serviceCard: ServiceCardNode
} as const

const edgeTypes: EdgeTypes = {
  custom: CustomEdge
}

const AIFlowChart = () => {
  const [modelData, setModelData] = useState<ModelData[]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const { fetchData } = useFetch()
  const { aiConfigFlushed } = useGlobalContext()

  useEffect(() => {
    fetchData<ApiResponse>('ai/providers/configured', {
      method: 'GET'
    }).then((response) => {
      const mockApiResponse: ApiResponse = response as ApiResponse
      setModelData(mockApiResponse.data.providers)
    })
  }, [aiConfigFlushed])

  useEffect(() => {
    if (!modelData.length) return

    const positions = calculateNodePositions(modelData)
    // subtract 5 to make sure the service node is aligned with the top model node
    const serviceY = positions[modelData[0].id].y - 5

    const newNodes = [
      {
        id: 'apiService',
        type: 'serviceCard',
        position: { x: LAYOUT.SERVICE_NODE_X, y: serviceY },
        data: {
          title: 'API Services',
          count: modelData.length
        }
      },
      ...modelData.map((model) => ({
        id: model.id,
        type: 'modelCard',
        position: positions[model.id],
        data: {
          title: model.name,
          status: model.status,
          defaultLlm: model.default_llm,
          logo: model.logo,
          id: model.id
        }
      })),
      ...modelData.map((model) => ({
        id: `${model.id}-keys`,
        type: 'keyCard',
        position: positions[`${model.id}-keys`],
        data: {
          title: '',
          keys: (model.keys || []).map((key, index) => ({
            id: key.id,
            status: key.status,
            priority: index + 1
          }))
        }
      }))
    ]

    const newEdges: any = [
      ...modelData.map((model) => ({
        id: `service-${model.id}`,
        source: 'apiService',
        target: model.id,
        label: `${model.api_count} apis`,
        data: { id: model.id },
        animated: true
      })),
      ...modelData.map((model) => ({
        id: `${model.id}-keys-edge`,
        source: model.id,
        target: `${model.id}-keys`,
        label: `${model.key_count} keys`,
        data: { id: model.id },
        animated: true
      }))
    ]

    setNodes(newNodes)
    setEdges(newEdges)
  }, [modelData])

  const calculateExtent = useCallback(() => {
    const left = LAYOUT.SERVICE_NODE_X
    const right = LAYOUT.KEY_NODE_X
    const top = 0 // Allow slight negative scroll to reduce top padding
    const bottom = LAYOUT.NODE_START_Y + modelData.length * LAYOUT.NODE_GAP
    return [
      [left, top],
      [right, bottom < 100 ? 5000 : bottom]
    ] as CoordinateExtent
  }, [modelData.length])

  const onNodeDrag: any = useCallback(
    (_: MouseEvent, node: Node<any>) => {
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

  const onNodeDragStop: any = useCallback(
    (_: any, node: Node<any>) => {
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
          if (n.type === 'keyCard') {
            const modelId = n.id.replace('-keys', '')
            const modelNode = sortedNodes.find((mn) => mn.id === modelId)
            if (modelNode) {
              const index = sortedNodes.findIndex((sn) => sn.id === modelId)
              return {
                ...n,
                position: {
                  x: LAYOUT.KEY_NODE_X,
                  y: LAYOUT.NODE_START_Y + index * LAYOUT.NODE_GAP + 16
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
    <div className="w-full" style={{ height: 'calc(-300px + 100vh)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDrag={onNodeDrag}
        proOptions={{ hideAttribution: true }}
        onNodeDragStop={onNodeDragStop}
        draggable={false}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Vertical}
        defaultEdgeOptions={{
          type: 'custom'
        }}
        translateExtent={calculateExtent()}
      />
    </div>
  )
}

export default AIFlowChart
