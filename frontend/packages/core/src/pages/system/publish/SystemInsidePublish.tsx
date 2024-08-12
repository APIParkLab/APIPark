
import { Tabs } from "antd"
import { useState, useEffect, FC } from "react"
import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext"
import { RouterParams } from "@core/components/aoplatform/RenderRoutes"
import { SYSTEM_PUBLISH_TAB_ITEMS } from "../../../const/system/const"

const SystemInsidePublic:FC = ()=>{
    const { setBreadcrumb } = useBreadcrumb()
    const query =new URLSearchParams(useLocation().search)
    const location = useLocation()
    const currentUrl = location.pathname
    const [pageStatus,setPageStatus] = useState<0|1>(Number(query.get('status') ||0) as 0|1)
    const navigateTo = useNavigate()
    const { teamId} = useParams<RouterParams>();

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
                title:<Link to={`/service/list`}>内部数据服务</Link>
            },
            {
                title:'发布'
            }
        ])
    }, []);

    return (
        <>
            <Tabs defaultActiveKey={pageStatus.toString()} size="small" className="h-auto bg-MAIN_BG" tabBarStyle={{paddingLeft:'10px'}} tabBarGutter={20} items={SYSTEM_PUBLISH_TAB_ITEMS} onChange={onChange} destroyInactiveTabPane={true}/>
            <Outlet />
        </>
    )

}
export default SystemInsidePublic