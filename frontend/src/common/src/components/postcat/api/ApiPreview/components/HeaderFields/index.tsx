import { Box, LinearProgress, useTheme } from '@mui/material'
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro'
import { useMemo } from 'react'
import { RenderMessageBody } from '../MessageBody'
import { HeaderParamsType } from '@common/const/api-detail'
import { collapseTableSx, PreviewGridActionsCellItem, previewTableHoverSx } from '../../../PreviewTable'
import { Collapse } from '../../../Collapse'
import { $t } from '@common/locales'

interface HeaderFieldsProps {
  rows?: HeaderParamsType[]
  loading?: boolean
  validating?: boolean
  title: string
  onMoreSettingChange?: (row: RenderMessageBody) => void
}

export default function HeaderFields({ rows = [], title, loading = false, onMoreSettingChange }: HeaderFieldsProps) {
  const theme = useTheme()

  const borderRadius = theme.shape.borderRadius

  const hoverSx = useMemo(() => {
    return {
      ...previewTableHoverSx(),
      ...collapseTableSx(borderRadius)
    }
  }, [borderRadius])

  const columns: GridColDef<HeaderParamsType>[] = [
    {
      field: 'name',
      headerName: $t('标签'),
      width: 200,
      hideable: false
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
      field: 'actions',
      // renderHeader: () => <IconButton name="view-list" />,
      type: 'actions',
      resizable: false,
      sortable: false,
      width: 40,
      hideable: true,
      getActions: (params) => [
        <PreviewGridActionsCellItem
          icon="more"
          label={$t('More')}
          key="more"
          onClick={() => onMoreSettingChange?.(params.row as unknown as RenderMessageBody)}
        />
      ]
    }
  ]

  return (
    <Collapse title={title}>
      <Box width="100%">
        <DataGridPro
          autoHeight
          rows={rows}
          sx={hoverSx}
          columns={columns}
          pagination={false}
          hideFooter
          columnHeaderHeight={40}
          rowHeight={40}
          disableColumnMenu={true}
          disableColumnReorder={true}
          disableColumnPinning={true}
          disableColumnSorting={true}
          autosizeOptions={{
            expand: true,
            includeHeaders: false
          }}
          loading={loading}
          slots={{
            loadingOverlay: LinearProgress
          }}
        />
      </Box>
    </Collapse>
  )
}
