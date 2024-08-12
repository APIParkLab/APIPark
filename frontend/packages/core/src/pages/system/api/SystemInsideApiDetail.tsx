
import  {useEffect, useRef, useState} from "react";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import {App, Button, Spin} from "antd";
import ApiBasicInfoDisplay from "@common/components/postcat/api/ApiPreview/components/ApiBasicInfoDisplay";
import ApiPreview from "@common/components/postcat/ApiPreview.tsx";
import ApiMatch from "@common/components/postcat/api/ApiPreview/components/ApiMatch";
import {v4 as uuidv4} from 'uuid'
import ApiProxy from "@common/components/postcat/api/ApiPreview/components/ApiProxy";
import { ProxyHeaderItem, SystemApiDetail, SystemInsideApiDetailProps, SystemInsideApiDocumentHandle } from "../../../const/system/type.ts";
import { MatchItem } from "@common/const/type.ts";
import { DrawerWithFooter } from "@common/components/aoplatform/DrawerWithFooter.tsx";
import SystemInsideApiDocument from "./SystemInsideApiDocument.tsx";
import ScrollableSection from "@common/components/aoplatform/ScrollableSection.tsx";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { LoadingOutlined } from "@ant-design/icons";

const SystemInsideApiDetail = (props:SystemInsideApiDetailProps)=>{
    const { message } = App.useApp()
    const {serviceId, teamId, apiId} = props
    const {fetchData} = useFetch()
    const [apiDetail, setApiDetail] = useState<SystemApiDetail>()
    const [open, setOpen] = useState(false);
    const drawerFormRef = useRef<SystemInsideApiDocumentHandle>(null)
    const [loading, setLoading] = useState<boolean>(false)
    
    const getApiDetail = ()=>{
        setLoading(true)
        fetchData<BasicResponse<{api:SystemApiDetail}>>('service/api/detail',{method:'GET',eoParams:{service:serviceId,team:teamId, api:apiId},eoTransformKeys:['create_time','update_time','match_type','upstream_id','opt_type']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                const newApiDetail = {
                    ...data.api,
                    match:data.api.match?.map((x:MatchItem)=>{x.id = x.id ?? uuidv4();return x}) || [],
                    ...data.api.proxy && {proxy:{...data.api.proxy, 
                        headers:data.api.proxy?.headers?.map((x:ProxyHeaderItem)=>{x.id = x.id?? uuidv4();return x || []
                    })}
                    }
                }
                setApiDetail(newApiDetail)
            }else{
                message.error(msg || '操作失败')
            }
        }).finally(()=>{setLoading(false)})
    }
    
    const onClose = ()=>{
        setOpen(false)
    }

    useEffect(() => {
        getApiDetail()
    }, []);

    return (
    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading} className="h-full 1" rootClassName="h-full 2" wrapperClassName="h-full 3" >
        <div className="pb-btnbase h-full overflow-hidden box-border">
        <ScrollableSection>
            <div className="content-before pb-[8px] mb-[4px]">
                {
                    apiDetail !== undefined && <>
                    <div className="flex justify-between">
                    <ApiBasicInfoDisplay apiName={apiDetail?.name} protocol={apiDetail?.protocol || 'HTTP'} method={apiDetail?.method} uri={apiDetail?.path} />
                    <WithPermission access="team.service.api.edit"><Button type="primary" onClick={()=>setOpen(true)}>编辑文档</Button></WithPermission>
                        </div>
                    <p className="text-[14px] leading-[22px] text-[#999999]">
                        <span className="mr-[20px]">创建者:{apiDetail?.creator.name || '-'}</span>
                        <span className="mr-[20px]">最后编辑人:{apiDetail?.updater.name || '-'}</span><span>更新时间:{apiDetail?.updateTime || '-'}</span></p></>
                }
            </div>
            <div className="scroll-area h-[calc(100%-84px)] overflow-auto">
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
        </ScrollableSection>
        <DrawerWithFooter 
            title="编辑 API" 
            open={open} 
            onClose={onClose} 
            onSubmit={()=>drawerFormRef.current?.save()?.then((res)=>{res&& getApiDetail();return res})} 
            showLastStep={true}
            >
                <SystemInsideApiDocument ref={drawerFormRef} serviceId={serviceId} teamId={teamId} apiId={apiId}/>
            </DrawerWithFooter>
        </div>
        </Spin>)
}
export default SystemInsideApiDetail