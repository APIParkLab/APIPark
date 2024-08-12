import type { ButtonProps } from '@mui/material'
import { Box, IconButton as MuiIconButton, Tooltip } from '@mui/material'
import type { ReactNode } from 'react'
import { LoadingButton } from '@mui/lab'
import { Icon, IconParkIconElement } from '../Icon'
import { RotatingWrapper } from '../RotatingWrapper'
import {useEffect} from "react";

interface IconButtonProps extends ButtonProps {
  /** tooltip title */
  title: string
  iconColor: IconParkIconElement['color']
  iconSize: IconParkIconElement['size']
  fill: IconParkIconElement['fill']
  name: IconParkIconElement['name']
  icon: boolean
  loading?: boolean
  children: ReactNode
}

export function IconButton(props: Partial<IconButtonProps>): JSX.Element {
  const {
    name,
    title,
    size,
    fill,
    color,
    children,
    disabled,
    iconColor,
    iconSize,
    variant,
    icon = false,
    loading = false,
    ...otherProps
  } = props
  const isIcon = children || icon
  const padding = isIcon ? '6px 8px' : null

  return (
    <Tooltip title={title}>
      {isIcon ? (
        <LoadingButton
          color={color}
          disabled={disabled}
          size={size}
          sx={{ minWidth: '30px', padding }}
          variant={variant}
          loading={loading}
          {...otherProps}
        >
          <Icon color={iconColor} fill={fill} mx={0} mr={!icon ? 1 : 0} name={name} px={0} size={iconSize ?? '16'} />
          {children}
        </LoadingButton>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center">
          <MuiIconButton disabled={disabled} size="small" {...otherProps}>
            <RotatingWrapper duration={loading ? 1 : 0}>
              <Icon name={loading ? 'refresh' : name} size={iconSize ?? '16'} mx={0} px={0} />
            </RotatingWrapper>
          </MuiIconButton>
        </Box>
      )}
    </Tooltip>
  )
}
