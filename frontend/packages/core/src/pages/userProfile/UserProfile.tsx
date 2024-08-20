
import  {FC, useEffect, useState} from "react";
import { Link, Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import { Menu} from "antd";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";
import { getItem } from "@common/utils/navigation.tsx";
import { $t } from "@common/locales";

const UserProfile:FC = ()=> {
    const {teamId} = useParams<RouterParams>();
    const location = useLocation()
    const navigateTo = useNavigate()
    const [activeMenu, setActiveMenu] = useState<string>()


    const menuData = [
        getItem(<Link to="changepsw">{$t('修改密码')}</Link>, 'changepsw')]


    useEffect(() => {
        if(location.pathname.split('/')[location.pathname.split('/').length -1] !== teamId){
            setActiveMenu(location.pathname.split('/')[location.pathname.split('/').length -1].toLowerCase())
        }
    }, [location]);

    useEffect(()=>{
        if( activeMenu && teamId === location.pathname.split('/')[location.pathname.split('/').length - 1]){
            navigateTo(`/userProfile/${activeMenu}`)
        }
    },[activeMenu])


    return (
        <>
            <InsidePage 
                pageTitle={$t('账号设置')}
                description={$t("管理个人账号")}
                >
                <div className="flex h-full">
                    <Menu
                        style={{ width: 220 }}
                        mode="inline"
                        items={menuData}
                        selectedKeys={[activeMenu || 'changepsw']}
                    />
                    <div className={`flex flex-1 flex-col h-full overflow-auto bg-MAIN_BG pb-PAGE_INSIDE_B pt-[20px] pl-[10px] `}>
                        <Outlet  />
                    </div>
                </div>
            </InsidePage>
            </>
    )
}
export default UserProfile