import React, { useEffect, useState } from 'react'
import { Result, Skeleton } from 'antd'

const NotFound: React.FC = () => {
  const [showPage, setShowPage] = useState<boolean>(false)

  useEffect(() => {
    setTimeout(() => setShowPage(true), 1000)
  }, [])

  return (
    <div className={`h-full w-full flex flex-1 align-middle ${showPage ? 'items-center' : ''}`}>
      {showPage ? (
        <Result className="w-full" status="404" title="404" subTitle="Sorry, the page you visited does not exist." />
      ) : (
        <Skeleton active />
      )}
    </div>
  )
}

export default NotFound
