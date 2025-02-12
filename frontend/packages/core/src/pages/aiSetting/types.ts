export type ModelStatus = 'enabled' | 'abnormal' | 'disabled'
export type KeyStatus = 'normal' | 'abnormal' | 'disabled'

export interface KeyData {
  id: string
  name: string
  status: KeyStatus
}

export interface ModelListData {
  id: string
  name: string
  logo: string
  defaultLlm: string
  status: ModelStatus
  api_count: number
  key_count: number
  keys: KeyData[]
}
export interface ModelDetailData extends ModelListData {
  enable: boolean
  config: string
  getApikeyUrl: string
  status: ModelStatus
  configured: boolean
}

export type AiSettingListItem = {
  name: string
  id: string
  logo: string
  defaultLlm: string
  defaultLlmLogo: string
  enable: boolean
  configured: boolean
  priority?: number
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
