import { Box, LinearProgress, useTheme } from '@mui/material'
import { DataGridPro, GridColDef, useGridApiRef } from '@mui/x-data-grid-pro'
import { useEffect, useMemo } from 'react'
import {ApiBodyType, ApiParamsType, BodyParamsType} from "@common/const/api-detail";
import {collapseTableSx, PreviewGridActionsCellItem, previewTableHoverSx} from "../../../PreviewTable";
import {Collapse} from "../../../Collapse";
import { PreviewBodyBinary } from './components/Binary';
import { PreviewBodyRaw } from './components/Raw';
import { $t } from '@common/locales';

export interface RenderMessageBody extends BodyParamsType {
  path: string[]
}

interface MessageBodyProps {
  rows?: RenderMessageBody[]
  loading?: boolean
  validating?: boolean
  contentType?: ApiBodyType
  title: string
  onMoreSettingChange?: (row: RenderMessageBody) => void
}

export default function MessageBodyComponent({
  rows = [],
  contentType,
  title,
  validating,
  loading = false,
  onMoreSettingChange
}: MessageBodyProps) {
  const apiRef = useGridApiRef()
  const theme = useTheme()

  const borderRadius = theme.shape.borderRadius

  const hoverSx = useMemo(() => {
    return {
      ...previewTableHoverSx(),
      ...collapseTableSx(borderRadius)
    }
  }, [borderRadius])


  useEffect(() => {
    rows.forEach((row) => {
      row?.childList?.length && apiRef.current.setRowChildrenExpansion(row.id, true)
    })
  }, [apiRef, rows, validating])

  const columns: GridColDef<RenderMessageBody>[] = [
    {
      field: 'dataType',
      headerName: $t('类型'),
      valueGetter: (params) => ApiParamsType[params.row.dataType as ApiParamsType],
      width: 80
    },
    {
      field: 'isRequired',
      headerName: $t('必需'),
      sortable: false,
      valueGetter: (params) => Boolean(params.row.isRequired),
      type: 'boolean',
      width: 200
    },
    {
      field: 'description',
      headerName: $t('描述'),
      flex: 1
    },
    {
      field: 'paramAttr',
      headerName:$t('示例'),
      valueGetter: (params) => params.row.paramAttr?.example,
      flex: 1
    },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      sortable: false,
      width: 40,
      hideable: true,
      getActions: (params) => [
        <PreviewGridActionsCellItem
            icon="more"
            label={$t("More")}
            key="more"
            onClick={() => onMoreSettingChange?.(params.row)}
        />
      ]
    }
  ]

  return (
    <Collapse title={title} tag={typeof contentType === 'number' ? ApiBodyType[contentType] : ''}>
      <Box width="100%">
        {contentType !==  ApiBodyType.Binary && contentType !== ApiBodyType.Raw &&<DataGridPro
          apiRef={apiRef}
          autoHeight
          treeData
          rows={rows}
          sx={hoverSx}
          columns={columns}
          columnHeaderHeight={40}
          rowHeight={40}
          pagination={false}
          groupingColDef={{
            headerName: $t('参数名'),
            sortable:true,
            width: 200,
            hideable: false,
            hideDescendantCount: true
          }}
          getTreeDataPath={(row) => row.path}
          hideFooter
          disableColumnMenu={true}
          disableColumnReorder={true}
          disableColumnPinning={true}
          autosizeOptions={{
            expand: true,
            includeHeaders: false
          }}
          loading={loading}
          slots={{
            loadingOverlay: LinearProgress
          }}
        />}
        { contentType ===ApiBodyType.Binary && <PreviewBodyBinary value={rows?.[0].binaryRawData} /> } 
        { contentType === ApiBodyType.Raw && <PreviewBodyRaw value={rows?.[0].binaryRawData}  />}
      </Box>
    </Collapse>
  )
}
