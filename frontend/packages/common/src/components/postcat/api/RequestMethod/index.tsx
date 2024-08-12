
import { Chip, Skeleton } from '@mui/material'
import { useEffect, useState } from 'react'

export enum Protocol {
  HTTP,
  HTTPS,
  WS,
  WSS,
  TCP,
  UDP,
  SOCKET,
  WEBSOCKET,
  SOAP,
  HSF,
  DUBBO,
  GRPC
}

export enum HTTPMethod {
  POST,
  GET,
  PUT,
  DELETE,
  HEAD,
  OPTIONS,
  PATCH
}

interface MethodColor {
  color: string
  bgColor: string
}

const methodColorMapping: { [key in HTTPMethod]: MethodColor } = {
  [HTTPMethod.GET]: {
    color: 'rgba(6, 125, 219, 1)',
    bgColor: 'rgba(6, 125, 219, .15)'
  },
  [HTTPMethod.POST]: {
    color: 'rgba(16, 165, 75, 1)',
    bgColor: 'rgba(16, 165, 75, .15)'
  },
  [HTTPMethod.PUT]: {
    color: 'rgba(216, 131, 12, 1)',
    bgColor: 'rgba(216, 131, 12, .15)'
  },
  [HTTPMethod.DELETE]: {
    color: 'rgba(194, 22, 27, 1)',
    bgColor: 'rgba(194, 22, 27, .15)'
  },
  [HTTPMethod.HEAD]: {
    color: 'rgba(238, 196, 12, 1)',
    bgColor: 'rgba(238, 196, 12, 0.15)'
  },
  [HTTPMethod.OPTIONS]: {
    color: 'rgba(14, 90, 179, 1)',
    bgColor: 'rgba(14, 90, 179, 0.15)'
  },
  [HTTPMethod.PATCH]: {
    color: 'rgba(119, 40, 245, 1)',
    bgColor: 'rgba(119, 40, 245, 0.15)'
  }
}

export interface RequestMethodProps {
  protocol: Protocol
  method: string
  variant?: 'default' | 'filled'
  displayFormat?: 'abbreviation' | 'full'
  loading?: boolean
}

export function RequestMethod({
  method,
  // protocol,
  variant = 'default',
  displayFormat = 'abbreviation',
  loading = false
}: RequestMethodProps): JSX.Element {
  const [label, setLabel] = useState<string>('Unknown')

  useEffect(() => {
    const methodName = method
    const isOverLong = methodName?.length > 5
    const displayLabel = displayFormat === 'abbreviation' && isOverLong ? methodName.slice(0, 3) : methodName
    setLabel(displayLabel)
  }, [displayFormat, method])

  const transparent = 'transparent'

  const chipStyle = {
    height:'22px',
    borderRadius: '4px',
    color: methodColorMapping[method]?.color || '#333',
    backgroundColor: variant === 'default' ? transparent : methodColorMapping[method]?.bgColor
  }

  return !loading ? <Chip label={label} style={chipStyle} /> : <Skeleton width={60} height={32} />
}
