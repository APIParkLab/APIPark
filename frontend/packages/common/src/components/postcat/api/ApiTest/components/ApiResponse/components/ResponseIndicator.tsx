import { Box, Chip, Typography } from '@mui/material'
import {IconButton} from "../../../../IconButton";
import {byteToString} from "@common/utils/postcat.tsx";

interface ResponseIndicatorProps {
  statusCode: number
  size: number
  time: string
  onDownload?: () => void
}

export function ResponseIndicator({ statusCode, size, time, onDownload }: Partial<ResponseIndicatorProps>) {
  return statusCode ? (
    <Box gap={2} px={1} display="flex" alignItems="center">
      <Chip label={<Typography>{statusCode}</Typography>} />
      <Typography>
        大小: {byteToString(size || 0)}
      </Typography>
      <Typography>
        时间: {time} ms
      </Typography>
      <IconButton name="download" title='另存为文件' onClick={onDownload} />
    </Box>
  ) : null
}
