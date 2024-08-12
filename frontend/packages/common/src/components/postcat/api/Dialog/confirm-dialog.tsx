import { DialogContent } from '@mui/material'
import type { ReactNode } from 'react'
import { Icon } from '../Icon'
import type { BaseDialogProps } from './base-dialog'
import { BaseDialog, DialogActions } from './base-dialog'

export interface ConfirmDialogProps extends BaseDialogProps {
  title?: string
  context: ReactNode | string
  icon?: boolean
  iconColor?: string
}

export function ConfirmDialog(props: ConfirmDialogProps): JSX.Element {
  const { open, onClose, icon = true, context, title, iconColor } = props

  return (
    <BaseDialog open={open} onClose={onClose} actionRender={null} title={title}>
      <DialogContent sx={{ paddingTop: 0.5, minWidth: '300px' }}>
        {icon ? (
          <Icon
            size="24"
            mx={0}
            px={0}
            mr={0.5}
            color={iconColor}
            name="attention"
            sx={{ display: 'inline-block', verticalAlign: 'middle' }}
          />
        ) : null}
        <span>{context}</span>
      </DialogContent>
      <DialogActions {...props} />
    </BaseDialog>
  )
}
