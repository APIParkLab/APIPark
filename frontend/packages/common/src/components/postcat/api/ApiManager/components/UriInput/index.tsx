import { InputAdornment, TextField, Select, MenuItem, Divider, SelectChangeEvent, Typography, Box } from '@mui/material'
import { SyntheticEvent } from 'react'
import {ParseCurlResult} from "@common/const/api-detail";
import {HTTPMethod, RequestMethod} from "../../../RequestMethod";
import {ParseCurl} from "@common/utils/curl.ts";

interface UriInputProps {
  inputValue?: string
  onInputChange?: (value: string) => void
  selectValue?: HTTPMethod
  onSelectChange?: (value: HTTPMethod) => void
  onCURLPaste?: (cURL: ParseCurlResult) => void
  onTest?: () => void
}

export function UriInput({
  inputValue,
  onInputChange,
  selectValue,
  onSelectChange,
  onCURLPaste,
  onTest
}: UriInputProps) {


  const handleSelectChange = (event: SelectChangeEvent<HTTPMethod>) => {
    onSelectChange?.(event.target.value as HTTPMethod)
  }

  const handleInputChange = (event: SyntheticEvent) => {
    onInputChange?.((event.target as HTMLInputElement).value)
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const clipboardData = event.clipboardData
    const pastedData = clipboardData.getData('text')
    const cURL = new ParseCurl(pastedData)
    onCURLPaste?.(cURL.getParseResult())
  }

  const httpMethods = [
    HTTPMethod.POST,
    HTTPMethod.GET,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.HEAD,
    HTTPMethod.OPTIONS,
    HTTPMethod.PATCH
  ]

  return (
    <TextField
      fullWidth
      placeholder="输入 URL 或 cURL"
      value={inputValue}
      onChange={handleInputChange}
      sx={{
        input: {
          lineHeight: '40px',
          fontSize: '16px',
           padding:'8.5px 14px 8.5px 0'
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onTest?.()
        }
      }}
      onPaste={handlePaste}
      autoComplete="off"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Select
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                }
              }}
              value={selectValue}
              onChange={handleSelectChange}
            >
              {httpMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  <RequestMethod displayFormat="full" protocol={0} method={method} />
                </MenuItem>
              ))}
            </Select>
            {/*{selectedEnv && selectedEnv.hostUri ? (*/}
            {/*  <Box px={1} display="flex">*/}
            {/*    <Divider*/}
            {/*      orientation="vertical"*/}
            {/*      sx={{*/}
            {/*        height: 16,*/}
            {/*        marginRight: 1*/}
            {/*      }}*/}
            {/*    />*/}
            {/*    <Typography>{selectedEnv.hostUri}</Typography>*/}
            {/*  </Box>*/}
            {/*) : null}*/}
            <Divider
              orientation="vertical"
              sx={{
                height: 16
              }}
            />
          </InputAdornment>
        )
      }}
    />
  )
}
