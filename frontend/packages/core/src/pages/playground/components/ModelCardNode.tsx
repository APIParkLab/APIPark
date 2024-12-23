import { Icon } from '@iconify/react'
import { Handle, Position } from '@xyflow/react'
import React, { useCallback, useState } from 'react'
import { ModelCardStatus } from './types'

interface ModelCardData {
  title: string
  status: ModelCardStatus
  defaultModel: string
  onDragStart?: () => void
}

type ModelCardNodeData = ModelCardData & {
  id: string
  position: { x: number; y: number }
}

export const ModelCardNode: React.FC<{ data: ModelCardNodeData }> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false)
  const { title, status, defaultModel } = data

  const onDragHandleMouseDown = useCallback((event: React.MouseEvent) => {
    // Prevent event propagation to allow dragging
    event.stopPropagation()

    // Create a new drag event
    const dragEvent = new MouseEvent('mousedown', {
      clientX: event.clientX,
      clientY: event.clientY,
      bubbles: true
    })
    // Find the node element and dispatch the event
    const nodeElement = event.currentTarget.closest('.react-flow__node')
    if (nodeElement) {
      // Use the global `document` object if it exists
      nodeElement.dispatchEvent(dragEvent)
    }
  }, [])

  return (
    <div
      className="node-card bg-white rounded-lg shadow-sm p-4 min-w-[280px] relative group nodrag"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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

        {/* Action buttons */}
        <div className="flex gap-2 transition-opacity duration-200">
          <Icon
            icon="mdi:cog"
            className="text-xl text-gray-400 cursor-pointer hover:text-[--primary-color]"
            onClick={() => console.log('Settings', data.id)}
          />
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-500">{defaultModel}</div>
    </div>
  )
}
