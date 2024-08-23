
import { Box, useTheme } from "@mui/material"
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro'
import { useMemo } from 'react'
import {collapseTableSx, previewTableHoverSx} from "../../../PreviewTable";
import {Collapse} from "../../../Collapse";
import { MatchPositionEnum, MatchTypeEnum } from "@core/const/system/const";
import { MatchItem } from "@common/const/type";
import { $t } from "@common/locales";

interface ApiMatchProps {
  rows?: MatchItem[]
  loading?: boolean
  validating?: boolean
  title: string | React.ReactNode
}

export default function ApiMatch({ rows = [], title, loading = false }: ApiMatchProps) {
  const theme = useTheme()

  const borderRadius = theme.shape.borderRadius

  const hoverSx = useMemo(() => {
    return {
      ...previewTableHoverSx(),
      ...collapseTableSx(borderRadius)
    }
  }, [borderRadius])

  const columns: GridColDef<MatchItem>[] = [
    {
      field: 'key',
      headerName: $t('参数名'),
      hideable: false,
      width:200
    },
    {
      field: 'position',
      headerName: $t('参数位置'),
      valueGetter: (params) => MatchPositionEnum[params.row.position],
      width:160
    },
    {
      field: 'matchType',
      headerName: $t('匹配类型'),
      valueGetter: (params) => MatchTypeEnum[params.row.matchType],
      width:160
    },
    {
      field: 'pattern',
      headerName: $t('参数值'),
      flex:1
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
          autosizeOptions={{
            expand: true,
            includeHeaders: false
          }}
        />
      </Box>
    </Collapse>
  )
}
