
export interface APIKey extends Record<string, unknown> {
    id: string
    name: string
    status: 'normal' | 'exceeded' | 'expired' | 'disabled' | 'error'
    use_token: number
    update_time: string
    expire_time: string
    can_delete: boolean
    priority: number
  }

export interface APIKey extends EditAPIKey {
  status: 'normal' | 'exceeded' | 'expired' | 'disabled' | 'error'
  use_token: number
  update_time: string
  can_delete: boolean
  priority: number
}

export interface EditAPIKey {
  id?: string
  name: string
  config: string
  expire_time: string
}
