
import { Box, SxProps, TextFieldProps, Theme } from '@mui/material'
import { HTMLAttributes, KeyboardEvent } from 'react'

export const EditableDataGridSx = {
  '& .MuiTextField-root': {
    input: {
      border: 'none',
      width: '100%',
      paddingLeft: 0,
      paddingRight: 0
    }
  },
  '& .MuiAutocomplete-root': {
    '& .MuiInputBase-root.MuiInputBase-sizeSmall': {
      input: {
        padding: 0
      },
      paddingLeft: 0,
      paddingRight: 0
    },
    '& .MuiAutocomplete-input': {
      padding: 0
    },
    input: {
      paddingLeft: 0,
      paddingRight: 0
    }
  },
  '& .MuiInput-underline:after': {
    borderBottom: 'none'
  },
  '& .MuiInput-underline:before': {
    borderBottom: 'none'
  },
  '&:hover .MuiInput-underline:before': {
    borderBottom: 'none'
  },
  '& .MuiInputBase-root': {
    width: '100%',
    border: 'none',
    paddingLeft: 0,
    paddingRight: 0
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: 'none'
    }
  }
}

/** Prevents 'Select All' in DataGridPro when selecting text in TextField. */
const handleDataGridTextFieldKeydown = (evt: KeyboardEvent<HTMLInputElement>) => {
  if ((evt.metaKey || evt.ctrlKey) && evt.key === 'a') {
    evt.stopPropagation()
  }
}

export const DataGridTextFieldProps: TextFieldProps = {
  fullWidth: true,
  variant: 'outlined',
  onKeyDown: handleDataGridTextFieldKeydown,
  sx: { paddingLeft: 1 }
}

export const DataGridAutoCompleteProps = {
  disableClearable: true,
  sx: {
    width: 300,
    padding: 0,
    '& .MuiAutocomplete-endAdornment': {
      display: 'none'
    }
  } as SxProps<Theme>
}

export function AutoCompleteOption(props: HTMLAttributes<HTMLLIElement>, option: { label: string } | string) {
  const title = typeof option === 'string' ? option : option.label
  return (
    <Box component="li" {...props}>
      <Box display="block" overflow="hidden" textOverflow="ellipsis" title={title}>
        {title}
      </Box>
    </Box>
  )
}
