import { Box, Divider, Grow, Tab, Tabs, Typography, useTheme } from '@mui/material'
import {
  RefObject,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import { TestBody, TestBodyApi, TestBodyType } from './TestBody'
import { ContentType } from './TestBody/const'
import {throttle} from 'lodash-es'
import { ImportMessage, ImportMessageChangeType, ImportMessageOption } from './ImportMessage'
import {ApiBodyType, ApiDetail, ParseCurlResult, TestApiBodyType} from "@common/const/api-detail";
import {TestMessageDataGrid, TestMessageDataGridApi} from "../TestMessageDataGrid";
import {Indicator} from "../../../../Indicator";
import { $t } from '@common/locales'

export interface ApiRequestTesterApi {
  getEditMeta: () => {
    headers: Partial<ApiBodyType>[] | null
    body?: {
      apiBodyType: TestApiBodyType
      contentType: ContentType | null
      data?: string | File | Partial<ApiBodyType>[] | null
    }
    query: Partial<ApiBodyType>[] | null
    rest: Partial<ApiBodyType>[] | null
  }
  updateQueryDataGrid: (rows: ApiBodyType[]) => void
  updateRestDataGrid: (rows: ApiBodyType[]) => void
  updateHeaderDataGrid: (rows: ApiBodyType[]) => void
  updateRequestBodyWithCurlInfo: (cURLResult: ParseCurlResult) => void
  updateRequestBody: (data: TestBodyType) => void
}

interface ApiRequestTesterProps {
  apiRef: RefObject<ApiRequestTesterApi>
  onQueryChange: (query: ApiBodyType[]) => void
  apiInfo:ApiDetail
  loaded:boolean
}

export function ApiRequestTester({ apiRef, onQueryChange ,apiInfo, loaded=true}: ApiRequestTesterProps) {
  const [apiHeaders, setApiHeaders] = useState<ApiBodyType[] | null>(null)
  const [apiQuery, setApiQuery] = useState<ApiBodyType[] | null>(null)
  const [apiRest, setApiRest] = useState<ApiBodyType[] | null>(null)

  const headersApiRef = useRef<TestMessageDataGridApi>(null)
  const queryApiRef = useRef<TestMessageDataGridApi>(null)
  const restApiRef = useRef<TestMessageDataGridApi>(null)
  const bodyApiRef = useRef<TestBodyApi>(null)

  const getEditMeta = () => {
    return {
      headers: headersApiRef.current?.getEditMeta() || null,
      body: bodyApiRef.current?.getBodyMeta(),
      query: queryApiRef.current?.getEditMeta() || null,
      rest: restApiRef.current?.getEditMeta() || null,
    }
  }

  const updateQueryDataGrid = (rows: ApiBodyType[]) => {
    queryApiRef.current?.updateRows(rows)
  }

  const updateRestDataGrid = (rows: ApiBodyType[]) => {
    restApiRef.current?.updateRows(rows)
  }

  const updateHeaderDataGrid = (rows: ApiBodyType[]) => {
    headersApiRef.current?.updateRows(rows)
  }

  const updateRequestBodyWithCurlInfo = (cURLResult: ParseCurlResult) => {
    bodyApiRef.current?.updateRequestBodyWithCurlInfo(cURLResult)
  }

  const updateRequestBody = (data: TestBodyType) => {
    bodyApiRef.current?.updateRequestBody(data)
  }

  useImperativeHandle(apiRef, () => ({
    getEditMeta,
    updateQueryDataGrid,
    updateRestDataGrid,
    updateHeaderDataGrid,
    updateRequestBodyWithCurlInfo,
    updateRequestBody
  }))

  useEffect(() => {
    if ((apiInfo || apiInfo === null) && loaded) {
      setApiHeaders(apiInfo?.requestParams?.headerParams || [])
      setApiQuery(apiInfo?.requestParams?.queryParams || [])
      setApiRest(apiInfo?.requestParams?.restParams || [])
    }
  }, [apiInfo, loaded])

  const handleContentTypeChange = (contentType: ContentType) => {
    headersApiRef.current?.updateContentType?.(contentType)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleQueryChange = useCallback(
    throttle(() => {
      const queryData = queryApiRef.current?.getEditMeta() || []
      onQueryChange?.(queryData as ApiBodyType[])
    }, 500),
    [onQueryChange]
  )

  const handleImportChange = (changeType: ImportMessageChangeType, data: ImportMessageOption[]) => {
    tabValue === $t('请求头') && headersApiRef.current?.importData(changeType, data)
    tabValue === $t('Query 参数') && queryApiRef.current?.importData(changeType, data)
  }

  const tabs = [
    {
      label: $t('请求头'),
      element: (
        <TestMessageDataGrid
          apiRef={headersApiRef}
          initialRows={apiHeaders}
          messageType="Headers"
          disabledContentType
        />
      ),
      dirty: false
    },
    {
      label: $t('请求体'),
      element: <TestBody bodyApiRef={bodyApiRef} onContentTypeChange={handleContentTypeChange} />,
      dirty: false
    },
    {
      label: $t('Query 参数'),
      element: (
        <TestMessageDataGrid
          apiRef={queryApiRef}
          initialRows={apiQuery}
          onChange={handleQueryChange}
          onNameChange={handleQueryChange}
          onValueChange={handleQueryChange}
          messageType="Query"
        />
      ),
      dirty: false
    },
    {
      label: $t('Rest 参数'),
      element: <TestMessageDataGrid apiRef={restApiRef} initialRows={apiRest} messageType="REST" />,
      dirty: false
    }
  ]

  const tabHeight = '30px'

  const theme = useTheme()

  const [tabValue, setTabValue] = useState(tabs[0].label)

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  const importMessageType: 'header' | 'query' = useMemo(() => {
    return ({ Headers: 'header', Query: 'query' }[tabValue] || 'query') as 'header' | 'query'
  }, [tabValue])

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" py={1}>
        <Tabs
          value={tabValue}
          onChange={handleChange}
          aria-label="api request editor"
          sx={{
            minHeight: tabHeight,
            height: tabHeight,
            '& .MuiTabs-flexContainer': {
              minHeight: tabHeight,
              height: tabHeight
            },
            fontSize:'14px'
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.label}
              value={tab.label}
              label={
                <Box key={tab.label} display="flex" alignItems="center" pr={tab.dirty ? 0.5 : 0}>
                  <Typography sx={{fontSize:'14px'}}>{tab.label}</Typography>
                  <Grow in={tab.dirty}>
                    <Box>
                      <Indicator
                        color={theme.palette.primary.main}
                        sx={{
                          right: theme.spacing(-1)
                        }}
                      />
                    </Box>
                  </Grow>
                </Box>
              }
              sx={{
                textAlign: 'left',
                padding: theme.spacing(1),
                minWidth: 'auto',
                minHeight: tabHeight,
                fontSize:'14px'
              }}
            />
          ))}
        </Tabs>
        {['Headers', 'Query'].includes(tabValue) ? (
          <Box display="flex" gap={1} ml={1}>
            <Divider orientation="vertical" variant="middle" flexItem />
            <ImportMessage type={importMessageType} onChange={handleImportChange} />
          </Box>
        ) : null}
      </Box>
      <Box height="100%" display="flex" overflow="hidden">
        {tabs.map((tab) => (
          <Box key={tab.label} height="100%" width="100%" hidden={tabValue !== tab.label}>
            {tab.element}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
