
import { Autocomplete, Box, LinearProgress, TextField, ThemeProvider, Tooltip, createTheme, useTheme } from '@mui/material'
import {
  DataGridPro, GridCallbackDetails,
  GridColDef,
  GridRenderEditCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowParams, GridRowSelectionModel,
  useGridApiRef
} from '@mui/x-data-grid-pro'
import { RefObject, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import {Example,ApiParamsType, BodyParamsType, FileExample} from "@common/const/api-detail";
import {ContentType} from "../ApiRequestTester/TestBody/const.ts";
import {ImportMessageChangeType, ImportMessageOption} from "../ApiRequestTester/ImportMessage";
import {generateNumberId, getActionColWidth, traverse} from "@common/utils/postcat.tsx";
import {collapseTableSx} from "../../../PreviewTable";
import {IconButton} from "../../../IconButton";
import {RequestHeaders} from "../../../ApiManager/components/ApiRequestEditor/components/constants.ts";
import {
  AutoCompleteOption,
  DataGridAutoCompleteProps,
  DataGridTextFieldProps, EditableDataGridSx
} from "../../../ApiManager/components/EditableDataGrid";
import {Icon} from "../../../Icon";
import {ApiParamsTypeOptions} from "../../../ApiManager/components/ApiMessageBody/constants.ts";
import {UploadButton} from "../../../UploadButton";
import {isNil} from "lodash-es";

type SafeAny = unknown
export interface RenderBodyParamsType extends BodyParamsType {
  __globalIndex__?: number
  __levelIndex__?: number
  __raw__?: BodyParamsType
}

export type TestMessageType = 'Headers' | 'Body' | 'Query' | 'REST'

export interface TestMessageDataGridApi {
  getEditMeta: () => Partial<BodyParamsType>[]
  updateContentType?: (contentType: ContentType) => void
  importData: (changeType: ImportMessageChangeType, data: ImportMessageOption[]) => void
  updateRows: (rows: BodyParamsType[]) => void
}

interface TestMessageDataGridProps<T = SafeAny> {
  onChange?: (rows: T[]) => void
  onValueChange?: () => void
  onNameChange?: () => void
  initialRows?: T[] | null
  onDirty?: () => void
  loading?: boolean
  messageType?: TestMessageType
  apiRef?: RefObject<TestMessageDataGridApi>
  disabledContentType?: boolean
}

export function TestMessageDataGrid(props: TestMessageDataGridProps<BodyParamsType&{_checked?:boolean}>) {
  const {
    onChange,
    initialRows,
    onDirty,
    loading = false,
    messageType,
    apiRef,
    disabledContentType = false,
    onNameChange,
    onValueChange
  } = props

  const [rows, setRows] = useState<(BodyParamsType&{_checked?:boolean})[]>([])

  const [renderRows, setRenderRows] = useState<(RenderBodyParamsType&{_checked?:boolean})[]>([])
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})

  const [dirty, setDirty] = useState(false)

  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowId[]>([])
  const EmptyRow = useCallback(
    (val: string = ''): BodyParamsType => {
      const id = generateNumberId()
      const name = val
      let dataType = null
      if (messageType === 'Body') {
        dataType = ApiParamsType.string
      }

      return {
        id,
        name,
        dataType,
        _checked:true,
        isRequired: 1,
        description: '',
        paramAttr: {
          example: ''
        },
        childList: []
      } as unknown as BodyParamsType
    },
    [messageType]
  )

  useEffect(() => {
    // setTimeout(()=>{
    //   const element = document.querySelectorAll('.MuiDataGrid-main');
    //   if(element?.length > 0){
    //     for(const x of element){
    //       x.childNodes[x.childNodes.length - 1 ].textContent === 'MUI X Missing license key' ?  x.childNodes[x.childNodes.length - 1 ].textContent = '' :null
    //     }
    //   }
    // },500)
  }, []);

  useEffect(() => {
    dirty && onDirty?.()
  }, [dirty, onDirty])

  const tableApiRef = useGridApiRef()

  useEffect(() => {
    if (initialRows) {
      const newRow = EmptyRow()
      const updateRows = [...(initialRows||[]).map(x=>({...x,_checked:true})),newRow]
      setRows(updateRows)
      setRowSelectionModel(updateRows.map((row) => row.id))
      setDirty(false)
      onChange?.(updateRows)
    }
  }, [EmptyRow, initialRows, onChange])

  useEffect(() => {
    const neoRenderRows = rows.map((row, rowIndex) => ({ ...row, __globalIndex__: rowIndex, __levelIndex__: rowIndex }))
    setRenderRows(neoRenderRows)
    setRowSelectionModel(neoRenderRows.filter(x=>x._checked).map((x)=>x.id))
    setRowModesModel(neoRenderRows.reduce((acc, cur) => ({ ...acc, [cur.id]: { mode: GridRowModes.Edit } }), {}))
  }, [rows])

  const theme = useTheme()

  const borderRadius = theme.shape.borderRadius

  const hoverSx = useMemo(() => {
    return {
      ...collapseTableSx(borderRadius)
    }
  }, [borderRadius])

  const handleRowDelete = useCallback(
    (params: GridRowParams<RenderBodyParamsType>) => {
      const { id } = params.row
      setRows(rows.filter((row) => row.id !== id))
      setDirty(true)
    },
    [rows]
  )

  const getActions = useCallback(
    (params: GridRowParams<RenderBodyParamsType>) => {
      const actions = []
      if (renderRows.length > 1) {
        actions.push(<IconButton title="Delete" name="delete" onClick={() => handleRowDelete(params)} />)
      }
      return actions
    },
    [handleRowDelete, renderRows.length]
  )


  const columns: (GridColDef<RenderBodyParamsType> | false)[] = [
    messageType === 'Headers' && {
      field: 'name',
      headerName: '标签',
      editable: true,
      sortable: false,
      renderEditCell: (params) => {
        const options = RequestHeaders.map((option) => ({ label: option.key }))
        const contentTypeDisabled = params.value === 'Content-Type' && disabledContentType
        return (
          <Box display="flex" alignItems="center" width="100%">
            <Autocomplete
              freeSolo
              {...DataGridAutoCompleteProps}
              disabled={contentTypeDisabled}
              disableClearable={!contentTypeDisabled}
              value={params.value}
              options={options.map((o) => o.label)}
              renderInput={(inputParams) => (
                <TextField {...DataGridTextFieldProps} {...inputParams} autoComplete="off" placeholder="Key" />
              )}
              renderOption={AutoCompleteOption}
              onInputChange ={(e, v) => {
                params.api.setEditCellValue({ id: params.id, field: params.field, value: v }, e)
                const rowIndex = params.row.__globalIndex__ as number
                if (renderRows.length === rowIndex + 1 && e.target?.value?.length === 1 ) {
                  const newRow = EmptyRow()
                  setRows(prevRow => [...prevRow, newRow]);
                  setRowSelectionModel(prevRowS => [...prevRowS, newRow.id]);
                }
              }}
            />
            {contentTypeDisabled ? (
              <Tooltip title="Content-Type Locked: This header is auto-populated based on your data and cannot be edited.">
                <Box>
                  <Icon name="help" />
                </Box>
              </Tooltip>
            ) : null}
          </Box>
        )
      },
      width: 200
    },
    messageType !== 'Headers' && {
      field: 'name',
      headerName:'参数名',
      width: 200,
      editable: true,
      sortable: false,
      renderEditCell(params: GridRenderEditCellParams) {
        return (
          <Box display="flex" pl={1} alignItems="center" height="100%" width="100%">
            <TextField
              fullWidth
              value={params.value}
              autoComplete="off"
              placeholder="Name"
              onChange={(e) => {
                const newValue = e.target.value as string
                const rowIndex = params.row.__globalIndex__
                tableApiRef.current.setEditCellValue({ id: params.row.id, field: 'name', value: newValue })
                if (renderRows.length === rowIndex + 1) {
                  const newRow = EmptyRow()
                  setRows([...rows, newRow])
                  setRowSelectionModel([...rowSelectionModel, newRow.id])
                }
                onNameChange?.()
              }}
            />
          </Box>
        )
      }
    },
    messageType === 'Body' && {
      field: 'dataType',
      headerName: '类型',
      sortable: false,
      width: 120,
      type: 'singleSelect',
      editable: true,
      renderEditCell(params) {
        const options = ApiParamsTypeOptions.filter((option) => ['string', 'file'].includes(option.key)).map(
          (option) => ({
            label: option.key,
            value: option.value
          })
        )
        return (
          <>
            <Autocomplete
              {...DataGridAutoCompleteProps}
              options={options}
              value={options.find((option) => +option.value === +params.row.dataType!)}
              getOptionLabel={(option) => option.label}
              renderInput={(inputParams) => (
                <TextField
                  autoComplete="off"
                  {...DataGridTextFieldProps}
                  {...inputParams}
                  sx={{ paddingLeft: 1 }}
                  placeholder="Key"
                />
              )}
              renderOption={AutoCompleteOption}
              onChange={(e, v) => {
                const newValue = v?.value
                params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue }, e)
                setDirty(true)
              }}
            />
          </>
        )
      }
    },
    {
      field: 'paramAttr',
      sortable: false,
      headerName: '参数值',
      flex: 1,
      minWidth: 200,
      editable: true,
      renderEditCell(params) {
        const isFile = params.row.dataType === ApiParamsType.file
        const value = params.row.paramAttr?.example as Example
        if (isFile && value && !(value instanceof Array)) {
          params.row.paramAttr.example = []
        }
        if (!isFile && value && value instanceof Array) {
          params.row.paramAttr.example = ''
        }
        return isFile ? (
          <Box px={1}>
            <UploadButton
              value={(params.row.paramAttr?.example as FileExample) || []}
              onChange={(base64List) => {
                params.api.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: { ...params.row.paramAttr, example: base64List }
                })
                setDirty(true)
              }}
            />
          </Box>
        ) : (
          <TextField
            fullWidth
            autoComplete="off"
            value={params.row.paramAttr?.example || ''}
            onChange={(e) => {
              const newValue = e.target.value
              params.api.setEditCellValue(
                { id: params.id, field: params.field, value: { ...params.row.paramAttr, example: newValue } },
                e
              )
              setDirty(true)
              onValueChange?.()
            }}
            sx={{
              '&.MuiTextField-root input': {
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1)
              }
            }}
            placeholder="Value"
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
      align: 'left',
      getActions
    }
  ]

  const getEditMeta = (raw: boolean = false) => {
    const editMeta = tableApiRef.current.state.editRows
    traverse<BodyParamsType>(
      rows,
      (node: BodyParamsType) => {
        const editRowMeta = editMeta[node.id]
        if (editRowMeta) {
          Object.keys(editRowMeta).forEach((key) => {
            const value = editRowMeta[key]?.value
            if (!isNil(value)) {
              node[key as keyof BodyParamsType] = value
            }
          })
        }
      },
      'childList'
    )
    return rows.filter(
      (row) => tableApiRef.current.state.rowSelection.includes(row.id) && (raw ? true : row.name)
    ) as BodyParamsType[]
  }

  const updateContentType = (contentType: ContentType | null) => {
    const editRows = getEditMeta()
    const targetRow = editRows.find((row) => row.name === 'Content-Type')
    const id = targetRow?.id
    if (contentType) {
      id &&
        tableApiRef.current.setEditCellValue({
          id,
          field: 'paramAttr',
          value: { ...targetRow.paramAttr, example: contentType }
        })
    } else {
      setRows(rows.filter((row) => row.id !== id))

    }
  }

  const importData = (changeType: ImportMessageChangeType, data: ImportMessageOption[]) => {
    if (['replace-all', 'insert-end'].includes(changeType)) {
      const newRows = data.map((item) => {
        return { ...EmptyRow(item.key), paramAttr: { example: item.value } }
      })
      changeType === 'replace-all' && setRows(newRows as BodyParamsType[])
      changeType === 'insert-end' && setRows([...rows, ...newRows] as BodyParamsType[])
      return
    }
    if (['replace-changed'].includes(changeType)) {
      const editMeta = getEditMeta(true)
      data.forEach(({ key, value }) => {
        const target = editMeta.find((row) => row.name === key)
        if (target) {
          target.paramAttr.example = value
        } else {
          editMeta.push({ ...EmptyRow(key), paramAttr: { example: value } } as BodyParamsType)
        }
      })
      setRows(editMeta)
    }
  }

  const handleSelectionChange = ( rowSelectionModel: GridRowSelectionModel)=>{
    setRows((prevRow)=>(prevRow.map((x)=>({...x,_checked:rowSelectionModel.indexOf(x.id)!== -1}))))
    setRowSelectionModel(rowSelectionModel)
  }

  const updateRows = (rows: BodyParamsType[]) => {
    const newRows = rows?.length
      ? rows.map((row) => {
          return { ...EmptyRow(), ...row }
        })
      : [EmptyRow()]
    setRows(newRows)
    setRowSelectionModel(newRows.filter(x=>x._checked)?.map((row) => row.id))
  }

  useImperativeHandle(apiRef, () => ({
    getEditMeta,
    updateContentType,
    importData,
    updateRows
  }))

  return (
    <Box
      sx={{
        height: '100%',
        border: `1px solid #EDEDED`,
        borderRadius: `${theme.shape.borderRadius}px`,
        boxSizing:'border-box'
      }}
    >
    <ThemeProvider theme={createTheme({
      components: {
        MuiDataGrid: {
          styleOverrides: {
            columnHeader: {
              // 调整表头字体大小
              fontSize: '16px',
              lineHeight:'24px'
            },
          },
        },
      },
    })
  }>
      <DataGridPro
        apiRef={tableApiRef}
        editMode="row"
        rows={renderRows}
        rowModesModel={rowModesModel}
        sx={{
          ...EditableDataGridSx,
          ...hoverSx
        }}
        checkboxSelection
        rowHeight={40}
        columnHeaderHeight={40}
        initialState={{ pinnedColumns: { right: ['actions'] } }}
        columns={columns.filter((col) => col) as GridColDef<RenderBodyParamsType>[]}
        defaultGroupingExpansionDepth={-1}
        pagination={false}
        hideFooter
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={handleSelectionChange}
        autosizeOptions={{
          expand: true,
          includeHeaders: false
        }}
        loading={loading}
        slots={{
          loadingOverlay: LinearProgress
        }}
        disableColumnMenu={true}
        disableColumnReorder={true}
        disableColumnPinning={true}
        disableColumnSorting={true}
      /></ThemeProvider>
    </Box>
  )
}
