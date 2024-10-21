
import { Tabs } from "antd"
import { useState, useEffect, FC, useMemo } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext"
import { SYSTEM_PUBLISH_TAB_ITEMS } from "../../../const/system/const"
import { $t } from "@common/locales"
import { useGlobalContext } from "@common/contexts/GlobalStateContext"

const AiServiceInsidePublic:FC = ()=>{
    const { setBreadcrumb } = useBreadcrumb()
    const query =new URLSearchParams(useLocation().search)
    const location = useLocation()
    const currentUrl = location.pathname
    const [pageStatus,setPageStatus] = useState<0|1>(Number(query.get('status') ||0) as 0|1)
    const navigateTo = useNavigate()
    const { state } = useGlobalContext()

    const onChange = (key: string) => {
        setPageStatus(Number(key) as 0|1)
        navigateTo(`${currentUrl}?status=${key}`);
    };

    useEffect(() => {
        setPageStatus(Number(query.get('status') ||0) as 0|1)
    }, [currentUrl]);

    useEffect(() => {
        setBreadcrumb([
            {
                title:<Link to={`/service/list`}>{$t('服务')}</Link>
            },
            {
                title:$t('发布')
            }
        ])
    }, []);
    
    const tabItems = useMemo(()=>SYSTEM_PUBLISH_TAB_ITEMS?.map((x)=>({...x, label:$t(x.label as string) })),[state.language])
    return (
        <>
            <Tabs defaultActiveKey={pageStatus.toString()} size="small" className="h-auto bg-MAIN_BG" tabBarStyle={{paddingLeft:'10px'}} tabBarGutter={20} items={tabItems} onChange={onChange} destroyInactiveTabPane={true}/>
            <Outlet />
        </>
    )

}
export default AiServiceInsidePublic