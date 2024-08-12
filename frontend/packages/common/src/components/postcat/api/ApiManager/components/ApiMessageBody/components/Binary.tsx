import { TextField } from '@mui/material'
import { SyntheticEvent } from 'react'

export function RequestBodyBinary({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <TextField
      label="Binary"
      multiline
      rows={4}
      value={value}
      onChange={(evt: SyntheticEvent) => {
        onChange((evt.target as HTMLInputElement).value)
      }}
      fullWidth
    />
  )
}
