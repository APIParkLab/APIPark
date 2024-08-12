import type { SubmitHandler } from 'react-hook-form'
import { useForm, Controller } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import { DialogContent, FormControl, FormHelperText } from '@mui/material'
import { useCallback, useEffect, useRef } from 'react'
import type { BaseDialogProps } from './base-dialog'
import { BaseDialog, DialogActions } from './base-dialog'

export interface InputDialogProps extends BaseDialogProps {
  title?: string
  defaultValue?: string
  placeholder?: string
  validation?: {
    required?: string | boolean
  }
}

export function InputDialog(props: InputDialogProps): JSX.Element {
  const { open, onClose, onConfirm, defaultValue = '', placeholder = '', validation = {}, title } = props
  const { control, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      value: defaultValue
    }
  })
  const { errors, isValid, isDirty } = formState

  const resetForm = useCallback(() => {
    reset({})
  }, [reset])

  useEffect(() => {
    resetForm()
  }, [resetForm, open])

  const onSubmit: SubmitHandler<{ value: string }> = (data) => {
    onConfirm?.(data as unknown as string)
  }

  const inputRef = useRef<HTMLInputElement>(null)

  const onAnimationEnd = (): void => {
    open && inputRef.current?.focus()
  }

  return (
    <BaseDialog open={open} onClose={onClose} actionRender={null} title={title} onAnimationEnd={onAnimationEnd}>
      <form 
            onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ paddingTop: 0.5, minWidth: '300px' }}>
          <FormControl error={Boolean(errors.value)} variant="standard" fullWidth>
            <Controller
              name="value"
              control={control}
              rules={{
                required: validation.required || 'Field is required'
              }}
              render={({ field }): JSX.Element => {
                return (
                  <TextField
                    autoFocus
                    {...field}
                    inputRef={inputRef}
                    variant="outlined"
                    placeholder={placeholder}
                    error={Boolean(errors.value)}
                    autoComplete="off"
                  />
                )
              }}
              defaultValue={defaultValue || ''}
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
