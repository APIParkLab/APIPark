import { Box, Button, Typography } from '@mui/material'
import type { ChangeEvent } from 'react'
import { useRef } from 'react'
import {file2Base64} from "@common/utils/postcat.tsx";
import { $t } from '@common/locales';

interface UploadButtonProps {
  value?:
    | {
        name: string
        content: string
      }[]
    | null
  onChange?: (
    base64List: {
      name: string
      content: string
    }[]
  ) => void
}

export function UploadButton({ value, onChange }: UploadButtonProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = (): void => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files
    const filesArray = Array.from(files || [])
    const promises = filesArray.map((file) => file2Base64(file))
    const result = await Promise.all(promises)
    onChange?.(
      result.map((file, fileIndex) => ({
        name: filesArray[fileIndex].name,
        content: file
      }))
    )
  }

  return (
    <Box display="flex" alignItems="center">
      <input multiple type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      <Button variant="outlined" color="primary" onClick={handleButtonClick}>
        {$t('Upload Files')}
      </Button>
      {value?.length ? <Typography sx={{ marginLeft: 1 }}>{$t('Files Selected')}: {value.length}</Typography> : null}
    </Box>
  )
}
