import { TextField, useTheme } from '@mui/material'
import {
  DataGridPro,
  GridColDef,
  GridRenderEditCellParams,
  GridRowModesModel,
  GridRowParams,
  useGridApiRef
} from '@mui/x-data-grid-pro'
import { RefObject, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { IconButton } from '../../IconButton'
import { flattenTree, generateId, getActionColWidth } from '@common/utils/postcat.tsx'
import { EditableDataGridSx } from '../../ApiManager/components/EditableDataGrid'
import { commonTableSx } from '@common/const/api-detail/index.ts'
import { $t } from '@common/locales'

export interface ValueEnum {
  value: string
  description: string
}

export interface ValueEnumApi {
  getEditMeta: () => Partial<ValueEnum>[]
}

interface ValueEnumProps {
  data: ValueEnum[] | null
  apiRef?: RefObject<ValueEnumApi>
  readOnly?: boolean
}

interface Row extends ValueEnum {
  id: string
}

class EmptyRow implements Row {
  constructor(val?: string, description?: string) {
    this.id = generateId()
    this.value = val || ''
    this.description = description || ''
  }
  id = ''
  value = ''
  description = ''
}

export function ValueEnum({ data, apiRef, readOnly = false }: ValueEnumProps) {
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  const tableApiRef = useGridApiRef()
  const [rows, setRows] = useState<Row[]>([new EmptyRow()])
  const [renderRows, setRenderRows] = useState<Row[]>([])
  const theme = useTheme()

  useEffect(() => {
    if (data?.length) {
      const newRows = data.map((row) => ({ ...row, id: generateId() }))
      setRows(newRows)
    }
  }, [data])

  useEffect(() => {
    const newRenderRows = flattenTree(rows)
    setRenderRows(newRenderRows)
    const rowModesModel = newRenderRows.reduce((acc, cur) => ({ ...acc, [cur.id]: { mode: 'edit' } }), {})
    setRowModesModel(rowModesModel)
  }, [rows])

  const getEditMeta = () => {
    const editRows: Partial<Row>[] = rows.map((row) => {
      const editMeta = tableApiRef.current.state.editRows[row.id]
      const editMetaCollections = Object.keys(editMeta).reduce(
        (acc, cur) => {
          return Object.assign(acc, {
            [cur]: editMeta[cur].value
          })
        },
        { id: row.id }
      )
      return editMetaCollections
    })
    return editRows
  }

  useImperativeHandle(apiRef, () => ({
    getEditMeta
  }))

  const handleRowDelete = useCallback(
    (params: GridRowParams<Row>) => {
      setRows(rows.filter((row) => row.id !== params.row.id))
    },
    [rows]
  )

  const columns: GridColDef<Row>[] = [
    {
      field: 'value',
      headerName: $t('值枚举'),
      type: 'string',
      sortable: false,
      flex: 1,
      editable: !readOnly,
      align: 'left',
      headerAlign: 'left',
      renderEditCell(params: GridRenderEditCellParams) {
        return (
          <TextField
            fullWidth
            value={params.value}
            placeholder={$t('枚举')}
            sx={{
              input: {
                paddingLeft: `${theme.spacing(1)} !important`,
                paddingRight: `${theme.spacing(1)} !important`
              }
            }}
            onChange={(e) => {
              const newValue = e.target.value as string
              const rowIndex = params.row.__globalIndex__
              params.api.setEditCellValue({ id: params.row.id, field: 'value', value: newValue })
              const rowIds = params.api.getAllRowIds()
              if (rowIds.length === rowIndex + 1) {
                const newRow = new EmptyRow()
                setRows([...rows, newRow])
              }
            }}
          />
        )
      }
    },
    {
      field: 'description',
      headerName: $t('描述'),
      type: 'string',
      sortable: false,
      flex: 1,
      editable: !readOnly,
      align: 'left',
      headerAlign: 'left',
      renderEditCell(params) {
        return (
          <TextField
            fullWidth
            value={params.value || ''}
            onChange={(e) => {
              const newValue = e.target.value
              params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue }, e)
            }}
            sx={{
              input: {
                paddingLeft: `${theme.spacing(1)} !important`,
                paddingRight: `${theme.spacing(1)} !important`
              }
            }}
            placeholder={$t('示例')}
          />
        )
      }
    },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      sortable: false,
      width: getActionColWidth(1),
      hideable: true,
      getActions: (params) => {
        if (renderRows.length <= 1) return []
        return [
          <IconButton
            title={$t('删除')}
            name="delete"
            onClick={() => {
              handleRowDelete(params)
            }}
          />
        ]
      }
    }
  ]

  return (
    <>
      <DataGridPro
        apiRef={tableApiRef}
        rows={renderRows}
        columns={columns}
        initialState={{ pinnedColumns: { right: ['actions'] } }}
        sx={{
          ...EditableDataGridSx,
          ...commonTableSx,
          '.MuiDataGrid-row:hover': {
            backgroundColor: 'transparent'
          }
        }}
        rowHeight={40}
        columnHeaderHeight={40}
        rowModesModel={rowModesModel}
        pagination={false}
        hideFooter
        disableColumnMenu={true}
        disableColumnReorder={true}
        disableColumnPinning={true}
        disableColumnSorting={true}
      />
    </>
  )
}
