
import { useEffect, useState } from "react";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext";
import DashboardPage from "./DashboardTabPage";
import { $t } from "@common/locales";
import { useFetch } from "@common/hooks/http";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { App, Spin } from "antd";
import { reject } from "lodash-es";
import { EntityItem } from "@common/const/type";
import { LoadingOutlined } from "@ant-design/icons";
import DashboardInstruction from "./DashboardInstruction";

export default function Dashboard(){
    const { setBreadcrumb } = useBreadcrumb()
    const {fetchData } = useFetch()
    const { message } = App.useApp()
    const [clusters, setClusters] = useState<Array<{id:string, name:string, enable:boolean}>>([])
    const [enabledClusters, setEnabledClusters] = useState<Array<EntityItem>>([])
    const [loading, setLoading] = useState(false)
    const  getClusters = ()=>{
        setLoading(true)
        fetchData<BasicResponse<{clusters:Array<{id:string, name:string, enable:boolean}>}>>('simple/monitor/clusters',{
            method: 'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                const filteredCluster = data?.clusters?.filter(x=>x.enable)
                setClusters(data.cluster || [])
                setEnabledClusters(filteredCluster)
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
    }).catch((errorInfo)=> reject(errorInfo)).finally(()=>setLoading(false))
    }

    useEffect(() => {
        getClusters()
        setBreadcrumb([
            {
                title:$t('运行视图')
            },
        ])


    }, []);

    return (
        <>
            <Spin wrapperClassName="h-full w-full pb-PAGE_INSIDE_B " indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>} spinning={loading}>
            {
                !loading && <>
                    {
                        enabledClusters.length > 0 ? 
                        <DashboardPage /> : <DashboardInstruction showClusterIns={clusters.length === 0} showMonitorIns={enabledClusters.length === 0}/>
                    }
                </>
            }
            </Spin>
        </>
    )
}