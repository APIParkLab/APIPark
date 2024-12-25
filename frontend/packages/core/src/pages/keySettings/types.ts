
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
  