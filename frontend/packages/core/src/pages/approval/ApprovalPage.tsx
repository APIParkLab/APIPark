
import { Menu, MenuProps, Tabs, TabsProps} from "antd";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import ApprovalList from "./ApprovalList.tsx";
import { getItem } from "@common/utils/navigation.tsx";
import { $t } from "@common/locales/index.ts";


const menuItems: MenuProps['items'] = [
    getItem($t('管理'), 'mng', null,
        [
            getItem(<Link to="/approval?type=subscribe">{$t('订阅申请')}</Link>, 'subscribe'),
            getItem(<Link to="/approval?type=release">{$t('发布申请')}</Link>, 'release')],
        'group'),
];

const items: TabsProps['items'] = [
    {
        key: '0',
        label: $t('待审批'),
    },
    {
        key: '1',
        label: $t('已审批'),
    }
];

export default function ApprovalPage(){
    const navigateTo = useNavigate()
    const location = useLocation()
    const currentUrl = location.pathname
    const query =new URLSearchParams(useLocation().search)
    const [pageType,setPageType] = useState<'subscribe'|'release'>((query?.get('type') ||'subscribe') as 'subscribe'|'release')
    const [pageStatus,setPageStatus] = useState<0|1>(Number(query.get('status') ||0) as 0|1)

    const onMenuClick: MenuProps['onClick'] = (e) => {
        setPageType(e.key as 'subscribe'|'release')
        navigateTo(`${currentUrl}?type=${e.key}&status=${pageStatus}`);
    };

    const onChange = (key:string ) => {
        setPageStatus(Number(key) as 0|1)
        navigateTo(`${currentUrl}?type=${pageType}&status=${key}`);
    };


    useEffect(() => {
        setPageType((query?.get('type') ||'subscribe') as 'subscribe'|'release')
        setPageStatus(Number(query.get('status') ||0) as 0|1)
    }, [currentUrl]);

    return (
        <>
                <div className="flex flex-1 h-full">
                    <Menu
                        onClick={onMenuClick}
                        className="h-full overflow-y-auto"
                        style={{ width: 220 }}
                        selectedKeys={[pageType]}
                        mode="inline"
                        items={menuItems}
                    />
                    <div className="w-[calc(100%-175px)]">
                        <Tabs activeKey={pageStatus.toString()} size="small" className="h-auto" tabBarStyle={{paddingLeft:'10px',marginTop:'0px',marginBottom:'0px'}} tabBarGutter={20} items={items} onChange={onChange} destroyInactiveTabPane={true}/>
                        <ApprovalList pageType={pageType} pageStatus={pageStatus} />
                    </div>
                </div>
        </>
    )
}