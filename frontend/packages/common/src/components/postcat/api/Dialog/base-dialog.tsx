
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import type { ButtonProps } from '@mui/material'
import { Button, DialogActions as MuiDialogActions, DialogContent } from '@mui/material'
import { type ReactNode } from 'react'
import type { LoadingButtonProps } from '@mui/lab'
import { LoadingButton } from '@mui/lab'
import {renderComponent} from "@common/utils/postcat.tsx";

export interface BaseDialogProps extends DialogActionProps {
  open: boolean
  title?: string | ReactNode
  children?: ReactNode
  actionRender?: ReactNode | string | null
  contentRender?: ReactNode | string | null
  onAnimationEnd?: () => void
}

export function BaseDialog(props: BaseDialogProps): JSX.Element {
  const { open, title, children, onClose, actionRender, contentRender, onAnimationEnd } = props

  return (
    <Dialog open={open} onClose={onClose} onAnimationEnd={onAnimationEnd} maxWidth={false}>
      {title ? <DialogTitle fontSize="medium" sx={{fontWeight:'bold',color:'#333'}}>{title}</DialogTitle> : null}
      {children ? (
        children
      ) : (
        <DialogContent
          sx={{
            minWidth: 400
          }}
        >
          {contentRender}
        </DialogContent>
      )}
      {renderComponent(actionRender, <DialogActions {...props} />)}
    </Dialog>
  )
}

interface DialogActionProps {
  onClose?: () => void
  confirmBtn?: ReactNode | string | null
  confirmText?: string
  confirmDisabled?: boolean
  cancelBtn?: ReactNode | string | null
  cancelText?: string
  loading?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-unknown
  onConfirm?: (data: unknown) => void
  onCancel?: () => void
  cancelProps?: ButtonProps
  confirmProps?: LoadingButtonProps
}

export function DialogActions(props: DialogActionProps): JSX.Element {

  const CancelText = '取消'
  const ConfirmText = '确定'

  const {
    onClose,
    confirmBtn,
    confirmText,
    confirmDisabled,
    cancelBtn,
    cancelText,
    loading,
    onConfirm,
    onCancel,
    cancelProps,
    confirmProps
  } = props
  const handleClose = (): void => {
    onClose?.()
  }
  return (
    <MuiDialogActions sx={{ padding: 2, paddingTop: 0 }}>
      {cancelBtn ?? (
        <Button onClick={onCancel ?? handleClose} disabled={loading} {...cancelProps}>
          {cancelText ?? CancelText}
        </Button>
      )}
      {confirmBtn ?? (
        <LoadingButton
          type="submit"
          variant="contained"
          disabled={confirmDisabled}
          loading={loading}
          onClick={onConfirm}
          autoFocus
          {...confirmProps}
        >
          {confirmText ?? ConfirmText}
        </LoadingButton>
      )}
    </MuiDialogActions>
  )
}
