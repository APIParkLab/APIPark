
import  {forwardRef, useEffect, useState} from "react";
import {  Empty, Spin, message} from "antd";
import {BasicResponse, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { LoadingOutlined } from "@ant-design/icons";
import EmptySVG from '@common/assets/empty.svg'
import { $t } from "@common/locales/index.ts";
import ApiDocument from '@common/components/aoplatform/ApiDocument.tsx'
import { useParams } from "react-router-dom";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes.tsx";
import { AiServiceInsideApiDocumentHandle, AiServiceInsideApiDocumentProps, AiServiceApiDetail } from "@core/const/ai-service/type.ts";

const AiServiceInsideApiDocument = forwardRef<AiServiceInsideApiDocumentHandle,AiServiceInsideApiDocumentProps>(() => {
    const {serviceId, teamId} = useParams<RouterParams>()
    const {fetchData} = useFetch()
    const [apiDetail, setApiDetail] = useState<AiServiceApiDetail>()
    const [loading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        getApiDetail()
    }, []);

    const getApiDetail = ()=>{
        setLoading(true)
        fetchData<BasicResponse<{doc:AiServiceApiDetail}>>('service/api_doc',{method:'GET',eoParams:{service:serviceId,team:teamId },eoTransformKeys:['update_time']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setApiDetail(data.doc?.content)
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        }).finally(()=>{setLoading(false)})
    }


    const ApiPreview = ({spec}:{spec?:string | object})=>{
        return (
        <div className="h-full overflow-hidden">
            <div className="flex-1 overflow-auto pr-PAGE_INSIDE_X">
            <ApiDocument spec={spec}/>
            </div>
        </div>
        )
    }


    return (<>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading} wrapperClassName=' h-full overflow-hidden '>
            <div className=" h-full">
              { apiDetail ? <ApiPreview  spec={apiDetail} />
                : <Empty image={EmptySVG} >
                </Empty>}
            </div>
        </Spin>
    </>)
})

export default AiServiceInsideApiDocument