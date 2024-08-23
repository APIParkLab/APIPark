import { Box, Chip, Paper, Typography, useTheme } from '@mui/material'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'
import { $t } from '@common/locales'

export interface UploadProps {
  value?: File | null
  onChange?: (value: File | null) => void
}

export function Upload({ value, onChange }: UploadProps): JSX.Element {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length) {
        onChange?.(acceptedFiles[0])
      }
    },
    [onChange]
  )

  const [parent] = useAutoAnimate()

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const theme = useTheme()


  return (
    <Box ref={parent} display="flex" flexDirection="column" height="100%" gap={1}>
      <Paper
        variant="outlined"
        {...getRootProps()}
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px dashed ${theme.palette.grey[500]}`,
          '&:hover': {
            cursor: 'pointer',
            border: `1px dashed ${theme.palette.primary.main}`
          }
        }}
      >
        <input {...getInputProps()} />
        <Box>
          <Icon size="30px" name="link-cloud" />
        </Box>
        <Typography>{$t('将文件拖拽至此处上传，或点击选择文件上传')}</Typography>
      </Paper>
      {value ? (
        <Box>
          <Chip
            label={
              <Box display="flex" alignItems="center" pl={1} py={0.5}>
                <Typography>{value.name}</Typography>
                <IconButton iconSize="12px" name="close" onClick={(): void => onChange?.(null)} />
              </Box>
            }
          />
        </Box>
      ) : null}
    </Box>
  )
}
