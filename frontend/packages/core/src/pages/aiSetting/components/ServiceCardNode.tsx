import { Icon } from '@iconify/react'
import { Handle, NodeProps, Position } from '@xyflow/react'
import React from 'react'

export const ServiceCardNode: React.FC<NodeProps> = () => {
  return (
    <div
      className="node-card bg-white rounded-lg shadow-sm p-4 min-w-[150px] relative nodrag"
      style={{ border: '1px solid var(--border-color)' }}
    >
      <Handle type="source" position={Position.Right} />
      <div className="flex flex-col gap-2 items-center">
        <Icon icon="mdi:robot" className="text-3xl text-[--primary-color]" />
        <span className="text-base text-gray-900">AI Service</span>
      </div>
    </div>
  )
}
