import { Autocomplete, Box, Checkbox, LinearProgress, TextField, Typography, useTheme } from '@mui/material'
import {
  DataGridPro,
  DataGridProProps,
  GridColDef,
  GridDataGroupNode,
  GridRenderEditCellParams,
  GridRowModes,
  GridRowModesModel,
  GridRowParams,
  useGridApiRef
} from '@mui/x-data-grid-pro'
import {
  ChangeEvent,
  RefObject,
  SyntheticEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react'
import { ApiParamsTypeOptions } from '../ApiMessageBody/constants'
import { RequestHeaders } from '../ApiRequestEditor/components/constants'
import {ApiParamsType, BodyParamsType, ParamAttrType, commonTableSx} from "@common/const/api-detail";
import {
    determineCheckState,
    flattenTree,
    generateId,
    getActionColWidth,
    isNil,
    traverse
} from "@common/utils/postcat.tsx";
import {MoreSetting} from "../../../MoreSetting";
import {
    AutoCompleteOption,
    DataGridAutoCompleteProps,
    DataGridTextFieldProps,
    EditableDataGridSx
} from "../EditableDataGrid";
import {collapseTableSx} from "../../../PreviewTable";
import {IconButton} from "../../../IconButton";
import {Icon} from "../../../Icon";
import {useMoreSettingHiddenConfig} from "./hooks/useMoreSettingHiddenConfig.ts";

export interface RenderMessageBody extends BodyParamsType {
  path?: string[]
  childList?: RenderMessageBody[]
  parent?: RenderMessageBody | null
  __globalIndex__?: number
  __levelIndex__?: number
  __raw__?: BodyParamsType
  __hasSiblingLeaf__?: boolean
}

export type MessageType = 'Body' | 'Header' | 'Query' | 'REST'
export type ContentType = 'FormData' | 'JSON' | 'XML' | 'Headers'

export interface MessageDataGridApi {
  getEditMeta: () => Partial<BodyParamsType>[]
}

interface MessageDataGridProps<T = unknown> {
  onChange?: (rows: T[]) => void
  initialRows?: T[] | null
  onDirty?: () => void
  loading?: boolean
  messageType?: MessageType
  contentType: ContentType
  isMoreSettingReadOnly?: boolean
  apiRef?: RefObject<MessageDataGridApi>
}

const groupingColDef: DataGridProProps['groupingColDef'] = {
  headerName: '',
  width: 40,
  resizable: false,
  renderCell: () => <></>
}

declare type CheckedStatus = 'checked' | 'unchecked' | 'indeterminate'

export function MessageDataGrid(props: MessageDataGridProps<RenderMessageBody>) {
  const {
    onChange,
    initialRows,
    onDirty,
    loading = false,
    contentType,
    messageType,
    isMoreSettingReadOnly,
    apiRef,
    loaded
  } = props

  const [rows, setRows] = useState<BodyParamsType[]>([])

  const [renderRows, setRenderRows] = useState<RenderMessageBody[]>([])

  const [currentMoreSettingParam, setCurrentMoreSettingParam] = useState<RenderMessageBody | null>(null)

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})

  const [dirty, setDirty] = useState(false)

  const [openMoreSettingDialog, setOpenMoreSettingDialog] = useState<boolean>(false)

  const [selectAll, setSelectAll] = useState<CheckedStatus>('unchecked')

  const [innerLoaded, setInnerLoaded] = useState<boolean>(false)

  const EmptyRow = useCallback(
    (val: string = ''): BodyParamsType => {
      const id = generateId()
      const name = val
      let dataType = null
      if (messageType === 'Body') {
        dataType = ApiParamsType.string
      }

      return {
        id,
        name,
        dataType,
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
    dirty && onDirty?.()
  }, [dirty, onDirty])

  const tableApiRef = useGridApiRef()

  const [showRootIndent, setShowRootIndent] = useState<boolean>(false)

  const updateSelectAll = useCallback(() => {
    const isRequiredList: {
      isRequired: boolean | 0 | 1
    }[] = []
    Object.values(tableApiRef.current.state.editRows).forEach((row) => {
      isRequiredList.push({
        isRequired: !!((row as unknown)?.isRequired?.value as boolean)
      })
    })
    setSelectAll(determineCheckState(isRequiredList))
  }, [tableApiRef])

  useEffect(() => {
    if (initialRows && loaded && !innerLoaded) {
      let updateRows = [...initialRows,EmptyRow()]
      if (!updateRows?.length && contentType !== 'XML') {
        updateRows = [EmptyRow()]
      }
      if (!updateRows?.length && contentType == 'XML') {
        const root = EmptyRow('root')
        root.childList = [EmptyRow()]
        updateRows = [root]
      }
      setRows(updateRows)
      updateSelectAll()
      setDirty(false)
      onChange?.(updateRows)
      setInnerLoaded(true)
    }
  }, [EmptyRow, contentType, initialRows, loaded,innerLoaded, onChange, updateSelectAll])

  useEffect(() => {
    const neoRenderRows = flattenTree(
      rows.map((i) => ({ ...i, __reorder__: i.name })),
      'childList',
      'id'
    )
    for (const row of rows) {
      if (row.childList?.length) {
        setShowRootIndent(true)
        break
      }
    }
    setRenderRows(neoRenderRows)
    setRowModesModel(neoRenderRows.reduce((acc, cur) => ({ ...acc, [cur.id]: { mode: GridRowModes.Edit } }), {}))
  }, [rows])

  const theme = useTheme()

  const borderRadius = theme.shape.borderRadius

  const hoverSx = useMemo(() => {
    return {
      ...collapseTableSx(borderRadius)
    }
  }, [borderRadius])

  const handleOpenMoreSetting = useCallback(
    (params: GridRowParams<RenderMessageBody>) => {
      setOpenMoreSettingDialog(true)
      const rowMeta = tableApiRef.current.state.editRows[params.row.id]
      const row = Object.keys(rowMeta).reduce((acc, key) => Object.assign(acc, { [key]: rowMeta[key].value }), {})
      setCurrentMoreSettingParam({ ...params.row, ...row })
    },
    [tableApiRef]
  )

  const handleCloseMoreSetting = useCallback(() => {
    setOpenMoreSettingDialog(false)
    setCurrentMoreSettingParam(null)
  }, [])

  const handleMoreSettingChange = useCallback(
    ({ id, param }: { id: string; param: Partial<ParamAttrType> }) => {
      const renderRow = renderRows.find((row) => row.id === id)
      if (!renderRow) return
      const row = renderRow.__raw__!
      Object.assign(row.paramAttr, param)
      setRows([...rows])
      setDirty(true)
      handleCloseMoreSetting()
    },
    [handleCloseMoreSetting, renderRows, rows]
  )

  const handleRowDelete = useCallback(
    (params: GridRowParams<RenderMessageBody>) => {
      const { id, parent } = params.row
      const parentChildList = parent?.childList ?? rows
      const index = parentChildList.findIndex((i) => i.id === id)
      parentChildList.splice(index, 1)
      setRows([...rows])
      setDirty(true)
    },
    [rows]
  )

  const [actionLength, setActionLength] = useState<number>(0)

  useEffect(() => {
    if (['JSON', 'XML'].includes(contentType)) {
      setActionLength(4)
    } else {
      setActionLength(3)
    }
  }, [contentType])

  const getActions = useCallback(
    (params: GridRowParams<RenderMessageBody>) => {
      const actions = [
        <IconButton title="更多设置" name="more" onClick={() => handleOpenMoreSetting(params)} />
      ]
      const isXML = contentType === 'XML'
      const isRoot = params.row.__globalIndex__ === 0
      if (['JSON', 'XML'].includes(contentType)) {
        actions.unshift(
          <IconButton
            title="添加子参数"
            name="add"
            onClick={() => {
              const newRow = EmptyRow()
              const row = tableApiRef.current.state.editRows[params.row.id]
              if (![ApiParamsType.array, ApiParamsType.object].includes(row.dataType.value)) {
                tableApiRef.current.setEditCellValue({
                  field: 'dataType',
                  id: params.row.id,
                  value: ApiParamsType.object
                })
                params.row.dataType = ApiParamsType.object
              }
              if (params.row.__raw__ && !params.row.__raw__.childList?.length) {
                params.row.__raw__.childList = []
              }
              // FIXME: Temporary fix for the issue of unable to add child nodes to the root node
              const rootRow = rows.find((row) => row.id === params.row.id)
              if (rootRow) {
                rootRow.childList?.unshift(newRow)
              } else {
                params.row?.__raw__?.childList?.unshift(newRow)
              }
              setRows([...rows])
            }}
          />
        )
        if (!(isXML && isRoot)) {
          actions.unshift(
            <IconButton
              title="向下添加行"
              name="down-small"
              onClick={() => {
                const newRow = EmptyRow()
                const currentLevelChildrenList = params.row.parent?.childList ?? rows
                currentLevelChildrenList?.splice((params.row.__levelIndex__ || 0) + 1, 0, newRow)
                setRows([...rows])
              }}
            />
          )
        }
      }
      if (renderRows.length > 1) {
        actions.push(<IconButton title="删除" name="delete" onClick={() => handleRowDelete(params)} />)
      }
      return actions
    },
     
    [EmptyRow, tableApiRef, contentType, handleOpenMoreSetting, handleRowDelete, renderRows.length, rows]
  )

  const columns: (GridColDef<RenderMessageBody> | false)[] = [
    messageType === 'Header' && {
      field: 'name',
      headerName: '标签',
      editable: true,
      sortable:false,
      renderEditCell: (params) => {
        const options = RequestHeaders.map((option) => option.key)
        return (
          <Autocomplete
            freeSolo
            {...DataGridAutoCompleteProps}
            value={params.value}
            options={options}
            renderInput={(inputParams) => <TextField {...DataGridTextFieldProps} {...inputParams} placeholder="Key" />}
            renderOption={AutoCompleteOption}
            onChange={(e, v) => {
              tableApiRef.current.setEditCellValue({ id: params.row.id, field: 'name', value: v }, e)
              const rowIndex = params.row.__globalIndex__ as number
              if (renderRows.length === rowIndex + 1) {
                const newRow = EmptyRow()
                  setRows((preRows)=>[...preRows,newRow])
              }
            }}
          />
        )
      },
      width: 200
    },
    messageType !== 'Header' && {
      field: 'name',
      headerName: '参数名',
      width: 200,
      editable: true,
      sortable: false,
      renderEditCell(params: GridRenderEditCellParams) {
        const rowNode = params.rowNode
        const id = params.row.id
        const handleClick = (event: SyntheticEvent) => {
          if (rowNode.type !== 'group') {
            return
          }
          tableApiRef.current.setRowChildrenExpansion(id, !rowNode.childrenExpanded)
          tableApiRef.current.setCellFocus(id, 'name')
          event.stopPropagation()
        }
        return (
          <Box display="flex" alignItems="center" height="100%" width="100%">
            {showRootIndent && (
              <Icon
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  ml: params.row.path.length,
                  visibility: !['group'].includes(rowNode.type) ? 'hidden' : 'visible'
                }}
                onClick={handleClick}
                name={(rowNode as GridDataGroupNode).childrenExpanded ? 'down' : 'right'}
                mx={0}
              />
            )}
            <TextField
              fullWidth
              value={params.value}
              placeholder='参数名'
              onChange={(e) => {
                const newValue = e.target.value as string
                const rowIndex = params.row.__globalIndex__
                tableApiRef.current.setEditCellValue({ id: params.row.id, field: 'name', value: newValue })
                if (
                  renderRows.length === rowIndex + 1 &&
                  !(contentType === 'XML' && params.row.__globalIndex__ === 0)
                ) {
                  const newRow = EmptyRow()
                  const currentLevelChildrenList = params.row.parent?.childList ?? rows
                  currentLevelChildrenList?.splice((params.row.__levelIndex__ || 0) + 1, 0, newRow)
                  setRows((preRows)=>[...preRows])
                }
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
        const options = ApiParamsTypeOptions.map((option) => ({
          label: option.key,
          value: option.value
        }))
        return (
          <>
            <Autocomplete
              {...DataGridAutoCompleteProps}
              disabled={contentType === 'XML' && params.row.__globalIndex__ === 0}
              options={options}
              value={options.find((option) => +option.value === +params.row.dataType!)}
              getOptionLabel={(option) => option.label}
              renderInput={(inputParams) => (
                <TextField {...DataGridTextFieldProps} {...inputParams} placeholder="Key" />
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
      field: 'isRequired',
      headerName: '必需',
      headerAlign: 'left',
      sortable: false,
      type: 'boolean',
      editable: true,
      renderHeader() {
        return (
          <Box px={1} display="flex" alignItems="center" justifyContent="start">
            <Checkbox
              size="small"
              checked={selectAll === 'checked'}
              indeterminate={selectAll === 'indeterminate'}
              onChange={handleSelectAllChange}
            />
            <Typography sx={{fontSize:'14px'}}>必需</Typography>
          </Box>
        )
      },
      width: 120,
      renderEditCell: (params) => (
        <Box px={2} width="100%" display="flex" justifyContent="flex-start">
          <Checkbox
            size="small"
            checked={Boolean(params.row.isRequired)}
            onChange={(_evt, checked) => {
              handleIsRequiredChange(checked, params.row.id)
              setDirty(true)
            }}
          />
        </Box>
      )
    },
    {
      field: 'description',
      headerName: '描述',
      sortable: false,
      flex: 1,
      minWidth: 200,
      editable: true,
      renderEditCell(params) {
        return (
          <TextField
            fullWidth
            value={params.row.description || ''}
            onChange={(e) => {
              const newValue = e.target.value
              params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue }, e)
              setDirty(true)
            }}
            sx={{
              '&.MuiTextField-root input': {
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1)
              }
            }}
            placeholder='描述'
          />
        )
      }
    },
    {
      field: 'paramAttr',
      sortable: false,
      headerName: '示例',
      flex: 1,
      minWidth: 200,
      editable: true,
      renderEditCell(params) {
        return (
          <TextField
            fullWidth
            value={params.row.paramAttr?.example || ''}
            onChange={(e) => {
              const newValue = e.target.value
              params.api.setEditCellValue(
                { id: params.id, field: params.field, value: { ...params.row.paramAttr, example: newValue } },
                e
              )
              setDirty(true)
            }}
            sx={{
              '&.MuiTextField-root input': {
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1)
              }
            }}
            placeholder='示例'
          />
        )
      }
    },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      sortable: false,
      width: getActionColWidth(actionLength),
      hideable: true,
      align: 'left',
      getActions
    }
  ]

  const handleIsRequiredChange = (checked: boolean, id: string) => {
    tableApiRef.current.setEditCellValue({ id, field: 'isRequired', value: checked })
    updateSelectAll()
  }

  const handleSelectAllChange = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    tableApiRef.current.getAllRowIds().forEach((id) => {
      tableApiRef.current.setEditCellValue({ id, field: 'isRequired', value: checked })
    })
    setSelectAll(checked ? 'checked' : 'unchecked')
  }

  const moreSettingHiddenConfig = useMoreSettingHiddenConfig({
    param: currentMoreSettingParam as RenderMessageBody,
    messageType: messageType as MessageType,
    readOnly: Boolean(isMoreSettingReadOnly)
  })

  const getEditMeta = () => {
    const editMeta = tableApiRef.current.state.editRows
    traverse<BodyParamsType>(
      rows,
      (node: BodyParamsType, index: number) => {
        const editRowMeta = editMeta[node.id]
        node.orderNo = index
        if (editRowMeta) {
          Object.keys(editRowMeta).forEach((key) => {
            const value = editRowMeta[key]?.value
            if (!isNil(value)) {
              node[key as keyof BodyParamsType] = value
            }
            if (key === 'isRequired') {
              node[key as keyof BodyParamsType] = +value
            }
          })
        }
      },
      'childList'
    )
    return rows.filter((row) => row.name) as BodyParamsType[]
  }

  useImperativeHandle(apiRef, () => ({
    getEditMeta
  }))

  return (
    <Box
      sx={{
        borderTop: `1px solid #EDEDED`,
        borderRadius: `${theme.shape.borderRadius}px`
      }}
    >
      <DataGridPro
        apiRef={tableApiRef}
        editMode="row"
        autoHeight
        rows={renderRows}
        rowModesModel={rowModesModel}
        sx={{
          ...EditableDataGridSx,
          ...hoverSx,
          ...commonTableSx
        }}
        rowHeight={40}
        columnHeaderHeight={40}
        initialState={{ pinnedColumns: { right: ['actions'] } }}
        columns={columns.filter((col) => col) as GridColDef<RenderMessageBody>[]}
        defaultGroupingExpansionDepth={-1}
        pagination={false}
        hideFooter
        treeData
        disableColumnMenu={true}
        disableColumnReorder={true}
        disableColumnPinning={true}
        disableColumnSorting={true}
        getTreeDataPath={(row) => row.path!}
        groupingColDef={groupingColDef}
        autosizeOptions={{
          expand: true,
          includeHeaders: false
        }}
        loading={loading}
        slots={{
          loadingOverlay: LinearProgress
        }}
      />
      {/* Dialog */}
      <MoreSetting
        readOnly={false}
        open={openMoreSettingDialog}
        onClose={handleCloseMoreSetting}
        hiddenConfig={moreSettingHiddenConfig}
        param={currentMoreSettingParam}
        onChange={handleMoreSettingChange}
      />
    </Box>
  )
}
