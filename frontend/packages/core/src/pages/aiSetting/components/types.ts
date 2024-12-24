export type ModelStatus = 'enable' | 'abnormal'|'disable'
export type KeyStatus ='normal' | 'abnormal'|'disable'

export interface KeyData {
  id: string
  name: string
  status: KeyStatus,
}

export interface ModelData {
  id: string
  name: string
  logo: string
  default_llm: string
  status: ModelStatus
  api_count: number
  key_count: number
  keys: KeyData[]
  priority?: number
}
