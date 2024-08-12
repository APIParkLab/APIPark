import {extend} from "lodash-es";
import {HTTPMethod, Protocol} from "@common/components/postcat/api/RequestMethod";

export interface MenuItem {
  key?: string;
  name?: string;
  emoji?: string;
  path?: string;
  content?: unknown
}

export const GetMenuItem = (org_domain_id: string, project_domain_id: string, commonQuestionRes: unknown) => {
  const Menus = [
    { key: 'introduction', name: '介绍', emoji: '📃', path: `/${org_domain_id}/api/${project_domain_id}/introduction` },
    { key: 'apiDocument', name: 'API 文档', emoji: '🔗', path: `/${org_domain_id}/api/${project_domain_id}/apiDocument`  },
    { key: 'price', name: '价格套餐', emoji: '💎', path: `/${org_domain_id}/api/${project_domain_id}/price` },
    { key: 'guidence', name: '接入指南', emoji: '💡', path: `/${org_domain_id}/api/${project_domain_id}/guidence`  }
  ];

  if (commonQuestionRes?.success && commonQuestionRes?.data?.content) {
    Menus.splice(2, 0, { key: 'commonQuestion', name: '常见问题', emoji: '🌷', path: `/${org_domain_id}/api/${project_domain_id}/commonQuestion`  });
  }

  return Menus;
};


export const SKU_LIST = [
  {
    name: '流量包',
    key: 'flow'
  },
  {
    name: '订阅套餐',
    key: 'subscribe'
  }
]

export const PROMISE_TEXT = ['服务保障', '未使用部分七天无理由退款', '正规企业商品来源', '交易流程全程监控']

export const DATA_TYPE = {
  JSON: '[json]',
  INT: '[int]',
  FLOAT: '[float]',
  DOUBLE: '[double]',
  DATE: '[date]',
  DATETIME: '[datetime]',
  BOOLEAN: '[boolean]',
  BYTE: '[byte]',
  SHORT: '[short]',
  LONG: '[long]',
  ARRAY: '[array]',
  OBJECT: '[object]',
  NUMBER: '[number]',
  NULL: '[null]',
  FILE: '[file]',
  STRING: '[string]'
}

export type DATA_TYPE_ITEM_TYPE = keyof typeof DATA_TYPE;

// tdk和schema使用，商品详情内页的类型
export const PageTypeEnum = {
  INTRODUCTION:1,
  COMMON_QUESTION:3,
  API_DOCUMENT:4,
  PRICE:5,
  GUIDANCE:6
}

export type ApiParamsBasicType = {
  id: string,
  parentId: number,
  apiUuid: string,
  responseUuid: string,
  name: string,
  paramType: number,
  partType: number,
  dataType: number,
  dataTypeValue: string,
  structureId: number,
  structureParamId: string,
  contentType: ApiBodyType ,
  isRequired: number,
  binaryRawData: string,
  description: string,
  orderNo: number,
  isDefault: number,
  paramAttr: ParamAttrType
  childList: []
  responseParams?: HttpResponseMessage
}

export type HeaderParamsType = ApiParamsBasicType

export type BodyParamsType = ApiParamsBasicType

export type QueryParamsType = ApiParamsBasicType

export type RestParamsType = ApiParamsBasicType

export type ParamAttrType = {
  id: number,
  apiParamId: number,
  minLength: number,
  maxLength: number,
  minValue: {},
  maxValue: {},
  paramLimit: string,
  paramValueList: string,
  paramMock: string,
  attr: string,
  structureIsHide: number,
  example: string,
  dbArr: string,
  paramNote: string
}

export type ResultListType = {
  id: string,
  apiUuid: string,
  name: string,
  httpCode: string,
  httpContentType: string,
  type: number,
  content: string,
  createUserId: number,
  updateUserId: number,
  createTime: number,
  updateTime: number
}

export type ResponseList = {
  id: number,
  responseUuid: string,
  apiUuid: string,
  oldId: number,
  name: string,
  httpCode: string,
  contentType: number,
  isDefault: number,
  updateUserId: number,
  createUserId: number,
  createTime: number,
  updateTime: number,
  responseParams: {
    headerParams: HeaderParamsType[],
    bodyParams: BodyParamsType[]
    queryParams: QueryParamsType[],
    restParams: RestParamsType[]
  }
}

