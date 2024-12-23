import { Icon } from '@iconify/react'
import { Handle, NodeProps, Position } from '@xyflow/react'
import React from 'react'
import { ModelCardStatus } from './types'

interface KeyStatus {
  status: ModelCardStatus
  keyID: number | string
  priority?: number
}

interface KeyStatusNodeData {
  title: string
  keys: KeyStatus[]
}

interface ModelCardData {
  title: string
  status: ModelCardStatus
  defaultModel: string
}

type ModelCardNodeData = ModelCardData & {
  id: string
  position: { x: number; y: number }
}

const KEY_SIZE = '1.25rem' // 20px
const KEY_GAP = '0.25rem' // 4px
const MAX_KEYS = 10

export const KeyStatusNode: React.FC<NodeProps<KeyStatusNodeData>> = ({ data }) => {
  const { title, keys = [] } = data
  const totalKeys = keys.length
  const keyWidth = totalKeys > 5 ? `calc((100% - ${(totalKeys - 1) * 0.25}rem) / ${totalKeys})` : KEY_SIZE

  return (
    <div className="relative p-4 bg-white rounded-lg shadow-sm node-card">
      <Handle type="target" position={Position.Left} />
      <div className="flex flex-col gap-2">
        <div className="text-sm text-gray-900">{title}</div>
        <div
          className="flex gap-1 w-full"
          style={{
            maxWidth: `calc(${MAX_KEYS} * ${KEY_SIZE} + (${MAX_KEYS} - 1) * ${KEY_GAP})`,
            minHeight: KEY_SIZE
          }}
        >
          {keys
            .sort((a, b) => (a.priority || 0) - (b.priority || 0))
            .map((key) => (
              <div
                key={key.keyID}
                style={{
                  width: keyWidth,
                  height: KEY_SIZE
                }}
                className={`
                  rounded-md flex-shrink-0
                  ${key.status === 'success' ? 'bg-green-500' : 'bg-red-500'}
                  transition-all duration-200 hover:opacity-80
                `}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

export const ModelCardNode: React.FC<NodeProps<ModelCardNodeData>> = ({ data }) => {
  const { title, status, defaultModel } = data
  return (
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
        <Icon icon="mdi:cog" className="text-xl text-gray-400 cursor-pointer hover:text-[--primary-color]" />
      </div>
      <div className="mt-2 text-sm text-gray-500">{defaultModel}</div>
    </div>
  )
}

export const ServiceCardNode: React.FC<NodeProps> = () => {
  return (
    <div className="node-card bg-white rounded-lg shadow-sm p-4 min-w-[150px] relative">
      <Handle type="source" position={Position.Right} />
      <div className="flex flex-col gap-2 items-center">
        <Icon icon="mdi:robot" className="text-3xl text-[--primary-color]" />
        <span className="text-base text-gray-900">AI Service</span>
      </div>
    </div>
  )
}
