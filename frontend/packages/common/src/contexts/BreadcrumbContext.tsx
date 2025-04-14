import { createContext, useContext, useState } from 'react'
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb'

interface BreadcrumbContextType {
  breadcrumb: BreadcrumbItemType[]
  setBreadcrumb: (newItems: BreadcrumbItemType[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext)
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  return context
}
export const BreadcrumbProvider = ({ children }: unknown) => {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItemType[]>([])

  return (
    <BreadcrumbContext.Provider
      value={{
        setBreadcrumb: (newItems) => {
          newItems.slice(0, newItems.length - 1).forEach((item) => {
            item.title = <span className="cursor-pointer hover:text-[#2196f3]">{item.title}</span>
          })
          setBreadcrumb(newItems)
        },
        breadcrumb
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  )
}
