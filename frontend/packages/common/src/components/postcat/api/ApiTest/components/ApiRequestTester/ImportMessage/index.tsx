import { Box, Button, DialogContent, Paper, Typography, useTheme } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { IconButton } from '../../../../IconButton'
import {BaseDialog} from "../../../../Dialog";
import {Icon} from "../../../../Icon";
import {Codebox} from "../../../../Codebox";

export type ImportMessageChangeType = 'replace-all' | 'insert-end' | 'replace-changed'

export type ImportMessageOption = {
  key: string
  value: string
}

export type ImportMessageType = 'query' | 'form-data' | 'header'

interface ImportMessageDialogProps {
  type: ImportMessageType
  onChange?: (changeType: ImportMessageChangeType, data: ImportMessageOption[]) => void
}

export function ImportMessage({ type, onChange }: ImportMessageDialogProps) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState<string>('')
  const theme = useTheme()

  const example = useMemo(() => {
    if (type === 'query') {
      return `/api?name=Jack&age=18`
    }
    if (type === 'form-data') {
      return 'name: Jack\nage: 18'
    }
    if (type === 'header') return 'headerName: headerValue\nheaderName2: headerValue2'
  }, [type])

  useEffect(() => {
    setCode('')
  }, [open])

  const handleChange = (changeType: ImportMessageChangeType) => {
    setOpen(false)
    if (!code) return
    if (['form-data', 'header'].includes(type)) {
      const data = code.split('\n').map((line) => {
        const [key, value] = line.split(':')
        return { key: key?.trim(), value: value?.trim() }
      })
      onChange?.(changeType, data)
      return
    }
    if (['query'].includes(type)) {
      const data = code
        .split('?')[1]
        .split('&')
        .map((line) => {
          const [key, value] = line.split('=')
          return { key: key.trim(), value: value.trim() }
        })
      onChange?.(changeType, data)
      return
    }
  }

  return (
    <>
      <IconButton name="import" sx={{ height: '30px' }} onClick={() => setOpen(true)} variant="outlined">
        导入
      </IconButton>
      <BaseDialog open={open} onClose={() => setOpen(false)} actionRender={null} title={`Import ${type}`}>
        <DialogContent sx={{ paddingTop: 0, minWidth: '800px' }}>
          <Box sx={{ p: 0 }}>
            <Box pb={1}>
              <Paper elevation={0} sx={{ padding: 2, bgcolor: theme.palette.grey[200] }}>
                <Typography component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Icon name="attention" mx={0} px={0} sx={{ display: 'inline-flex', marginRight: 0.5 }} />
                  导入格式
                </Typography>
                <Typography variant="body2" component="div">
                  <pre>{example}</pre>
                </Typography>
              </Paper>
            </Box>
            <Codebox value={code} onChange={setCode} width="100%" height="300px" />
          </Box>
        </DialogContent>
        <Box display="flex" p={3} pt={0} gap={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button variant="outlined" onClick={() => handleChange('replace-all')}>
            全量替换
          </Button>
          <Button variant="outlined" onClick={() => handleChange('insert-end')}>
            在末端插入
          </Button>
          <Button variant="contained" onClick={() => handleChange('replace-changed')}>
            增量更新
          </Button>
        </Box>
      </BaseDialog>
    </>
  )
}
