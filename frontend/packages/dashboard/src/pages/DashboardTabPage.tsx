
import { Tabs, TabsProps } from "antd";
import DashboardTotal from "./DashboardTotal";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes";
import { useEffect, useState } from "react";

export default function DashboardTabPage(){
    const { dashboardType} = useParams<RouterParams>()
    const [activeKey, setActiveKey] = useState<string>('total')
    const navigateTo = useNavigate()

    useEffect(()=>{
        setActiveKey(dashboardType || 'total')
    },[dashboardType])

    const monitorTabItems:TabsProps['items'] = [
        {
            label:'监控总览',
            key:'total',
            children:<DashboardTotal />
        },
        {
            label:'服务被调用统计',
            key:'subscriber',
            children:<Outlet />
        },
        {
            label:'应用调用统计',
            key:'provider',
            children:<Outlet />
        },
        {
            label:'API 调用统计',
            key:'api',
            children:<Outlet />
        }
    ]
    
    return (<>
        <Tabs activeKey={activeKey} onChange={(val)=>{
            setActiveKey(val);
            navigateTo(`/dashboard/${val === 'total' ? val :`${val}/list`}`)
            }} 
            items={monitorTabItems}  className="h-auto mt-[6px]" size="small"  tabBarStyle={{paddingLeft:'10px',marginTop:'0px',marginBottom:'0px'}} />
    </>)
}