import { Box, Tab, Tabs, useTheme } from '@mui/material'
import { SyntheticEvent, useCallback, useMemo, useState } from 'react'
import { Response } from './components/response'
import { Body } from './components/body'
import { HeaderPreview } from './components/HeaderPreview'
import { ResponseIndicator } from './components/ResponseIndicator'
import { TestResponse } from '@common/hooks/useTest.ts'
import { downloadFile } from '@common/utils/download.ts'
import { $t } from '@common/locales'

type TabType = 'Response' | 'Response Headers' | 'Body' | 'Request Headers'

interface ApiResponseProps {
  data: TestResponse | null
}

export function ApiResponse({ data }: ApiResponseProps) {
  const tabHeight = 30
  const theme = useTheme()
  const [tabValue, setTabValue] = useState<TabType>('Response')

  const handleTabValueChange = useCallback((_evt: SyntheticEvent, value: TabType): void => {
    setTabValue(value)
  }, [])

  const response = data?.report.response

  const handleDownload = useCallback(() => {
    const request = data?.report?.request
    const response = data?.report.response
    const report = data?.report
    downloadFile({
      body: response?.body || '',
      contentType: response?.contentType || 'raw',
      filename: report?.blobFileName || 'test_response',
      responseType: response?.responseType || 'text',
      uri: request?.uri || ''
    })
  }, [data])

  const tabs = useMemo(() => {
    const request = data?.report?.request
    const response = data?.report.response
    return [
      {
        title: $t('响应'),
        name: 'Response',
        hidden: false,
        element: (
          <Response
            data={response?.body}
            responseLength={response?.responseLength}
            responseType={response?.responseType}
            responseContentType={response?.contentType}
            uri={request?.uri}
            onDownload={handleDownload}
          />
        )
      },
      {
        title: $t('响应头'),
        name: 'Response Headers',
        hidden: !response?.headers.length,
        element: <HeaderPreview data={response?.headers || []} />
      },
      {
        title: $t('正文'),
        name: 'Body',
        hidden: !request?.body.length,
        element: <Body data={request?.body} />
      },
      {
        title: $t('请求头'),
        name: 'Request Headers',
        hidden: !request?.headers.length,
        element: <HeaderPreview data={request?.headers || []} />
      }
    ].filter((tab) => !tab.hidden)
  }, [data, handleDownload])

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box
        sx={{
          borderBottom: `1px solid #EDEDED`
        }}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Tabs
          sx={{
            minHeight: tabHeight,
            backgroundColor: theme.palette.background.default
          }}
          value={tabValue}
          onChange={handleTabValueChange}
          aria-label="tabs"
        >
          {tabs.map((tab, index) => (
            <Tab
              sx={{
                minWidth: '60px',
                padding: theme.spacing(0, 2),
                minHeight: tabHeight
              }}
              value={tab.name}
              key={tab.name}
              id={`tab-${index}`}
              label={tab.title}
              aria-controls={`tabpanel-${index}`}
            />
          ))}
        </Tabs>
        <ResponseIndicator
          statusCode={response?.httpCode}
          size={response?.responseLength}
          time={response?.testDeny}
          onDownload={handleDownload}
        />
      </Box>
      <Box position="relative" overflow="auto" height="100%">
        {tabs.map((tab) => (
          <Box key={tab.name} height="100%" hidden={tab.name !== tabValue}>
            {tab.element}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
