import { styled } from '@mui/material'
import type { ReactNode } from 'react'

export interface RotatingWrapperProps {
  rotation?: number
  duration?: number
  iterationCount?: string
  children?: ReactNode
}

const RotatingComponent = styled('div', {
  shouldForwardProp: (prop) => prop !== 'rotation' && prop !== 'duration'
})<RotatingWrapperProps>(({ rotation = 0, duration = 0 }) => {
  const isStop = rotation === 0 || duration === 0
  return {
    display: 'inline-block',
    animation: isStop ? 'none' : `rotate ${duration}s linear infinite`,
    '@keyframes rotate': {
      '0%': {
        transform: 'rotate(0deg)'
      },
      '100%': {
        transform: `rotate(${rotation}deg)`
      }
    }
  }
})

export function RotatingWrapper({
  children,
  rotation = 360,
  duration = 1,
  iterationCount = 'infinite'
}: RotatingWrapperProps): JSX.Element {
  return (
    <RotatingComponent rotation={rotation} duration={duration} style={{ animationIterationCount: iterationCount }}>
      {children}
    </RotatingComponent>
  )
}

export default RotatingWrapper
