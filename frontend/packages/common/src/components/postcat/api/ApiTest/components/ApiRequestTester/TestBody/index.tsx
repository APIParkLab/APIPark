import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography
} from '@mui/material'
import { ChangeEvent, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { FormData } from './FormData'
import { Raw } from './Raw'
import { Binary } from './Binary'
import { ContentType, FormContentTypes, MimeTypes } from './const'
import { ImportMessage, ImportMessageChangeType, ImportMessageOption } from '../ImportMessage'
import { ApiBodyType, BodyParamsType, TestApiBodyType } from '@common/const/api-detail'
import { mapContentTypeToApiBodyType } from '@common/utils/postcat.tsx'
import { ParseCurlResult } from '@common/utils/curl.ts'
import { TestMessageDataGridApi } from '../../TestMessageDataGrid'

export interface TestBodyApi {
  getBodyMeta: () => {
    apiBodyType: TestApiBodyType
    contentType: ContentType | null
    data?: string | File | Partial<BodyParamsType>[] | null
  }
  updateRequestBodyWithCurlInfo: (cURLResult: ParseCurlResult) => void
  updateRequestBody: (data: TestBodyType) => void
}

interface TestBodyProps {
  bodyApiRef?: React.RefObject<TestBodyApi>
  onContentTypeChange?: (contentType: ContentType) => void
}

export interface TestBodyType {
  apiBodyType: TestApiBodyType
  contentType: ContentType | null
  data?: string | File | Partial<BodyParamsType>[] | null
}

declare type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export function TestBody({ bodyApiRef, onContentTypeChange }: TestBodyProps) {
  const [apiBodyTypeValue, setApiBodyTypeValue] = useState<ApiBodyType>(ApiBodyType.FormData)

  const [contentType, setContentType] = useState<ContentType | null>(null)
  const [raw, setRaw] = useState<string>('')
  const [binary, setBinary] = useState<File | null>(null)

  const formDataApiRef = useRef<TestMessageDataGridApi>(null)

  useEffect(() => {
    if (apiBodyTypeValue === ApiBodyType.FormData) {
      setContentType(FormContentTypes[0].value)
    }
    if (apiBodyTypeValue === ApiBodyType.Raw) {
      setContentType(MimeTypes[0].value)
    }
  }, [apiBodyTypeValue])

  useEffect(() => {
    onContentTypeChange?.(contentType as ContentType)
  }, [contentType, onContentTypeChange])

  const getBodyMeta = () => {
    const result: Optional<TestBodyType, 'apiBodyType'> = {
      contentType
    }
    if (apiBodyTypeValue === ApiBodyType.FormData) {
      result.data = formDataApiRef.current?.getEditMeta() || []
      result.apiBodyType = ApiBodyType.FormData
    }
    if (apiBodyTypeValue === ApiBodyType.Raw) {
      result.data = raw
      result.apiBodyType = ApiBodyType.Raw
    }
    if (apiBodyTypeValue === ApiBodyType.Binary) {
      result.data = binary
      result.apiBodyType = ApiBodyType.Binary
    }
    return result as TestBodyType
  }

  const updateRequestBodyWithCurlInfo = (cURLResult: ParseCurlResult) => {
    const contentType = cURLResult.contentType as ContentType
    const apiBodyType = mapContentTypeToApiBodyType(contentType)
    try {
      if (apiBodyType === ApiBodyType.FormData) {
        const requestParams: unknown = cURLResult?.requestParams || {}
        const messageBodyList = Object.keys(requestParams).map((key) => ({
          name: key,
          paramAttr: {
            example: requestParams[key]
          }
        })) as BodyParamsType[]
        formDataApiRef.current?.updateRows(messageBodyList)
        setApiBodyTypeValue(ApiBodyType.FormData)
      } else {
        setRaw(cURLResult?.body || '')
        formDataApiRef.current?.updateRows([])
        setApiBodyTypeValue(ApiBodyType.Raw)
      }
    } catch (err) {
      console.warn(err)
    }
  }

  const updateRequestBody = (data: TestBodyType) => {
    setApiBodyTypeValue(data.apiBodyType)
    setContentType(data.contentType)
    if (data.apiBodyType === ApiBodyType.FormData) {
      formDataApiRef.current?.updateRows(data.data as BodyParamsType[])
    }
    if (data.apiBodyType === ApiBodyType.Raw) {
      setRaw(data.data as string)
    }
  }

  useImperativeHandle(bodyApiRef, () => ({
    getBodyMeta,
    updateRequestBodyWithCurlInfo,
    updateRequestBody
  }))

  const handleImportChange = (changeType: ImportMessageChangeType, data: ImportMessageOption[]) => {
    formDataApiRef.current?.importData(changeType, data)
  }

  const apiBodyTypeList: {
    key: 'Form-Data' | 'Raw' | 'Binary'
    value: TestApiBodyType
    element: JSX.Element
  }[] = [
    {
      key: 'Form-Data',
      value: ApiBodyType.FormData,
      element: <FormData apiRef={formDataApiRef} />
    },
    {
      key: 'Raw',
      value: ApiBodyType.Raw,
      element: <Raw value={raw} onChange={setRaw} />
    },
    {
      key: 'Binary',
      value: ApiBodyType.Binary,
      element: <Binary value={binary} onChange={setBinary} />
    }
  ]

  const handleApiBodyTypeValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setApiBodyTypeValue(+(event.target as HTMLInputElement).value)
  }

  const handleContentTypeChange = (event: SelectChangeEvent<ContentType>) => {
    setContentType(event.target.value as ContentType)
  }

  const optionSx: SxProps<Theme> = {
    fontSize: '12px',
    height: '24px'
  }

  return (
    <Box display="flex" flexDirection="column" px={1} height="100%">
      <Box display="flex" alignItems="center">
        <FormControl>
          <RadioGroup
            row
            name="api-body-type-radio-buttons-group"
            value={apiBodyTypeValue}
            onChange={handleApiBodyTypeValueChange}
            sx={{ height: '30px' }}
          >
            {apiBodyTypeList.map((apiBodyType) => (
              <FormControlLabel
                key={apiBodyType.value}
                value={apiBodyType.value}
                checked={apiBodyType.value === apiBodyTypeValue}
                control={<Radio sx={{ height: '30px', color: '#EDEDED' }} />}
                label={apiBodyType.key}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <Box display="flex" alignItems="center" gap={1}>
          <Divider orientation="vertical" variant="middle" flexItem />
          {[ApiBodyType.Raw, ApiBodyType.FormData].includes(apiBodyTypeValue) ? (
            <>
              <Typography>Content-Type:</Typography>
              <Select
                value={(contentType as ContentType) || ''}
                onChange={handleContentTypeChange}
                sx={{
                  height: '24px',
                  fontSize: '12px',
                  color: '#EDEDED'
                }}
              >
                {apiBodyTypeValue === ApiBodyType.Raw
                  ? MimeTypes.map((mimeType) => (
                      <MenuItem key={mimeType.value} sx={optionSx} value={mimeType.value}>
                        {mimeType.title}
                      </MenuItem>
                    ))
                  : null}
                {apiBodyTypeValue === ApiBodyType.FormData
                  ? FormContentTypes.map((contentType) => (
                      <MenuItem key={contentType.value} sx={optionSx} value={contentType.value}>
                        {contentType.title}
                      </MenuItem>
                    ))
                  : null}
              </Select>
            </>
          ) : null}
          {apiBodyTypeValue === ApiBodyType.FormData ? (
            <>
              <Divider orientation="vertical" variant="middle" flexItem />
              <Box>
                <ImportMessage type="form-data" onChange={handleImportChange} />
              </Box>
            </>
          ) : null}
        </Box>
      </Box>
      <Box pt={1} height="100%">
        {apiBodyTypeList.map((apiBodyType) => (
          <Box height="100%" hidden={apiBodyType.value !== apiBodyTypeValue} key={apiBodyType.value} pb={1}>
            <Box height="100%">{apiBodyType.element}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
