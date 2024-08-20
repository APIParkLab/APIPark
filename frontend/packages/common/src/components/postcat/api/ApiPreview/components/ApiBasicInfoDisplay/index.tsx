
import { Box, Chip, Stack, Typography, Skeleton } from '@mui/material'
import {HTTPMethod, Protocol,RequestMethod} from "../../../RequestMethod";
import {Clipboard} from "../../../Clipboard"
import { $t } from '@common/locales';

interface ApiBasicInfoDisplayProps {
  apiName: string
  protocol: Protocol
  method: HTTPMethod
  uri: string
  loading?: boolean
}

export default function ApiBasicInfoDisplay(props: Partial<ApiBasicInfoDisplayProps>) {
  const { apiName, protocol, method, uri = '', loading = false } = props

  // const selectedEnv = useEnvStore((state) => state.selectedEnv)

  const fontHeight = 16
  if (loading) {
    return (
      <Stack spacing={1}>
        <Box display="flex">
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton sx={{ borderRadius: '16px' }} variant="rounded" width={50} height={fontHeight} />
            <Skeleton sx={{ borderRadius: '16px' }} variant="rounded" width={50} height={fontHeight} />
            <Skeleton variant="rectangular" width={200} height={fontHeight} />
            <Skeleton variant="circular" width={26} height={26} />
          </Stack>
        </Box>
        <Skeleton variant="rectangular" width={240} height={fontHeight} />
      </Stack>
    )
  }

  return (
    <Stack spacing={1}>
      <Box display="flex">
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={$t("HTTP")}
            sx={{
              height:'22px',
              borderRadius: '4px',
              color: '#fff',
              backgroundColor: '#067ddb'
            }}
          />
          <RequestMethod variant="filled" protocol={protocol ?? Protocol.HTTP} method={method ?? 'GET' as (keyof typeof HTTPMethod)} />
          <Typography>
            {/*{selectedEnv ? selectedEnv.hostUri : ''}*/}
            {uri}
          </Typography>
          <Clipboard text={uri} />
        </Stack>
      </Box>
      <p className="mt-0 font-bold text-[20px]">{apiName}</p>
    </Stack>
  )
}
