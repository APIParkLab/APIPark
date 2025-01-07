import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath, useStore } from '@xyflow/react'

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
  data,
  source,
  target
}: EdgeProps) {
  // Get all edges to check for duplicates
  const edges = useStore((state) => state.edges)

  // Find duplicate edges between the same source and target
  const duplicateEdges = edges.filter((edge) => edge.source === source && edge.target === target)
  const edgeIndex = duplicateEdges.findIndex((edge) => edge.id === id)

  // Adjust the path if this is a duplicate edge
  const offset = edgeIndex * 20 // 20px offset for each duplicate edge

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY: sourceY,
    sourcePosition,
    targetX,
    targetY: targetY + offset,
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
              transform: `translate(${targetX - 80}px,${targetY - 20 + offset}px)`,
              borderRadius: '4px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              pointerEvents: 'all',
              textDecoration: 'none'
            }}
          >
            {label}
          </a>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
