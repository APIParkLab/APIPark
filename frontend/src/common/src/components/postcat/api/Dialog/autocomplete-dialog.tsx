import type { SubmitHandler } from 'react-hook-form'
import { useForm, Controller } from 'react-hook-form'
import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  DialogContent,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import type { SyntheticEvent } from 'react'
import { useCallback, useEffect } from 'react'
import type { BaseDialogProps } from './base-dialog'
import { BaseDialog, DialogActions } from './base-dialog'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'

export interface AutoCompleteOption {
  label: string
  value: string
  secondary?: string
  disabled?: boolean
}

export interface AutoCompleteDialogProps extends BaseDialogProps {
  title?: string
  defaultValue?: AutoCompleteOption[]
  placeholder?: string
  options: AutoCompleteOption[]
  validation?: {
    required?: string | boolean
  }
  onInputChange?: (val: string) => void
  loading?: boolean
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

export function AutoCompleteDialog(props: AutoCompleteDialogProps): JSX.Element {
  const {
    open,
    onClose,
    onConfirm,
    defaultValue = '',
    placeholder = '',
    options,
    validation = {},
    title,
    onInputChange,
    loading = false
  } = props
  const { control, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      value: defaultValue
    }
  })
  const { errors, isValid, isDirty } = formState

  const theme = useTheme()

  const resetForm = useCallback(() => {
    reset({})
  }, [reset])

  useEffect(() => {
    resetForm()
  }, [resetForm, open])

  const onSubmit: SubmitHandler<{ value: AutoCompleteOption[] | string }> = (data) => {
    onConfirm?.(data.value)
  }

  return (
    <BaseDialog open={open} onClose={onClose} actionRender={null} title={title}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ paddingTop: 0.5, minWidth: '300px', width: '400px' }}>
          <FormControl error={Boolean(errors.value)} variant="standard" fullWidth>
            <Controller
              name="value"
              control={control}
              rules={{
                required: validation.required || 'Field is required'
              }}
              render={({ field }): JSX.Element => {
                return (
                  <Autocomplete<AutoCompleteOption, true>
                    {...field}
                    loading={loading}
                    disableCloseOnSelect
                    limitTags={1}
                    multiple
                    filterOptions={(x) => x}
                    isOptionEqualToValue={(option, v): boolean => option.value === v.value}
                    getOptionLabel={(option): string => option.label}
                    options={options}
                    getOptionDisabled={(option): boolean => option.disabled || false}
                    renderOption={(props, option, { selected }) => (
                      <Box {...props} component="li" display="flex">
                        <Box>
                          <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8, padding: 0 }}
                            checked={selected || option.disabled}
                          />
                          {option.label}
                        </Box>
                        {option.secondary ? (
                          <Typography sx={{ color: theme.palette.grey[600], marginLeft: 1 }} component="span">
                            ({option.secondary})
                          </Typography>
                        ) : null}
                      </Box>
                    )}
                    onInputChange={(_evt: SyntheticEvent, value: string): void => {
                      onInputChange?.(value)
                    }}
                    renderInput={(params): JSX.Element => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder={placeholder}
                        error={Boolean(errors.value)}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          )
                        }}
                        autoComplete="off"
                      />
                    )}
                    onChange={(_evt, option): void => {
                      field.onChange(option)
                    }}
                    value={field.value as AutoCompleteOption[]}
                  />
                )
              }}
            />
            {errors.value ? <FormHelperText error>{errors.value.message}</FormHelperText> : null}
          </FormControl>
        </DialogContent>
        <DialogActions
          onClose={onClose}
          confirmDisabled={!(isValid && isDirty)}
          {...props}
          onConfirm={(): null => null}
        />
      </form>
    </BaseDialog>
  )
}
