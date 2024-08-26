
import  {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import ApiEdit, {ApiEditApi} from "@common/components/postcat/ApiEdit.tsx";
import { Spin, message} from "antd";
import {BasicResponse, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { SystemApiDetail, SystemInsideApiDocumentHandle, SystemInsideApiDocumentProps } from "../../../const/system/type.ts";
import { LoadingOutlined } from "@ant-design/icons";


const SystemInsideApiDocument = forwardRef<SystemInsideApiDocumentHandle,SystemInsideApiDocumentProps>((props, ref) => {
    const {serviceId, teamId, apiId} = props
    const {fetchData} = useFetch()
    const [apiDetail, setApiDetail] = useState<SystemApiDetail>()
    const apiEditRef = useRef<ApiEditApi>(null)
    const [loaded,setLoaded] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    useImperativeHandle(ref, ()=>({
        save
    })
)
    useEffect(() => {
        getApiDetail()
    }, []);

    const getApiDetail = ()=>{
        setLoading(true)
        fetchData<BasicResponse<{api:SystemApiDetail}>>('service/api/detail',{method:'GET',eoParams:{service:serviceId,team:teamId, api:apiId},eoTransformKeys:['create_time','update_time','match_type','upstream_id','opt_type']}).then(response=>{
            const {code,data,msg} = response
            //console.log(data,code, STATUS_CODE.SUCCESS,code === STATUS_CODE.SUCCESS)
            if(code === STATUS_CODE.SUCCESS){
                setApiDetail(data.api)
                setLoaded(true)
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        }).finally(()=>{setLoading(false)})
    }

    const save = ()=>{
        return apiEditRef.current?.getData()?.then((res)=>{
            return fetchData<BasicResponse<{id:string}>>('service/api',{method:'PUT',eoParams:{service:serviceId,team:teamId,api:apiId},eoBody:(res.apiInfo)}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    return Promise.resolve(true)
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    return Promise.reject(msg|| $t(RESPONSE_TIPS.error))
                }
            }).catch(errInfo => Promise.reject(errInfo))
        })

    }

    return (<>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading} className=' h-full overflow-auto '>
            <div className="pb-[20px]">
            <ApiEdit apiInfo={apiDetail} editorRef={apiEditRef} loaded={loaded} serviceId={serviceId} teamId={teamId}/>
            </div>
        </Spin>
    </>)
})

export default SystemInsideApiDocument