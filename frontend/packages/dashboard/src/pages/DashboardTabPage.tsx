
import { Tabs, TabsProps } from "antd";
import DashboardTotal from "./DashboardTotal";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { $t } from "@common/locales";
import { RouterParams } from "@common/const/type";


export default function DashboardTabPage(){
    const { dashboardType} = useParams<RouterParams>()
    const [activeKey, setActiveKey] = useState<string>('total')
    const navigateTo = useNavigate()

    useEffect(()=>{
        setActiveKey(dashboardType || 'total')
    },[dashboardType])

    const monitorTabItems:TabsProps['items'] = [
        {
            label:$t('监控总览'),
            key:'total',
            children:<DashboardTotal />
        },
        {
            label:$t('服务被调用统计'),
            key:'subscriber',
            children:<Outlet />
        },
        {
            label:$t('消费者调用统计'),
            key:'provider',
            children:<Outlet />
        },
        {
            label:$t('API 调用统计'),
            key:'api',
            children:<Outlet />
        }
    ]
    
    return (<>
       <Tabs activeKey={activeKey} onChange={(val)=>{
            setActiveKey(val);
            navigateTo(`/analytics/${val === 'total' ? val :`${val}/list`}`)
            }} 
            items={monitorTabItems}  className="h-full overflow-hidden mt-[6px] [&>.ant-tabs-content-holder]:overflow-auto  [&>.ant-tabs-content-holder]:pr-PAGE_INSIDE_X  [&>.ant-tabs-content-holder>.ant-tabs-content]:h-full [&>.ant-tabs-content-holder>.ant-tabs-content>.ant-tabs-tabpane]:h-full" size="small" tabBarStyle={{paddingLeft:'10px',marginTop:'0px',marginBottom:'0px'}} />
   </>)
}