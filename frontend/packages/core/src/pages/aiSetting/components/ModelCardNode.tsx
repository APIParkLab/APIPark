import { Icon } from '@iconify/react'
import { Handle, Position } from '@xyflow/react'
import { t } from 'i18next'
import React from 'react'
import { ModelStatus } from '../types'

interface ModelCardData {
  title: string
  status: ModelStatus
  logo: string
  defaultModel: string
}

type ModelCardNodeData = ModelCardData & {
  id: string
  position: { x: number; y: number }
}

export const ModelCardNode: React.FC<{ data: ModelCardNodeData }> = ({ data }) => {
  const { title, status, defaultModel, logo } = data
  return (
    <div
      className="node-card bg-white rounded-lg shadow-sm p-4 min-w-[280px]  group"
      style={{ border: '1px solid var(--border-color)' }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <div className="flex flex-1 overflow-hidden items-center  gap-[4px]">
              <span
                className=" flex items-center h-[22px]  ai-setting-svg-container"
                dangerouslySetInnerHTML={{ __html: logo }}
              ></span>
            </div>
            <span className="text-base text-gray-900 max-w-[180px] truncate">{title}</span>
            <Icon
              icon={status === 'enable' ? 'mdi:check-circle' : 'mdi:close-circle'}
              className={`text-xl ${status === 'enable' ? 'text-green-500' : 'text-red-500'}`}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 transition-opacity duration-200">
            <Icon
              icon="mdi:cog"
              className="text-xl text-gray-400 cursor-pointer hover:text-[--primary-color]"
              onClick={() => console.log('Default:', data.id)}
            />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {t('默认：')}
          {defaultModel}
        </div>
      </div>
    </div>
  )
}
