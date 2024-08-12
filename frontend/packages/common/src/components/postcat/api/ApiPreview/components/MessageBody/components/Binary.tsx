import { TextField } from '@mui/material'

export function PreviewBodyBinary({ value }: { value: string;}) {
  return (
    <TextField
      label="Binary"
      multiline
      disabled={true}
      rows={4}
      value={value}
      fullWidth
    />
  )
}
