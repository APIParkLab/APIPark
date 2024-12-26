import { useState, useCallback } from 'react'

type WebSocketHookProps = {
  onOpen: () => void
  onClose: () => void
  onMessage: (event: unknown) => void
  onError: (event: unknown) => void
}
const useWebSocket = () => {
  const [ws, setWs] = useState<WebSocket | null>()

  // 创建WebSocket连接的方法
  const createWs = (url: string, { onOpen, onClose, onMessage, onError }: WebSocketHookProps) => {
    if (ws) {
      ws.close()
    }

    const socket = new WebSocket(url)
    setWs(socket)

    socket.onopen = () => onOpen && onOpen()
    socket.onclose = () => onClose && onClose()
    socket.onmessage = (event) => onMessage && onMessage(event)
    socket.onerror = (error) => onError && onError(error)

    return socket
  }

  // 提供发送消息的方法
  const sendMessage = useCallback(
    (message: string) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    },
    [ws]
  )

  // 断开连接的方法
  const disconnectWs = useCallback(() => {
    if (ws) {
      ws.close()
      setWs(null)
    }
  }, [ws])

  return { createWs, sendMessage, disconnectWs }
}

export default useWebSocket
