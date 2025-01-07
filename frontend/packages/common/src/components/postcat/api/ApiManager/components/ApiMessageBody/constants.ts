import { ApiBodyType, ApiParamsType } from '@common/const/api-detail'

export type ApiBodyTypeLabel = 'Form-Data' | 'JSON' | 'XML' | 'Raw' | 'Binary'

export type ApiBodyTypeOption = {
  key: ApiBodyTypeLabel
  value: ApiBodyType
  element: React.ReactNode
}

export type ApiParamsTypeOption = {
  key: keyof typeof ApiParamsType
  value: ApiParamsType
}

export const ApiParamsTypeOptions: ApiParamsTypeOption[] = [
  {
    key: 'string',
    value: ApiParamsType.string
  },
  {
    key: 'file',
    value: ApiParamsType.file
  },
  {
    key: 'json',
    value: ApiParamsType.json
  },
  {
    key: 'int',
    value: ApiParamsType.int
  },
  {
    key: 'float',
    value: ApiParamsType.float
  },
  {
    key: 'double',
    value: ApiParamsType.double
  },
  {
    key: 'date',
    value: ApiParamsType.date
  },
  {
    key: 'datetime',
    value: ApiParamsType.datetime
  },
  {
    key: 'boolean',
    value: ApiParamsType.boolean
  },
  {
    key: 'byte',
    value: ApiParamsType.byte
  },
  {
    key: 'short',
    value: ApiParamsType.short
  },
  {
    key: 'long',
    value: ApiParamsType.long
  },
  {
    key: 'array',
    value: ApiParamsType.array
  },
  {
    key: 'object',
    value: ApiParamsType.object
  },
  {
    key: 'number',
    value: ApiParamsType.number
  },
  {
    key: 'null',
    value: ApiParamsType.null
  }
]
