import  { memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Box, useTheme } from '@mui/material'
import { Editor, useMonaco } from '@monaco-editor/react'
import { type editor as MonacoEditor } from 'monaco-editor'
import { IconButton } from '../IconButton'
import { message } from 'antd'
import { $t } from '@common/locales'
import { RESPONSE_TIPS } from '@common/const/const'

export interface CodeboxApiRef {
  insertCode: (value: string) => void
  formatCode: () => void
}

export type codeBoxLanguagesType = 'html' | 'json' | 'xml' | 'javascript' | 'css' | 'plaintext'|'yaml'
interface CodeboxProps {
  options?: MonacoEditor.IStandaloneEditorConstructionOptions
  value?: string
  onChange?: (value: string) => void
  enableToolbar?: boolean
  width?: string
  height?: string | null
  readOnly?: boolean
  apiRef?: RefObject<CodeboxApiRef>
  language?: codeBoxLanguagesType
  extraContent?:React.ReactNode
  sx?:Record<string,unknown>
  editorTheme?:'vs' | 'vs-dark' | 'hc-black'
}

export const Codebox =  memo((props: CodeboxProps) => {
  const {
    options,
    value: controlledValue,
    onChange,
    enableToolbar = true,
    width = '800px',
    height,
    apiRef,
    readOnly = false,
    language = 'plaintext',
    extraContent,
    editorTheme = 'vs'
  } = props

  const [code, setCode] = useState<string>(``)
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const monaco = useMonaco()

  const defaultOptions: MonacoEditor.IStandaloneEditorConstructionOptions = {
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    wrappingStrategy: 'advanced',
    minimap: {
      enabled: false
    },
    formatOnPaste: true,
    formatOnType: true,
    scrollbar: {
      scrollByPage: true,
      alwaysConsumeMouseWheel: false
    },
    overviewRulerLanes: 0,
    quickSuggestions: { other: true, strings: true },
    readOnly,
    insertSpaces: true,
    tabSize: 2
  }

  const isControlled = 'value' in props


  const [editorHeight, setEditorHeight] = useState('5em')
  const updateEditorHeight = useCallback((): void => {
    const model = editorRef.current?.getModel()
    if (model) {
      const DefaultLineHeight = 18
      const renderHeight = Math.max(editorRef.current?.getContentHeight() || DefaultLineHeight * 5)
      setEditorHeight(`${renderHeight}px`)
    }
  }, [])

  useImperativeHandle(apiRef, () => ({
    insertCode,
    formatCode
  }))

  useEffect(() => {
    updateEditorHeight()
  }, [updateEditorHeight])

  const handleEditorChange = (value?: string): void => {
    if (!isControlled) {
      setCode(value || '')
    }
    onChange?.(value || '')
    updateEditorHeight()
  }

  const insertCode = (value: string): void => {
    if (editorRef.current && monaco) {
      const selection = editorRef.current.getSelection()
      if (!selection) return
      const range = new monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      )
      editorRef.current.executeEdits('', [
        {
          range,
          text: value,
          forceMoveMarkers: true
        }
      ])
      editorRef.current.focus()
    }
  }

  const editorDidMount = (editor: MonacoEditor.IStandaloneCodeEditor): void => {
    editorRef.current = editor
  }

  const formatCode = async (): Promise<void> => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  }

  const copyCode = async (): Promise<void> => {
    if (editorRef.current) {
       await navigator.clipboard.writeText(editorRef.current.getValue())
      message.success($t(RESPONSE_TIPS.copySuccess))
    }
  }

  const searchInCode = async (): Promise<void> => {
    if (editorRef.current) {
      await editorRef.current.getAction('actions.find')?.run()
    }
  }

  const replaceInCode = async (): Promise<void> => {
    if (editorRef.current) {
      await editorRef.current.getAction('editor.action.startFindReplaceAction')?.run()
    }
  }

  const theme = useTheme()

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        // border: `1px solid ${theme.palette.divider}`,
        height: '100%',
        width: '100%',
        ...props.sx
      }}
    >
      {enableToolbar ? (<>
        <Box
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            display:'flex',
            alignItems:'center',
            height:'31px'
          }}
        >
        {extraContent}

          <IconButton name="code" onClick={formatCode} sx={{color:'#333',transition:'none','&.MuiButtonBase-root:hover':{background:'transparent',color:'#3D46F2',transition:'none'}}}>
            {$t('格式化')}
          </IconButton>
          <IconButton name="copy" onClick={copyCode}  sx={{color:'#333',transition:'none','&.MuiButtonBase-root:hover':{background:'transparent',color:'#3D46F2',transition:'none'}}}>
           {$t('复制')}
          </IconButton>
          <IconButton name="search" onClick={searchInCode}  sx={{color:'#333',transition:'none','&.MuiButtonBase-root:hover':{background:'transparent',color:'#3D46F2',transition:'none'}}}>
            {$t('搜索')}
          </IconButton>
          {!readOnly &&<IconButton name="file-text" onClick={replaceInCode}  sx={{color:'#333',transition:'none','&.MuiButtonBase-root:hover':{background:'transparent',color:'#3D46F2',transition:'none'}}}>
           {$t('替代')}
          </IconButton>}
        </Box></>
      ) : null}
      <Editor
        height={height ?? editorHeight}
        width={width}
        language={language}
        onMount={editorDidMount}
        value={isControlled ? controlledValue : code}
        options={{ ...defaultOptions, ...options }}
        onChange={handleEditorChange}
        theme={editorTheme}
      />
    </Box>
  )
})
