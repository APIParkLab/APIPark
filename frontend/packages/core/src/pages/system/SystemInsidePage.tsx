
import  {FC, useEffect, useMemo, useState} from "react";
import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import {App, Menu, MenuProps} from "antd";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import { useSystemContext} from "../../contexts/SystemContext.tsx";
import { SYSTEM_PAGE_MENU_ITEMS } from "../../const/system/const.tsx";
import { SystemConfigFieldType } from "../../const/system/type.ts";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { PERMISSION_DEFINITION } from "@common/const/permissions.ts";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";
import Paragraph from "antd/es/typography/Paragraph";
import { ItemType, MenuItemGroupType, MenuItemType } from "antd/es/menu/hooks/useItems";
import { cloneDeep } from "lodash-es";

const SystemInsidePage:FC = ()=> {
    const { message } = App.useApp()
    const { teamId,serviceId,apiId} = useParams<RouterParams>();
    const location = useLocation()
    const currentUrl = location.pathname
    const {fetchData} = useFetch()
    const { setPrefixForce,setApiPrefix ,systemInfo,setSystemInfo} = useSystemContext()
    const { accessData,checkPermission} = useGlobalContext()
    const [activeMenu, setActiveMenu] = useState<string>()
    const navigateTo = useNavigate()

    const getSystemInfo = ()=>{
        fetchData<BasicResponse<{ service:SystemConfigFieldType }>>('service/info',{method:'GET',eoParams:{team:teamId, service:serviceId}}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setSystemInfo(data.service)
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    const getApiDefine = ()=>{
        setApiPrefix('')
        setPrefixForce(false)
        fetchData<BasicResponse<{ prefix:string, force:boolean }>>('service/api/define',{method:'GET',eoParams:{service:serviceId,team:teamId}}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setApiPrefix(data.prefix)
                setPrefixForce(data.force)
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    const menuData = useMemo(()=>{
        const filterMenu = (menu:MenuItemGroupType<MenuItemType>[])=>{
            const newMenu = cloneDeep(menu)
            return newMenu!.filter((m:MenuItemGroupType )=>{
                if(m.children && m.children.length > 0){
                     m.children = m.children.filter(
                        (c)=>(c&&(c as MenuItemType&{access:string} ).access ? 
                            checkPermission((c as MenuItemType&{access:string} ).access as keyof typeof PERMISSION_DEFINITION[0]): 
                            true))
                }
                return m.children && m.children.length > 0
            })
        }
        const filteredMenu = filterMenu(SYSTEM_PAGE_MENU_ITEMS as MenuItemGroupType<MenuItemType>[])
        setActiveMenu((pre)=>{
            return pre ?? 'api'
        })
        return  filteredMenu || []
    },[accessData])
    
    const onMenuClick: MenuProps['onClick'] = ({key}) => {
        setActiveMenu(key)
    };
    
    useEffect(() => {
        if(apiId !== undefined){
            setActiveMenu('api')
        }else if(serviceId !== currentUrl.split('/')[currentUrl.split('/').length - 1]){ 
            setActiveMenu(currentUrl.split('/')[currentUrl.split('/').length - 1])
        }else{
            setActiveMenu('api')
        }
    }, [currentUrl]);

    useEffect(()=>{
        if(accessData && accessData.get('team') && accessData.get('team')?.indexOf('team.service.api.view') !== -1){
            getApiDefine()
        }
    },[accessData])

    useEffect(()=>{
        if( activeMenu && serviceId === currentUrl.split('/')[currentUrl.split('/').length - 1]){
            navigateTo(`/service/${teamId}/inside/${serviceId}/${activeMenu}`)
        }
    },[activeMenu])

    useEffect(() => {
        serviceId && getSystemInfo()
    }, [serviceId]);

    return (
        <>
        <InsidePage pageTitle={systemInfo?.name || '-'} 
                tagList={[{label:
                    <Paragraph className="mb-0" copyable={serviceId ? { text: serviceId } : false}>服务 ID：{serviceId || '-'}</Paragraph>
                }]}
                backUrl="/service/list">
                <div className="flex flex-1 h-full">
                    <Menu
                        onClick={onMenuClick}
                        className="h-full overflow-y-auto"
                        style={{ width: 220 }}
                        selectedKeys={[activeMenu!]}
                        mode="inline"
                        items={menuData as unknown as ItemType<MenuItemType>[] } 
                    />
                    <div  className={` ${['setting', 'upstream'].indexOf(activeMenu!) !== -1   ? '' :''} w-full h-full flex flex-1 flex-col overflow-auto bg-MAIN_BG  pt-[20px] pl-[20px] pb-PAGE_INSIDE_B ` }>
                            <Outlet/>
                    </div>
                </div>
            </InsidePage>

        </>
    )
}
export default SystemInsidePage