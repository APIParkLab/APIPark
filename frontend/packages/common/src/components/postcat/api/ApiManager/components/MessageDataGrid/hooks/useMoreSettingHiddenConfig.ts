import { MessageType, RenderMessageBody } from '../index.tsx'
import { isNil } from '@common/utils/postcat.tsx'
import { ApiParamsType } from '@common/const/api-detail'

interface UseMoreSettingHiddenConfigProps {
  param: RenderMessageBody
  messageType: MessageType
  readOnly: boolean
}

export const useMoreSettingHiddenConfig = ({ param, messageType, readOnly }: UseMoreSettingHiddenConfigProps) => {
  let paramLength = false
  let valueEnum = false
  let value = false
  if (messageType !== 'Body') {
    paramLength = true
    value = true
  } else {
    if (readOnly) {
      paramLength = isNil(param.paramAttr.minLength || param.paramAttr.maxLength)
      valueEnum = !param?.paramAttr?.paramValueList?.length
    } else {
      paramLength = param?.dataType !== ApiParamsType.string
      valueEnum = [ApiParamsType.null, ApiParamsType.boolean].includes(param?.dataType as ApiParamsType)
      value = ![
        ApiParamsType.int,
        ApiParamsType.float,
        ApiParamsType.double,
        ApiParamsType.short,
        ApiParamsType.long,
        ApiParamsType.number
      ].includes(param?.dataType as ApiParamsType)
    }
  }
  return {
    paramLength,
    valueEnum,
    value,
    example: readOnly && !param?.paramAttr?.example
  }
}
