
import {generateId} from "@common/utils/postcat.tsx";

type SafeAny = unknown
export function generateRow(data: SafeAny = {}) {
  return Object.assign({
    id: generateId(),
    name: '',
    dataType: null,
    isRequired: 1,
    description: '',
    paramAttr: {
      example: ''
    },
    childList: []
  }, data)
}