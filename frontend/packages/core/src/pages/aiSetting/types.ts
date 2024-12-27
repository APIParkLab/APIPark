export type ModelStatus = 'enable' | 'abnormal'|'disabled'
export type KeyStatus ='normal' | 'abnormal'|'disabled'

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

export type AiSettingListItem = {
  name: string
  id: string
  logo: string
  defaultLlm: string
  defaultLlmLogo: string
  enable: boolean
  configured: boolean
}

export type AiProviderLlmsItems = {
  id: string
  logo: string
  scopes: ('chat' | 'completions')[]
  config: string
}

export type AiProviderDefaultConfig = {
  id: string
  provider: string
  name: string
  logo: string
  defaultLlm: string
  scopes: string[]
}

export type AiProviderConfig = {
  id: string
  name: string
  config: string
  getApikeyUrl: string
}
