import { Box, useTheme } from '@mui/material'
import { BodyParamsType } from '@common/const/api-detail'
import { RenderMessageBody } from '@common/components/postcat/api/apiManager/components/MessageDataGrid'
export interface ApiProxyEditorApi {
  getEditMeta: () => Partial<BodyParamsType>[]
}

interface ApiProxyEditorProps<T = unknown> {
  //   onChange?: (rows: T[]) => void
  //   initialRows?: T[] | null
  //   onDirty?: () => void
  loading?: boolean
  //   messageType?: MessageType
  //   contentType: ContentType
  //   isMoreSettingReadOnly?: boolean
  //   apiRef?: RefObject<ApiProxyEditorApi>
}

export function ApiProxyEditor(props: ApiProxyEditorProps<RenderMessageBody>) {
  const {
    // onChange,
    // initialRows,
    // onDirty,
    loading = false
    // contentType,
    // messageType,
    // isMoreSettingReadOnly,
    // apiRef,
    // loaded
  } = props
  const theme = useTheme()

  return (
    <Box
      sx={{
        borderTop: `1px solid #EDEDED`,
        borderRadius: `${theme.shape.borderRadius}px`
      }}
    >
      <Box></Box>
    </Box>
  )
}
