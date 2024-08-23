
import { Tabs, TabsProps } from "antd";
import DashboardTotal from "./DashboardTotal";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes";
import { useEffect, useState } from "react";
import { $t } from "@common/locales";

const APP_MODE = import.meta.env.VITE_APP_MODE;

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
            label:$t('应用调用统计'),
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
        {APP_MODE === 'pro' ? <Tabs activeKey={activeKey} onChange={(val)=>{
            setActiveKey(val);
            navigateTo(`/dashboard/${val === 'total' ? val :`${val}/list`}`)
            }} 
            items={monitorTabItems}  className="h-auto mt-[6px]" size="small"  tabBarStyle={{paddingLeft:'10px',marginTop:'0px',marginBottom:'0px'}} />
   :  <Outlet />} </>)
}