import type { SxProps, Theme } from '@mui/material'
import { Box } from '@mui/material'

export interface IndicatorProps {
  color?: string
  sx?: SxProps<Theme>
}

export function Indicator({ color = 'pink', sx }: IndicatorProps): JSX.Element {
  const size = '6px'
  return <Box height={size} width={size} bgcolor={color} position="relative" sx={sx} borderRadius="50%" />
}
