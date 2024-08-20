
import { App, Table } from "antd";
import { SYSTEM_PUBLISH_ONLINE_COLUMNS } from "../../../const/system/const";
import { useEffect, useState } from "react";
import { useFetch } from "@common/hooks/http";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { EntityItem } from "@common/const/type";

type SystemInsidePublishOnlineProps = {
    serviceId:string
    teamId:string
    id:string
}

export type SystemInsidePublishOnlineItems = {
    cluster:EntityItem
    status:'done' | 'error' | 'publishing'
    error:string
}
export default function SystemInsidePublishOnline(props:SystemInsidePublishOnlineProps ){
    const {serviceId, teamId, id} = props
    const {message} = App.useApp()
    const [dataSource, setDataSource] = useState<[]>()
    const {fetchData} = useFetch()
    const [isStopped, setIsStopped] = useState(false);

    const getOnlineStatus = ()=>{
        fetchData<BasicResponse<{publishStatusList:SystemInsidePublishOnlineItems[]}>>('service/publish/status',{method:'GET',eoParams:{service:serviceId,team:teamId, id}, eoTransformKeys:['publish_status_list']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setDataSource(data.publishStatusList)
                if(data.publishStatusList.filter((x:SystemInsidePublishOnlineItems)=>x.status === 'publishing').length === 0){
                    setIsStopped(true)
                }
            }else{
                message.error(msg || RESPONSE_TIPS.error)
            }
        }).catch((errorInfo)=> message.error(errorInfo))
    }

    useEffect(()=>{
        getOnlineStatus();
    },[])

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (!isStopped) {
            intervalId = setInterval(() => {
                !isStopped && getOnlineStatus();
            }, 5000);
        }

        return () => {
            clearInterval(intervalId);
        };
    }, [isStopped]);
    
    return (
        <Table
            className="min-h-[100px] h-full"
            bordered={true}
            columns={[...SYSTEM_PUBLISH_ONLINE_COLUMNS]}
            size="small"
            rowKey="id"
            dataSource={dataSource}
            pagination={false}
        />
    )
}