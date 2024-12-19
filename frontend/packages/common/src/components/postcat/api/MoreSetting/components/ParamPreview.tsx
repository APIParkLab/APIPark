import { Box } from '@mui/material'
import { DataGridPro, GridColDef, useGridApiRef } from '@mui/x-data-grid-pro'
import { useEffect, useMemo } from 'react'
import { previewTableHoverSx } from '../../PreviewTable'
import { $t } from '@common/locales'

interface ParamPreviewProps {
  name?: string
  type?: string
  required?: boolean
  description?: string
}

export function ParamPreview(props: ParamPreviewProps) {
  const { name, type, required, description } = props
  const apiRef = useGridApiRef()

  const rows = useMemo(() => {
    return [
      {
        id: '0',
        name,
        type,
        required,
        description
      }
    ]
  }, [name, type, required, description])

  useEffect(() => {
    // setTimeout(()=>{
    //   const element = document.querySelectorAll('.MuiDataGrid-main');
    //   if(element?.length > 0){
    //     for(const x of element){
    //       x.childNodes[x.childNodes.length - 1 ].textContent === 'MUI X Missing license key' ?  x.childNodes[x.childNodes.length - 1 ].textContent = '' :null
    //     }
    //   }
    // },500)
  }, [])

  const hoverSx = useMemo(() => {
    return {
      ...previewTableHoverSx()
    }
  }, [])

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: $t('参数名'),
      width: 120
    },
    {
      field: 'type',
      headerName: $t('类型'),
      width: 120
    },
    {
      field: 'required',
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
    }
  ]

  return (
    <Box width="100%">
      <DataGridPro
        apiRef={apiRef}
        autoHeight
        rows={rows}
        sx={hoverSx}
        columns={columns}
        pagination={false}
        getTreeDataPath={(row) => row.path}
        hideFooter
        autosizeOptions={{
          expand: true,
          includeHeaders: false
        }}
        columnHeaderHeight={40}
        rowHeight={40}
        disableColumnMenu={true}
        disableColumnReorder={true}
        disableColumnPinning={true}
        disableColumnSorting={true}
      />
    </Box>
  )
}
