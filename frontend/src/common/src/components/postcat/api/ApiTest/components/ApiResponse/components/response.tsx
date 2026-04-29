import { useEffect, useMemo, useRef } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { ResponseContentType } from '@common/hooks/useTest.ts'
import { Codebox, CodeboxApiRef } from '../../../../Codebox'

interface ResponseProps {
  responseType: ResponseType
  responseContentType: ResponseContentType
  responseLength: number
  data: string
  uri: string
  onDownload: () => void
}

export function Response({
  data,
  responseContentType,
  responseType,
  responseLength,
  uri,
  onDownload
}: Partial<ResponseProps>) {
  const codeboxApiRef = useRef<CodeboxApiRef>(null)

  const language = useMemo(() => {
    const contentType: unknown = responseContentType
    if (contentType?.includes('text/html')) return 'html'
    if (contentType?.includes('application/json')) return 'json'
    if (contentType?.includes('application/xml')) return 'xml'
    if (contentType?.includes('application/javascript')) return 'javascript'
    if (contentType?.includes('text/css')) return 'css'
    if (contentType?.includes('text/plain')) return 'plaintext'
    return 'plaintext'
  }, [responseContentType])

  const responsePreviewType: 'stream' | 'longText' | 'img' | 'default' = useMemo(() => {
    const isImage = responseContentType?.startsWith('image')
    const isLongData = (responseLength || 0) > 500000
    if (isImage) return 'img'
    if (!isLongData) return 'default'
    // @ts-ignore
    if (isLongData && responseType === 'stream') return 'stream'
    // @ts-ignore
    if (isLongData && responseType === 'text') return 'longText'
    return 'default'
  }, [responseContentType, responseLength, responseType])

  useEffect(() => {
    if (responsePreviewType === 'default') {
      codeboxApiRef.current?.formatCode()
    }
  }, [responsePreviewType, data])

  return (
    <>
      {responsePreviewType === 'img' ? (
        <Box>
          <img src={uri} alt="response image" />
        </Box>
      ) : null}
      {responsePreviewType === 'stream' ? (
        <Box py={4} width="100%" display="flex" alignItems="center" justifyContent="center">
          <Typography>Unable to preview non-text data types. Please </Typography>
          <Button variant="text" onClick={onDownload}>
            download
          </Button>
          <Typography> the file and open it with an appropriate program.</Typography>
        </Box>
      ) : null}
      {responsePreviewType === 'longText' ? (
        <Box py={4} width="100%" display="flex" alignItems="center" justifyContent="center">
          <Typography>The response exceeds the size limit for preview. Please </Typography>
          <Button variant="text" onClick={onDownload}>
            download
          </Button>
          <Typography> it for further review.</Typography>
        </Box>
      ) : null}
      {responsePreviewType === 'default' ? (
        <>
          {/*<div className="w-full h-full"></div>*/}
          <Codebox
            apiRef={codeboxApiRef}
            readOnly
            language={language}
            height="100%"
            width="100%"
            value={`${data || ''}`}
          />
        </>
      ) : null}
    </>
  )
}
