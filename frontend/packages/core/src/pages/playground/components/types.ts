export type ModelCardStatus = 'success' | 'failure'

export interface ModelData {
  id: string
  type: string
  title: string
  status: ModelCardStatus
  defaultModel: string
}
