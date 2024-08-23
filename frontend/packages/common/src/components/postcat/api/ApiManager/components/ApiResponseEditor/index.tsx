import { Box, Grow, Tab, Tabs, Typography, useTheme } from '@mui/material'
import { ReactNode, SyntheticEvent, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { MessageDataGrid, MessageDataGridApi } from '../MessageDataGrid'
import {ApiBodyType, BodyParamsType, HeaderParamsType} from "@common/const/api-detail";
import {Indicator} from "../../../../Indicator";
import { v4 as uuidv4} from 'uuid'
import { ApiMessageBody, ApiMessageBodyApi } from '../ApiMessageBody';
import { $t } from '@common/locales';

interface ApiRequestEditorTab {
  label: string
  element: ReactNode
  dirty: boolean
}

export interface ApiResponseEditorApi {
  getData: () => {
    bodyParams?: {
      contentType: ApiBodyType
      bodyParams: Partial<BodyParamsType>[]
    }
    headerParams: HeaderParamsType[]
  }
}

export function ApiResponseEditor({ editorRef ,apiInfo=null, loaded}: { editorRef?: React.RefObject<ApiResponseEditorApi> }) {
  const [apiHeaders, setApiHeaders] = useState<HeaderParamsType[] | null>([])
  const [innerLoaded, setInnerLoaded] = useState<boolean>(false)
  const headersRef = useRef<MessageDataGridApi>(null)
  const bodyRef = useRef<ApiMessageBodyApi>(null)

  useEffect(() => {
    if (loaded && (apiInfo || apiInfo === null)) {
      setApiHeaders((apiInfo?.responseList?.[0]?.responseParams?.headerParams as unknown as MessageBody[]) || [])
      setInnerLoaded(true)
    }
  }, [apiInfo, loaded])

  useImperativeHandle(editorRef, () => ({
    getData: () => {
      const bodyData = bodyRef.current?.getBodyMeta()
      const uuid = uuidv4()
      return ([{
        id:uuid,
        responseUuid:uuid,
        httpCode:bodyData?.contentType,
        responseParams:{
          bodyParams: bodyData?.bodyParams,
          headerParams: (headersRef.current?.getEditMeta() as HeaderParamsType[]) || []
        }
      }
      ])
    }
  }))

  const tabs: ApiRequestEditorTab[] = [
    {
      label: $t('返回头部'),
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
      label: $t('返回值'),
      element: <ApiMessageBody bodyApiRef={bodyRef} mode="response"  apiInfo={apiInfo}
      loaded={innerLoaded} />,
      dirty: false
    }
  ]

  // FIXME: devlop value
  const [tabValue, setTabValue] = useState(tabs[1].label)

  const theme = useTheme()

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  const tabHeight = '30px'

  return (
    <Box sx={{
      //  borderBottom: 1,
        borderColor: 'divider' }}>
      <Tabs
        value={tabValue}
        onChange={handleChange}
        aria-label={$t("api request editor")}
        sx={{
          minHeight: tabHeight,
          height: tabHeight,
          borderBottom: 1, borderColor: 'divider',
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
              minHeight: tabHeight
            }}
          />
        ))}
      </Tabs>
      <Box>
        {tabs.map((tab) => (
          <Box key={tab.label} hidden={tabValue !== tab.label}>
            {tab.element}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
