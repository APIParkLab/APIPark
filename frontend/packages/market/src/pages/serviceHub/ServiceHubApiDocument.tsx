import { useParams} from "react-router-dom";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import { Button, Drawer, Empty} from "antd";
import  { useEffect, useState} from "react";
import ApiTestGroup from "./ApiTestGroup.tsx";
import {ServiceDetailType } from "../../const/serviceHub/type.ts";
import { $t } from "@common/locales/index.ts";
import ApiDocument from "@common/components/aoplatform/ApiDocument.tsx";

const ServiceHubApiDocument = ({service}:{service:ServiceDetailType})=>{
    const {serviceId} = useParams<RouterParams>();
    const [apiTestDrawOpen, setApiTestDrawOpen] = useState(false);
    const [serviceName, setServiceName] = useState<string>()
    const [selectedTestApi,setSelectedTestApi] = useState<string>()
    const [apiDocument, setApiDocument] = useState<string>()

    useEffect(()=>{
        if(!service) return
        setServiceName(service?.name)
        setApiDocument(service?.apiDoc)
    },[service])

    useEffect(() => {
        if(!serviceId){
            console.warn('缺少serviceId')
            return
        }
    }, [serviceId]);

    const onClose = () => {
        setApiTestDrawOpen(false);
    };


    return (
        <>
                <div className="flex flex-col p-btnbase pt-[4px] h-full flex-1 overflow-auto" id='layout-ref'>
                    <div  className='bg-[#fff] rounded p-btnbase  pt-0 pl-0  flex justify-between '>
                        {apiDocument ? <ApiDocument spec={apiDocument } /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
}
                        </div>
                    </div>

            {/* <Drawer 
            title={serviceName} 
              maskClosable={false}
              width="100%" placement="right" onClose={onClose} open={apiTestDrawOpen}
                    extra={
                            <Button onClick={onClose}>{$t('退出测试')}</Button>
                    }
                    closeIcon={false}
            >
                <ApiTestGroup apiInfoList={apiDocs} selectedApiId={selectedTestApi}/>
            </Drawer> */}
        </>
    )
}

export default ServiceHubApiDocument