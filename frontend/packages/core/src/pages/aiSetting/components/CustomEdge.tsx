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
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          cursor: 'pointer'
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <a
            href={`${label?.toString().includes('apis') ? '/aiApis' : '/keysetting'}?modelId=${modelId}`}
            target="_blank"
            style={{
              position: 'absolute',
              transform: `translate(${targetX - 80}px,${targetY - 20}px)`,
              borderRadius: '4px',
              fontSize: 12,
              fontWeight: 500,
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
