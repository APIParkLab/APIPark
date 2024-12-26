import type { Dataset } from './plugins/context-block/index'
import type { RoleName } from './plugins/history-block/index'
// import type {
//   Node,
// } from '@/app/components/workflow/types'

export type NodeOutPutVar = {
  nodeId: string
  title: string
  vars: Var[]
  isStartNode?: boolean
}

export type Option = {
  value: string
  name: string
}

export type ExternalToolOption = {
  name: string
  variableName: string
  icon?: string
  icon_background?: string
}

export type ContextBlockType = {
  show?: boolean
  selectable?: boolean
  datasets?: Dataset[]
  canNotAddContext?: boolean
  onAddContext?: () => void
  onInsert?: () => void
  onDelete?: () => void
}

export type QueryBlockType = {
  show?: boolean
  selectable?: boolean
  onInsert?: () => void
  onDelete?: () => void
}

export type HistoryBlockType = {
  show?: boolean
  selectable?: boolean
  history?: RoleName
  onInsert?: () => void
  onDelete?: () => void
  onEditRole?: () => void
}

export type VariableBlockType = {
  show?: boolean
  variables?: Option[]
}

export type ExternalToolBlockType = {
  show?: boolean
  externalTools?: ExternalToolOption[]
  onAddExternalTool?: () => void
}
unknown
export type WorkflowVariableBlockType = {
  show?: boolean
  variables?: NodeOutPutVar[]
  workflowNodesMap?: Record<string, unknown>
  onInsert?: () => void
  onDelete?: () => void
}

export type MenuTextMatch = {
  leadOffset: number
  matchingString: string
  replaceableString: string
}
