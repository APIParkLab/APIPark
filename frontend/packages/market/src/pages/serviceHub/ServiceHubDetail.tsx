import {Link, useNavigate, useParams} from "react-router-dom";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import { App, Avatar, Button, Descriptions, Divider, Tabs} from "antd";
import  { useEffect, useRef, useState} from "react";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import {DefaultOptionType} from "antd/es/cascader";
import { ApplyServiceHandle, ServiceBasicInfoType, ServiceDetailType } from "../../const/serviceHub/type.ts";
import { EntityItem } from "@common/const/type.ts";
import { ApplyServiceModal } from "./ApplyServiceModal.tsx";
import ServiceHubApiDocument from "./ServiceHubApiDocument.tsx";
import { ApiFilled, ArrowLeftOutlined, LeftOutlined } from "@ant-design/icons";
import { SimpleSystemItem } from "@core/const/system/type.ts";
import { Icon } from "@iconify/react/dist/iconify.js";
import DOMPurify from 'dompurify';


const ServiceHubDetail = ()=>{
    const {serviceId} = useParams<RouterParams>();
    const {setBreadcrumb} = useBreadcrumb()
    const [serviceBasicInfo, setServiceBasicInfo] = useState<ServiceBasicInfoType>()
    const [serviceName, setServiceName] = useState<string>()
    const [serviceDesc, setServiceDesc] = useState<string>()
    const [serviceDoc, setServiceDoc] = useState<string>()
    const {fetchData} = useFetch()
    const applyRef = useRef<ApplyServiceHandle>(null)
    const { modal,message } = App.useApp()
    const [mySystemOptionList, setMySystemOptionList] = useState<DefaultOptionType[]>()
    const [applied,setApplied] = useState<boolean>(false)
    const [activeKey, setActiveKey] = useState<string[]>([])
    const [service, setService] = useState<ServiceDetailType>()
    const navigate = useNavigate();

    const getServiceBasicInfo = ()=>{
        fetchData<BasicResponse<{service:ServiceDetailType}>>('catalogue/service',{method:'GET',eoParams:{service:serviceId}, eoTransformKeys:['app_num','api_num','update_time']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setService(data.service)
                setServiceBasicInfo(data.service.basic)
                setServiceName(data.service.name)
                setServiceDesc(data.service.description)
                setApplied(data.service.applied)
                setServiceDoc(DOMPurify.sanitize(data.service.document))
                setActiveKey(data.service.apis.map((x)=>x.id))
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    useEffect(() => {
        if(!serviceId){
            console.warn('缺少serviceId')
            return
        }
        serviceId && getServiceBasicInfo()
    }, [serviceId]);

    useEffect(() => {
        getMySelectList()
        setBreadcrumb(
            [
                {title:<Link to={`/serviceHub/list`}>服务市场</Link>},
                {title:'服务详情'}
            ]
        )

    }, []);


    const getMySelectList = ()=>{
        setMySystemOptionList([])
        fetchData<BasicResponse<{ apps: SimpleSystemItem[] }>>('simple/apps/mine',{method:'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setMySystemOptionList(data.apps?.map((x:SimpleSystemItem)=>{return {
                    label:x.name, value:x.id
                }}))
            }else{
                message.error(msg || '操作失败')
            }
        })
    }


    const openModal = (type:'apply')=>{
        modal.confirm({
            title:'申请服务',
            content:<ApplyServiceModal ref={applyRef} entity={{...serviceBasicInfo!, name:serviceName!, id:serviceId!}}  mySystemOptionList={mySystemOptionList!}/>,
            onOk:()=>{
                return applyRef.current?.apply().then((res)=>{
                    if(res === true) setApplied(true)
                })
            },
            okText:'确认',
            cancelText:'取消',
            closable:true,
            icon:<></>,
            width:600
        })
    }

    const items = [
        {
            key: 'introduction',
            label: '介绍',
            children: <><div className="p-btnbase preview-document" dangerouslySetInnerHTML={{__html: serviceDoc || ''}}></div></>,
            icon: <Icon icon="ic:baseline-space-dashboard" width="14" height="14"/>,
        },
        {
            key: 'api-document',
            label: 'API 文档',
            children: <div className="p-btnbase"><ServiceHubApiDocument service={service!} /></div>,
            icon: <ApiFilled />
        }
    ]

    return (
        <section className=" grid grid-cols-5 h-full mr-PAGE_INSIDE_X">
            <section className="col-span-4 border-0 border-r-[1px] border-solid border-BORDER flex flex-col overflow-hidden">
                <section className="flex flex-col gap-btnbase p-btnbase ">
                    
                    <div className="text-[18px] leading-[25px] pb-[12px]">
                        <Button type="text" onClick={()=>navigate(`/serviceHub/list`)}><ArrowLeftOutlined className="max-h-[14px]" />返回</Button>
                    </div>
                    <div className="flex">
                        {/* <Avatar shape="square" size={50} className=" bg-[linear-gradient(135deg,white,#f0f0f0)] text-[#333] rounded-[12px]" > {service?.name?.substring(0,1)}</Avatar> */}
                        <Avatar shape="square" size={50} 
                            className={ `rounded-[12px] border-none rounded-[12px] ${ serviceBasicInfo?.logo ? 'bg-[linear-gradient(135deg,white,#f0f0f0)]' : 'bg-theme'}`} 
                            src={ serviceBasicInfo?.logo ?  <img src={serviceBasicInfo?.logo} alt="Logo" style={{  maxWidth: '200px', width:'45px',height:'45px',objectFit:'unset'}} 
                            /> : undefined}
                            icon={serviceBasicInfo?.logo ? '' :<iconpark-icon   name="auto-generate-api"></iconpark-icon>}> </Avatar>

                        <div className="pl-[20px] w-[calc(100%-50px)]">
                            <p className="text-[14px] h-[20px] leading-[20px] truncate font-bold">{serviceName}</p>
                            <div className="mt-[10px] flex flex-col gap-btnrbase font-normal">
                                {serviceDesc || '-'}
                                <div>
                                    <Button type="primary" onClick={()=>openModal('apply')}>申请</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Tabs
                    className="p-btnbase pr-0 overflow-hidden [&>.ant-tabs-content-holder]:overflow-auto"
                    items={items}
                    
                />
                
            </section>
            <section className="col-span-1 p-btnbase px-btnrbase">
                    <Descriptions title="服务信息" column={1} size={'small'}>
                        <Descriptions.Item label="接入应用">{serviceBasicInfo?.appNum ?? '-'}</Descriptions.Item>
                        <Descriptions.Item label="供应方">{serviceBasicInfo?.team?.name || '-'}</Descriptions.Item>
                        <Descriptions.Item label="分类">{serviceBasicInfo?.catalogue?.name || '-'}</Descriptions.Item>
                        <Descriptions.Item label="标签">{serviceBasicInfo?.tags?.map(x=>x.name)?.join(',') || '-'}</Descriptions.Item>
                    </Descriptions>
                    <Divider />
                    <Descriptions  column={1} >
                        <Descriptions.Item label="版本">{ serviceBasicInfo?.version || '-'}</Descriptions.Item>
                        <Descriptions.Item label="更新时间"><span className="truncate" title={serviceBasicInfo?.updateTime}>{serviceBasicInfo?.updateTime || '-'}</span></Descriptions.Item>
                    </Descriptions>
            </section>
        </section>
    )
}

export default ServiceHubDetail