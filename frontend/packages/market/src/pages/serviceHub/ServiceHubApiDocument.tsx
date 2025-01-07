import ApiDocument from '@common/components/aoplatform/ApiDocument.tsx'
import { RouterParams } from '@core/components/aoplatform/RenderRoutes.tsx'
import { Empty } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ServiceDetailType } from '../../const/serviceHub/type.ts'

const ServiceHubApiDocument = ({ service }: { service: ServiceDetailType }) => {
  const { serviceId } = useParams<RouterParams>()
  const [, setServiceName] = useState<string>()
  const [apiDocument, setApiDocument] = useState<string>()

  useEffect(() => {
    if (!service) return
    setServiceName(service?.name)
    setApiDocument(service?.apiDoc)
  }, [service])

  useEffect(() => {
    if (!serviceId) {
      console.warn('缺少serviceId')
      return
    }
  }, [serviceId])

  return (
    <>
      <div className="flex flex-col p-btnbase pt-[4px] h-full flex-1 overflow-auto" id="layout-ref">
        <div className="bg-[#fff] rounded p-btnbase  pt-0 pl-0  flex justify-between ">
          {apiDocument ? <ApiDocument spec={apiDocument} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        </div>
      </div>
    </>
  )
}

export default ServiceHubApiDocument
