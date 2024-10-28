
import { Menu, MenuProps, Skeleton, message } from "antd";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import InsidePage from "@common/components/aoplatform/InsidePage";
import { useEffect, useMemo, useState } from "react";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { DynamicMenuItem,  } from "@common/const/type";
import { useFetch } from "@common/hooks/http";
import { getItem } from "@common/utils/navigation";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes";
import { $t } from "@common/locales";
import { useGlobalContext } from "@common/contexts/GlobalStateContext";

const LogSettings = ()=>{
    const {moduleId} = useParams<RouterParams>();
    const [menuItems, setMenuItems ] = useState<MenuProps['items']>([])
    const [activeMenu, setActiveMenu] = useState<string>()
    const {fetchData} = useFetch()
    const [loading, setLoading] = useState<boolean>(true)
    const navigateTo = useNavigate()
    const {state} = useGlobalContext()

    const getDynamicMenuList = ()=>{
        return fetchData<BasicResponse<{ dynamics:DynamicMenuItem[] }>>(`simple/dynamics/log`,{method:'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                
                    setMenuItems(data.dynamics)
                    if(!activeMenu || activeMenu.length === 0){
                        navigateTo(`/logsettings/template/${data.dynamics[0].name}`)
                    }
                    return Promise.resolve(data.dynamics)
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                return Promise.reject(msg || $t(RESPONSE_TIPS.error))
            }
        })
    }

    const menuData = useMemo(()=>{
        const newMenu =  menuItems?.map((x:DynamicMenuItem)=>{
            return getItem(
                <Link to={`template/${x.name}`}>{$t(x.title)}</Link>, 
                x.name,
                undefined,
                undefined,
                undefined,
                'system.settings.log_configuration.view')
        })
        return newMenu
    },[state.language,menuItems])

    const onMenuClick: MenuProps['onClick'] = ({key}) => {
        setActiveMenu(key)
    };

    
    useEffect(() => {
        setActiveMenu(moduleId)
    }, [ moduleId]);

    useEffect(()=>{
        setLoading(true)
        Promise.all([getDynamicMenuList()]).finally(()=>setLoading(false))
    },[])
    
    return (
        <>
          <Skeleton className='m-btnbase w-calc-100vw-minus-padding-r' active loading={loading}>
                <InsidePage 
                    pageTitle={$t('日志配置')}
                    description={'APIPark '+$t("提供详尽的 API 调用日志，帮助企业监控、分析和审计 API 的运行状况。")}
                    >
                    <div className="flex h-full">
                        <Menu
                            className="h-full overflow-y-auto"
                            selectedKeys={[activeMenu || '']}
                            onClick={onMenuClick}
                            style={{ width: 220 }}
                            mode="inline"
                            items={menuData}
                        />
                        <div className={`w-full flex flex-1 flex-col h-full overflow-auto bg-MAIN_BG pt-btnbase pl-btnbase pr-PAGE_INSIDE_X pb-PAGE_INSIDE_B overflow-x-hidden`}>
                            <Outlet  context={{accessPrefix:'system.devops.log_configuration'}}/>
                        </div>
                    </div>
                </InsidePage>
            </Skeleton>
        </>
    )
}

export default LogSettings;