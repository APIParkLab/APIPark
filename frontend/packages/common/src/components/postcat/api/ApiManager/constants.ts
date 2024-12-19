import { generateId } from '@common/utils/postcat.tsx'
import {
  ApiBodyType,
  BodyParamsType,
  HeaderParamsType,
  QueryParamsType,
  ResponseList,
  RestParamsType
} from '@common/const/api-detail'
import { Protocol } from '../RequestMethod'

type SafeAny = unknown
type Timestamp = number

declare interface HttpRequestMessage {
  bodyParams: BodyParamsType[]
  restParams: RestParamsType[]
  queryParams: QueryParamsType[]
  headerParams: HeaderParamsType[]
}

declare interface ApiAttrInfo {
  requestMethod: number
  authInfo: SafeAny
  authType: 'inherited'
  contentType: ApiBodyType
  createTime: Timestamp
  createUserId: number
  id: number
  updateTime: number
  updateUserId: number
}

declare interface ApiRequest {
  uri: string
  apiAttrInfo: ApiAttrInfo
  requestParams: HttpRequestMessage
  responseList: ResponseList[]
  apiCaseUuid: string
  apiUuid: string
  createTime: Timestamp
  createUserId: number
  id: number
  name: string
  projectId: number
  groupId: number
  projectUuid: string
  protocol: Protocol
  updateTime: Timestamp
  updateUserId: number
  /** EDIT */
  updateApiAttr?: 1
  updateRequestParams?: 1
  updateResponseList?: 1
}

export function getDefaultApiInfo(): ApiRequest {
  return {
    apiAttrInfo: {},
    apiUuid: generateId(),
    name: '',
    uri: '',
    protocol: 0,
    requestParams: {
      bodyParams: [],
      headerParams: [],
      queryParams: [],
      restParams: []
    },
    responseList: [{}]
  } as unknown as ApiRequest
}
