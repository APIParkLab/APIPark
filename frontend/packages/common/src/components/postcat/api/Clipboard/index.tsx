
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Box } from '@mui/material'
import { IconButton } from '../IconButton'
import useCopyToClipboard from "@common/hooks/copy.ts";

export interface ClipboardProps {
  text: string
  children?: ReactNode
  onSuccess?: () => void
  onError?: () => void
}

export function Clipboard(props: ClipboardProps): JSX.Element {
  const { text, children, onError, onSuccess } = props
  const DefaultText = '复制'
  const [buttonTitle, setButtonTitle] = useState(DefaultText)
  const { copyToClipboard } = useCopyToClipboard();
  const handleCopy = (): void => {
    copyToClipboard(text)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (buttonTitle !== DefaultText) setButtonTitle(DefaultText)
    }, 2000)

    return () => clearTimeout(timer)
  }, [buttonTitle])

  return (
    <Box component="div" onClick={handleCopy}>
      {children || <IconButton sx={{borderRadius:'4px', padding:'4px 8px'}} name="copy" title={buttonTitle} />}
    </Box>
  )
}
