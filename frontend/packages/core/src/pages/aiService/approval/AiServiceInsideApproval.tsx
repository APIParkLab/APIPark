
import {Tabs} from "antd";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import './AiServiceInsideApproval.module.css'
import  {FC, useEffect, useMemo, useState} from "react";
import { SYSTEM_INSIDE_APPROVAL_TAB_ITEMS } from "../../../const/system/const";
import { useGlobalContext } from "@common/contexts/GlobalStateContext";
import { $t } from "@common/locales";


const AiServiceInsideApproval:FC = ()=>{
    const navigateTo = useNavigate()
    const location = useLocation()
    const query =new URLSearchParams(useLocation().search)
    const currentUrl = location.pathname
    const [pageStatus,setPageStatus] = useState<0|1>(Number(query.get('status') ||0) as 0|1)
    const {state} = useGlobalContext()
    const onChange = (key: string) => {
        setPageStatus(Number(key) as 0|1)
        navigateTo(`${currentUrl}?status=${key}`);
    };

    useEffect(() => {
        setPageStatus(Number(query.get('status') ||0) as 0|1)
    }, [currentUrl]);
    const tabItems = useMemo(()=>SYSTEM_INSIDE_APPROVAL_TAB_ITEMS?.map((x)=>({...x, label:$t(x.label as string) })),[state.language])

    return (
        <>
        <Tabs defaultActiveKey={pageStatus.toString()} size="small" className="h-auto  bg-MAIN_BG" tabBarStyle={{paddingLeft:'10px'}} tabBarGutter={20} items={tabItems} onChange={onChange} destroyInactiveTabPane={true}/>
        <Outlet />
        </>
    )
}

export default AiServiceInsideApproval