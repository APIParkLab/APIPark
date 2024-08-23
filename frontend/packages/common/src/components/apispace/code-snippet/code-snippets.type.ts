import { $t } from "@common/locales"

export type PARAM_TYPE =
  | 'string'
  | 'float'
  | 'integer'
  | 'boolean'
  | 'date'
  | 'time'
  | 'datatime'
  | string
export type PARAM_KEY_REF_TYPE = {
  key: string
  type: string
  childKey?: string
  value: string
  attribute?: string
  description?: string
  filter?: string
  arrayItemKey?:string
}
export type PARAM_TYPE_REF_TYPE = {
  [key: string | number]: PARAM_TYPE
}
export type PARAM_LIS_ITEM_TYPE = {
  [key: string]: unknown
}
export type PARAM_LIST_TYPE = PARAM_LIS_ITEM_TYPE[]
export type PARSE_PARAM_TYPE = 'json' | 'xml' | 'query' | 'formData' | 'header'

export type CODE_LANGUAGE_SNIPPETS_TYPE = {
  value: number
  label: string
  children?: CODE_LANGUAGE_SNIPPETS_TYPE[]
  isLeaf?: boolean
}
export const CODE_SNIPPETS: CODE_LANGUAGE_SNIPPETS_TYPE[] = [
  {
    label: 'Java(OK HTTP)',
    value: 20,
    isLeaf: true
  },
  {
    label: 'PHP',
    value: 9,
    children: [
      {
        label: 'pecl_http',
        value: 10,
        isLeaf: true
      },
      {
        label: 'cURL',
        value: 11,
        isLeaf: true
      }
    ]
  },
  {
    label: 'Python',
    value: 12,
    children: [
      {
        label: 'http.client(Python 3)',
        value: 13,
        isLeaf: true
      },
      {
        label: 'Requests',
        value: 14,
        isLeaf: true
      }
    ]
  },
  {
    label: 'HTTP',
    value: 1,
    isLeaf: true
  },
  {
    label: 'cURL',
    value: 2,
    isLeaf: true
  },
  {
    label: 'JavaScript',
    value: 3,
    children: [
      {
        label: 'Jquery AJAX',
        value: 4,
        isLeaf: true
      },
      {
        label: 'XHR',
        value: 5,
        isLeaf: true
      }
    ]
  },
  {
    label: 'NodeJS',
    value: 6,
    children: [
      {
        label: 'Native',
        value: 7,
        isLeaf: true
      },
      {
        label: 'Request',
        value: 8,
        isLeaf: true
      }
    ]
  },
  {
    label: $t('微信小程序'),
    value: 21,
    isLeaf: true
  },
  {
    label: 'Ruby(Net:Http)',
    value: 15,
    isLeaf: true
  },
  {
    label: 'Shell',
    value: 16,
    children: [
      {
        label: 'Httpie',
        value: 17,
        isLeaf: true
      },
      {
        label: 'cUrl',
        value: 18,
        isLeaf: true
      }
    ]
  },
  {
    label: 'Go',
    value: 19,
    isLeaf: true
  }
]

export const paramsJsonType: unknown = {
  STRING: 'string',
  FILE: 'file',
  JSON: 'json',
  INT: 'int',
  FLOAT: 'float',
  DATE: 'date',
  DATETIME: 'datetime',
  BOOLEAN: 'boolean',
  BYTE: 'byte',
  SHORT: 'short',
  LONG: 'long',
  ARRAY: 'array',
  OBJECT: 'object',
  NUMBER: 'number',
  NULL: 'null'
}
