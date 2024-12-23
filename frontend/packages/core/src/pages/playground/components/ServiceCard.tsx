import { Icon } from '@iconify/react'
import { Handle, Position } from '@xyflow/react'
import React from 'react'

const ServiceCard: React.FC = () => (
  <div className="node-card bg-white rounded-lg shadow-sm p-4 min-w-[150px] relative">
    <Handle type="source" position={Position.Right} />
    <div className="flex flex-col gap-2 items-center">
      <Icon icon="mdi:robot" className="text-3xl text-[--primary-color]" />
      <span className="text-base text-gray-900">AI Service</span>
    </div>
  </div>
)

export default ServiceCard
