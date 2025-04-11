import { EntityItem } from '@common/const/type'
import { SubscribeEnum, SubscribeFromEnum } from '@core/const/system/const'
import { DefaultOptionType } from 'antd/es/select'

export type ServiceBasicInfoType = {
  app: EntityItem
  team: EntityItem
  master: EntityItem
  apiNum: number
  appNum: number
  catalogue: EntityItem
  tags: EntityItem[]
  updateTime: string
  version: string
  logo?: string
  invokeAddress: string
  approvalType: 'auto' | 'manual'
  serviceKind: 'ai' | 'rest'
  sitePrefix?: string
  enableMcp: boolean
  invokeCount: number
}

export type ServiceDetailType = {
  name: string
  description: string
  basic: ServiceBasicInfoType
  apiDoc: string
  applied: boolean
  mcpServerAddress?: string
  mcpAccessConfig?: string
  openapiAddress?: string
}

export type ServiceHubCategoryConfigFieldType = {
  id?: string
  name: string
  parent?: string
}

export type ServiceHubCategoryConfigProps = {
  type: 'addCate' | 'addChildCate' | 'renameCate'
  entity?: { [k: string]: unknown }
}

export type ServiceHubCategoryConfigHandle = {
  save: () => Promise<boolean | string>
}

export type CategorizesType = {
  id: string
  name: string
  children: CategorizesType[]
}

export type ServiceHubTableListItem = {
  id: string
  name: string
  tags?: EntityItem[]
  catalogue: EntityItem
  apiNum: number
  subscriberNum: number
  description: string
  logo: string
  enableMcp: boolean
  serviceKind: 'ai' | 'rest'
  invokeCount: number
}

export type ApplyServiceProps = {
  entity: ServiceBasicInfoType & EntityItem
  mySystemOptionList: DefaultOptionType[]
  reApply?: boolean
}

export type ApplyServiceHandle = {
  apply: () => Promise<boolean | string>
}

export type ServiceHubApplyModalFieldType = {
  projects?: string
  reason?: string
}

export type ServiceHubAppListItem = {
  id: string
  name: string
  team: EntityItem
  subscribeNum: number
  subscribeVerifyNum: number
  description: string
  master: EntityItem
  createTime: string
}

export type TenantManagementServiceListItem = {
  id: string
  service: EntityItem
  applyStatus: typeof SubscribeEnum
  app: EntityItem
  team: EntityItem
  from: SubscribeFromEnum
  createTime: string
}
