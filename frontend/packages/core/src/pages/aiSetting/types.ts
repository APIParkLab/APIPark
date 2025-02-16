export type ModelStatus = 'enabled' | 'abnormal' | 'disabled'
export type KeyStatus = 'normal' | 'abnormal' | 'disabled'
export type ModelDeployStatus = 'normal' | 'disabled' | 'deploying' | 'error' | 'deploying_error' | undefined

export interface KeyData {
  id: string
  name: string
  status: KeyStatus
}

export interface ModelListData {
  id: string | undefined
  name: string
  logo: string
  defaultLlm: string | undefined
  provider?: string
  modelMode?: string
  status: ModelStatus
  state?: ModelDeployStatus
  apiCount: number
  keyCount: number
  isDisabled?: boolean
  keys: KeyData[]
  canDelete: boolean
}

export interface AISettingEntityItem {
  id: string | undefined
  status?: ModelStatus | undefined
  defaultLlm: string | undefined
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