export type ApiDetail = {
  id: string,
  service: string,
  name: string,
  protocol: Protocol,
  method:HTTPMethod,
  uri: string,
  encoding: string,
  tag: string,
  requestParams: {
    headerParams: HeaderParamsType[],
    bodyParams: BodyParamsType[],
    queryParams: QueryParamsType[],
    restParams: RestParamsType[]
  },
  resultList: ResultListType[],
  responseList: ResponseList[]
}

export enum ApiParamsType {
  string,
  file,
  json,
  int,
  float,
  double,
  date,
  datetime,
  boolean,
  byte,
  short,
  long,
  array,
  object,
  number,
  null
}

export type FileExample = {
  name: string
  content: string
}[]

export type Example = string | FileExample

/** Content-Type ? */
export enum ApiBodyType {
  FormData = 0,
  Raw = 1,
  JSON = 2,
  XML = 3,
  Binary = 4,
  JSONArray = 6
}

export type TestApiBodyType = ApiBodyType.FormData | ApiBodyType.Raw | ApiBodyType.Binary


export type ParseCurlResult = {
  /* 请求地址 */
  url: string
  /* 请求方法 */
  method: string
  /* 请求头部字段 */
  headers: { [key: string]: string }
  /* 请求 query 参数 */
  query?: { [key: string]: string }
  /* 请求内容类型 */
  contentType?: string
  /* 请求 body 原文 */
  body?: string
  /*  如果是 formData 会解析成对象  */
  requestParams?: { [key: string]: unknown } | string
}

declare interface HttpResponseMessage {
  bodyParams: ApiParamsBasicType[]
  responseParams: ApiParamsBasicType[]
  headerParams?: ApiParamsBasicType[]
}


export const commonTableSx = {
  '.MuiDataGrid-columnHeaderTitle':{
    fontSize:'14px'
  },
  '.MuiDataGrid-columnHeader':{
    background:'#f7f8fa',

  },
  '.MuiDataGrid-withBorderColor':{
    borderColor:'#EDEDED'
  },
  '& .MuiButtonBase-root.MuiIconButton-root':{
      borderRadius:'4px'
  },
  '& .MuiButtonBase-root.MuiIconButton-root:hover':{
      backgroundColor:'#f7f8fa'
  },
  '& .MuiDataGrid-columnSeparator--resizable:hover':{
    color:'#EDEDED'
  },

  '& .MuiDataGrid-columnHeader:focus-within':{
    outline:'none'}
  ,
  '& .MuiDataGrid-cell:focus-within':{
    outline:'none'},
  '.MuiDataGrid-columnHeaderTitleContainer':{
    justifyContent:'space-between'
  },
  '.MuiDataGrid-columnSeparator--resizable:hover':{
    color:'#EDEDED'
  },
  '& .MuiDataGrid-withBorderColor':{
    borderColor:'#EDEDED'
  },
  '& .MuiDataGrid-row.Mui-selected ':{
    backgroundColor:'#f7f8fa',
  },
  '& .MuiDataGrid-columnHeader':{
    backgroundColor:'#f7f8fa',
  },
  '& .MuiDataGrid-row.Mui-selected:hover':{
    backgroundColor:'#EBEEF2',
  },
  '& .MuiDataGrid-row.Mui-selected.Mui-hovered':{
    backgroundColor:'#EBEEF2',
  },
  '& .MuiDataGrid-columnHeader:focus':{
    outline:'none'}
  ,
  '& .MuiDataGrid-cell:focus':{
    outline:'none'
  },
  '& .MuiDataGrid-cell.MuiDataGrid-cell--editing:focus-within':{
    outline:'none'
  },
  '& .MuiDataGrid-row.Mui-hovered': {
    backgroundColor:'#EBEEF2',
    '.table-actions': {
      visibility: 'visible'
    }
  },
  '& .MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeSmall':{
    borderRadius:'4px'
  },
  '& .MuiDataGrid-columnHeaderTitleContainer':{
    justifyContent:'space-between'
  },
  '& .MuiOutlinedInput-input':{
    color:'#333',
    fontSize:'14px'
  }
}