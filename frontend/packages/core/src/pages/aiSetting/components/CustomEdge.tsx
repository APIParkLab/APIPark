import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from '@xyflow/react'

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16
  })

  const modelId = data?.id

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ stroke: '#ddd', cursor: 'pointer', strokeWidth: 1 }} />
      {label && (
        <EdgeLabelRenderer>
          <a
            href={`${label?.toString().includes('apis') ? '/aiapis' : '/keysetting'}?modelId=${modelId}`}
            target="_blank"
            style={{
              position: 'absolute',
              transform: `translate(${targetX - 80}px,${targetY - 20}px)`,
              borderRadius: '4px',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--primary-color)',
              cursor: 'pointer',
              pointerEvents: 'all',
              textDecoration: 'none'
            }}
            className="nodrag nopan"
          >
            {label}
          </a>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
