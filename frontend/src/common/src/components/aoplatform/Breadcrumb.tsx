import { Breadcrumb } from 'antd'
import { useBreadcrumb } from '@common/contexts/BreadcrumbContext.tsx'
import { FC, useEffect } from 'react'
import { LeftOutlined } from '@ant-design/icons'

const TopBreadcrumb: FC<{ handleBackCallback?: () => void }> = ({ handleBackCallback }) => {
  const { breadcrumb } = useBreadcrumb()
  useEffect(() => {}, [breadcrumb])
  const handleBack = () => {
    handleBackCallback?.()
  }
  return (
    <div className="flex text-[18px] leading-[25px] pb-[12px]">
      <div
        onClick={handleBack}
        className="hover:bg-gray-100 items-center mt-[1px] mr-[12px] flex justify-center rounded-lg border cursor-pointer border-gray-300 w-[30px] h-[30px] border border-solid "
      >
        <LeftOutlined className="text-xs" />
      </div>
      <Breadcrumb items={breadcrumb} className="flex-1" />
    </div>
  )
}

export default TopBreadcrumb
