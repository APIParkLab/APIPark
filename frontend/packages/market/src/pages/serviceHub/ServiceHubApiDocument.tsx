import { useParams} from "react-router-dom";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import {Anchor, Button, Collapse, Drawer, FloatButton, Input, Space} from "antd";
import  { useEffect, useMemo, useState} from "react";
import ApiPreview from "@common/components/postcat/ApiPreview.tsx";
import ApiTestGroup from "./ApiTestGroup.tsx";
import {ApiDetail} from "@common/const/api-detail";
import {ServiceDetailType } from "../../const/serviceHub/type.ts";
import ApiMatch from "@common/components/postcat/api/ApiPreview/components/ApiMatch/index.tsx";
import ApiProxy from "@common/components/postcat/api/ApiPreview/components/ApiProxy/index.tsx";

const ServiceHubApiDocument = ({service}:{service:ServiceDetailType})=>{
    const {serviceId} = useParams<RouterParams>();
    const [apiTestDrawOpen, setApiTestDrawOpen] = useState(false);
    const [serviceName, setServiceName] = useState<string>()
    const [apiDocs,setApiDocs ] = useState<ApiDetail[]>()
    const [selectedTestApi,setSelectedTestApi] = useState<string>()
    const [activeKey, setActiveKey] = useState<string[]>([])

    useEffect(()=>{
        if(!service) return
        setServiceName(service?.name)
        setApiDocs(service?.apis)
        setActiveKey(service?.apis.map((x)=>x.id))
    },[service])

    const category = useMemo(() => [
        {
            key: 'apiDocument-list',
            href: '#apiDocument-list',
            title: 'API 列表',
            children:apiDocs?.map((x)=>({
                key:x.id,
                href:`#apiDocument-${x.id}`,
                title:x.name
            })) || []
        },
        // {
        //     key: 'apiDocument-statusCode',
        //     href: '#apiDocument-statusCode',
        //     title: '状态码',
        // },
    ], [apiDocs]);

    const floatButtonStyle = { top:'10px',position:'sticky', width:'180px',height:'200px'}

    useEffect(() => {
        if(!serviceId){
            console.warn('缺少serviceId')
            return
        }
    }, [serviceId]);

    const testClick = (id:string)=>{//console.log('test');
        setApiTestDrawOpen(true)
        setSelectedTestApi(id)}

    const onClose = () => {
        setApiTestDrawOpen(false);
    };


    return (
        <>
                <div className="flex flex-col p-btnbase pt-[4px] h-full flex-1 overflow-auto" id='layout-ref'>
                    {/* <div className="bg-[#fff] rounded p-btnbase pl-0   mb-[16px]">
                        <Descriptions className="bg-bar-theme p-[16px] rounded service-hub-description" title="" items={getBasicInfo} column={4} labelStyle={{width:'80px',justifyContent:'flex-end',fontWeight:'bold'}}  contentStyle={{color:'#333'}}/>
                    </div> */}
                    <div  className='bg-[#fff] rounded p-btnbase  pl-0  flex justify-between'>
                        <div className="w-[calc(100%-220px)]" >
                        <p className="font-bold text-[20px] leading-[32px] mb-[12px] h-[32px]" id="apiDocument-list">API 列表</p>
                            <div className="">
                                {apiDocs?.map((apiDetail)=>(
                                    <div  className="mb-btnbase "  key={apiDetail.id} id={`apiDocument-${apiDetail.id}`}>
                                    <Collapse key={`apiDocument-${apiDetail.id}`} 
                                        expandIcon={({isActive})=>(isActive?  <iconpark-icon name="shouqi-2"></iconpark-icon>:<iconpark-icon name="zhankai"></iconpark-icon> )}
                                        items={[{
                                            key: apiDetail.id,
                                            label: <span><span className="text-status_update font-bold mr-[8px]">{apiDetail.method}</span><span>{apiDetail.name}</span></span>,
                                            children:<div className="scroll-area h-[calc(100%-84px)] overflow-auto">
                                                    <Space direction="vertical" className="mb-btnybase w-full mt-btnybase">
                                                    <Input
                                                        readOnly
                                                        addonBefore={apiDetail?.method}
                                                        value={apiDetail?.path}
                                                        // enterButton={<SearchBtn  entity={apiDetail}/>}
                                                        // onSearch={handleTest}
                                                    />
                                                </Space>
                                            {
                                                apiDetail?.match && apiDetail.match?.length > 0 &&
                                                <ApiMatch title='高级匹配' rows={apiDetail?.match}  />
                                            }
                            
                                            {
                                                apiDetail?.proxy && Object.keys(apiDetail?.proxy).length > 0 &&
                                                <ApiProxy title='转发规则' proxyInfo={apiDetail?.proxy}  />
                                            }
                            
                                            {apiDetail && <ApiPreview entity={{...apiDetail.doc,name:apiDetail.name, method:apiDetail.method,uri:apiDetail.path, protocol:apiDetail.protocol||'HTTP'}}  />}
                                        </div>
                                            // <ApiPreview testClick={()=>testClick(apiDocs.id)} entity={doc}  /> 
                                        }]} 
                                        activeKey={activeKey}
                                        onChange={(val)=>{setActiveKey(val as string[])}}
                                            />
                                    </div>
                                ))}

                        </div>
                            {/* <div className="h-[16px] bg-[#f7f8fa] mx-[-16px]"></div>
                            <div className='bg-[#fff] rounded  pt-btnbase'>
                                <p className="font-bold text-[20px] leading-[32px] mb-[12px] h-[32px]" id="apiDocument-statusCode">状态码</p>
                                <CodePage />
                            </div> */}
                            </div>

                            <FloatButton.Group shape="circle" style={floatButtonStyle}>
                                <Anchor
                                    // className='absolute py-5 px-btnbase left-0 z-[13]'
                                    // affix={false}
                                    // showInkInFixed={true}
                                    targetOffset={60}
                                    getContainer = {()=> document.getElementById('layout-ref')!}
                                    items={category}
                                />
                            </FloatButton.Group>
                        </div>
                    </div>

            <Drawer 
            title={serviceName} 
              maskClosable={false}
              width="100%" placement="right" onClose={onClose} open={apiTestDrawOpen}
                    extra={
                            <Button onClick={onClose}>退出测试</Button>
                    }
                    closeIcon={false}
            >
                <ApiTestGroup apiInfoList={apiDocs} selectedApiId={selectedTestApi}/>
            </Drawer>
        </>
    )
}

export default ServiceHubApiDocument