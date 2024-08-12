import { useTheme, Box } from "@mui/material"
import { GridColDef, DataGridPro } from "@mui/x-data-grid-pro"
import {  Descriptions } from "antd"
import { useState, useMemo, useEffect } from "react"
import { SystemApiProxyType, ProxyHeaderItem } from "@core/const/system/type"
import { previewTableHoverSx, collapseTableSx } from "../../../PreviewTable"
import { RenderMessageBody } from "../MessageBody"
import { Collapse } from "../../../Collapse"

interface HeaderFieldsProps {
  proxyInfo:SystemApiProxyType
  loading?: boolean
  validating?: boolean
  title: string
  onMoreSettingChange?: (row: RenderMessageBody) => void
}

export default function ApiProxy({ proxyInfo, title, loading = false, onMoreSettingChange }: HeaderFieldsProps) {
  const theme = useTheme()
  const [rows,setRows] = useState<[]>([])
  const borderRadius = theme.shape.borderRadius

  const hoverSx = useMemo(() => {
    return {
      ...previewTableHoverSx(),
      ...collapseTableSx(borderRadius)
    }
  }, [borderRadius])

  const columns: GridColDef<ProxyHeaderItem>[] = [
    {
      field: 'key',
      headerName: '参数名',
      width: 200,
      hideable: false
    },
    {
      field: 'optType',
      headerName: '操作类型',
      valueGetter: (params) => params.row.optType === 'ADD'?'新增或修改':'删除',
      width: 200
    },
    {
      field: 'value',
      headerName: '匹配参数值',
      flex: 1
    },
  ]

  const getBasicInfo = useMemo(() => {
    return [
      {
        key: 'path',
        label: '转发上游路径',
        children: proxyInfo?.path,
        style: {paddingBottom: '10px'},
      },
      {
        key: 'timeout',
        label: '请求超时时间',
        children: proxyInfo?.timeout,
        style: {paddingBottom: '10px'},
      },
      // {
      //   key: 'upstream',
      //   label: '绑定上游服务',
      //   children: proxyInfo?.upstream.name,
      //   style: {paddingBottom: '10px'},
      // },
      {
        key: 'retry',
        label: '重试时间',
        children: proxyInfo?.retry,
        style: {paddingBottom: '10px'},
      },
      ...(proxyInfo.headers.length > 0 ? [{
        key: 'headers',
        label: '转发上游请求头',
        children: '',
        style: {paddingBottom: '10px'},
      }]:[])
    ];
  }, [proxyInfo]);

  useEffect(() => {
    setRows(proxyInfo?.headers || [])
  }, [proxyInfo]);

  return (
    <Collapse title={title}>
      <Box width="100%">
        <Descriptions className={`bg-bar-theme p-btnbase ${proxyInfo?.headers?.length > 0 ? 'border-0 border-b border-solid border-b-BORDER': ''} `}  title="" items={getBasicInfo} column={2} labelStyle={{width:'120px',justifyContent:'flex-end',fontWeight:'bold'}}  contentStyle={{color:'#333'}}/>

        {proxyInfo?.headers?.length > 0 &&
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
          />
        }
      </Box>
    </Collapse>
  )
}
