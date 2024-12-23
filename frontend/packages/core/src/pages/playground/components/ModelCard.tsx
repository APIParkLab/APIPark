import { Icon } from '@iconify/react'
import { Handle, Position } from '@xyflow/react'
import React from 'react'
import { ModelCardStatus } from './types'

interface ModelCardProps {
  title: string
  status: ModelCardStatus
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

export default ModelCard
