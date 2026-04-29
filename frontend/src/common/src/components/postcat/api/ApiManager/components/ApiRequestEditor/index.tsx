import { Box, Grow, Tab, Tabs, Typography, useTheme } from '@mui/material'
import { ReactNode, SyntheticEvent, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  ApiBodyType,
  ApiDetail,
  BodyParamsType,
  HeaderParamsType,
  QueryParamsType,
  RestParamsType
} from '@common/const/api-detail'
import { MessageDataGrid, MessageDataGridApi } from '../MessageDataGrid'
import { Indicator } from '../../../../Indicator'
import { ApiMessageBody, ApiMessageBodyApi } from '../ApiMessageBody'
import { $t } from '@common/locales'

export interface ApiRequestEditorApi {
  getData: () => {
    bodyParams?: {
      contentType: ApiBodyType
      bodyParams: Partial<BodyParamsType>[]
    }
    headerParams: HeaderParamsType[]
    queryParams: QueryParamsType[]
    restParams: RestParamsType[]
  }
}

interface ApiRequestEditorTab {
  label: string
  element: ReactNode
  dirty: boolean
}

export function ApiRequestEditor({
  editorRef,
  apiInfo = null,
  loaded
}: {
  editorRef?: React.RefObject<ApiRequestEditorApi>
  apiInfo: ApiDetail
  loaded: boolean
}) {
  const [apiHeaders, setApiHeaders] = useState<HeaderParamsType[]>([])
  const [apiQuery, setApiQuery] = useState<QueryParamsType[]>([])
  const [apiRest, setApiRest] = useState<RestParamsType[]>([])

  const headersRef = useRef<MessageDataGridApi>(null)
  const bodyRef = useRef<ApiMessageBodyApi>(null)
  const queryRef = useRef<MessageDataGridApi>(null)
  const restRef = useRef<MessageDataGridApi>(null)

  const [innerLoaded, setInnerLoaded] = useState<boolean>(false)
  useImperativeHandle(editorRef, () => ({
    getData: () => {
      return {
        bodyParams: bodyRef.current
          ?.getBodyMeta()
          ?.bodyParams.map((x) => ({ ...x, contentType: bodyRef.current?.getBodyMeta().contentType })),
        headerParams: (headersRef.current?.getEditMeta() as HeaderParamsType[]) || [],
        queryParams: (queryRef.current?.getEditMeta() as QueryParamsType[]) || [],
        restParams: (restRef.current?.getEditMeta() as RestParamsType[]) || []
      }
    }
  }))

  useEffect(() => {
    if (loaded && (apiInfo || apiInfo === null)) {
      setApiQuery(apiInfo?.requestParams?.queryParams || [])
      setApiRest(apiInfo?.requestParams?.restParams || [])
      setApiHeaders((apiInfo?.requestParams?.headerParams as unknown as HeaderParamsType[]) || [])
      setInnerLoaded(true)
    }
  }, [apiInfo, loaded])

  const tabs: ApiRequestEditorTab[] = [
    {
      label: $t('请求头部'),
      element: (
        <MessageDataGrid
          apiRef={headersRef}
          initialRows={apiHeaders}
          onChange={setApiHeaders}
          contentType="FormData"
          messageType="Header"
          loaded={innerLoaded}
        />
      ),
      dirty: false
    },
    {
      label: $t('请求体'),
      element: <ApiMessageBody bodyApiRef={bodyRef} mode="request" apiInfo={apiInfo} loaded={innerLoaded} />,
      dirty: false
    },
    {
      label: $t('Query 参数'),
      element: (
        <MessageDataGrid
          apiRef={queryRef}
          initialRows={apiQuery}
          onChange={setApiQuery}
          contentType="FormData"
          messageType="Query"
          loaded={innerLoaded}
        />
      ),
      dirty: false
    },
    {
      label: $t('REST 参数'),
      element: (
        <MessageDataGrid
          apiRef={restRef}
          initialRows={apiRest}
          onChange={setApiRest}
          contentType="FormData"
          messageType="REST"
          loaded={innerLoaded}
        />
      ),
      dirty: false
    }
  ]

  // FIXME:
  const [tabValue, setTabValue] = useState(tabs[0].label)

  const theme = useTheme()

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  const tabHeight = '30px'

  return (
    <Box
      sx={{
        borderColor: 'divider'
      }}
    >
      <Tabs
        value={tabValue}
        onChange={handleChange}
        aria-label={$t('api request editor')}
        sx={{
          minHeight: tabHeight,
          height: tabHeight,
          '& .MuiTabs-flexContainer': {
            minHeight: tabHeight,
            height: tabHeight
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.label}
            value={tab.label}
            label={
              <Box key={tab.label} display="flex" alignItems="center" pr={tab.dirty ? 0.5 : 0}>
                <Typography sx={{ fontSize: '14px' }}>{tab.label}</Typography>
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
              minHeight: tabHeight
            }}
          />
        ))}
      </Tabs>
      <Box>
        {tabs.map((tab) => (
          <Box hidden={tabValue !== tab.label} key={tab.label}>
            {tab.element}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
