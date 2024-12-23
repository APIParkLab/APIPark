import { Handle, Position } from '@xyflow/react'
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

const KEY_SIZE = '1.25rem' // 20px
const KEY_GAP = '0.25rem' // 4px
const MAX_KEYS = 10

export const KeyStatusNode: React.FC<{ data: KeyStatusNodeData }> = ({ data }) => {
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