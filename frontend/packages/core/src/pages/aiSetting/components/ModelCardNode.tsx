import { Icon } from '@iconify/react'
import { Handle, Position } from '@xyflow/react'
import { t } from 'i18next'
import React from 'react'
import { useAiSetting } from '../contexts/AiSettingContext'
import { AiSettingListItem, ModelDetailData, ModelStatus } from '../types'

type ModelCardNodeData = ModelDetailData & {
  id: string
  position: { x: number; y: number }
}

export const ModelCardNode: React.FC<{ data: ModelCardNodeData }> = ({ data }) => {
  const { name, status, defaultLlm, logo } = data
  const { openConfigModal } = useAiSetting()

  const getStatusIcon = (status: ModelStatus) => {
    switch (status) {
      case 'enabled':
        return { icon: 'mdi:check-circle', color: 'text-green-500' }
      case 'disabled':
        return { icon: 'mdi:pause-circle', color: 'text-gray-400' }
      case 'abnormal':
        return { icon: 'mdi:alert-circle', color: 'text-red-500' }
    }
  }

  const statusConfig = getStatusIcon(status)

  return (
    <div
      className="node-card bg-white rounded-lg shadow-sm p-4 min-w-[280px] group"
      style={{ border: '1px solid var(--border-color)' }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <div className="flex flex-1 overflow-hidden items-center gap-[4px]">
              <span
                className="flex items-center h-[22px] ai-setting-svg-container"
                dangerouslySetInnerHTML={{ __html: logo }}
              ></span>
            </div>
            <span className="text-base text-gray-900 max-w-[180px] truncate">{name}</span>
            <Icon icon={statusConfig.icon} className={`text-xl ${statusConfig.color}`} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 transition-opacity duration-200">
            <Icon
              icon="mdi:cog"
              className="text-xl text-gray-400 cursor-pointer hover:text-[--primary-color]"
              onClick={() => {
                openConfigModal({ id: data.id, defaultLlm: defaultLlm } as AiSettingListItem)
              }}
            />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {t('默认：')}
          {defaultLlm}
        </div>
      </div>
    </div>
  )
}
