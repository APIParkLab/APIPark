import { DataGridTextFieldProps } from '@common/components/postcat/api/ApiManager/components/EditableDataGrid'
import { memo, ChangeEvent } from 'react'
import { TextField as MuiTextField } from '@mui/material'

interface TextFieldProps {
  rowId: string
  defaultValue: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}

export const TextField = ({ rowId, defaultValue, onChange, placeholder }: TextFieldProps) => {
  return (
    <MuiTextField
      key={rowId}
      {...DataGridTextFieldProps}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={onChange}
    />
  )
}

export const DataGridTextField = memo(TextField)
