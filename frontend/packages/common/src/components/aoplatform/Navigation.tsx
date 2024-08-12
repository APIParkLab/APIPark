
import {FC, useEffect, useMemo, useState} from 'react';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useLocation, useNavigate} from "react-router-dom";
import { getNavItem } from '@common/utils/navigation';
import { PERMISSION_DEFINITION } from '@common/const/permissions';
import { useGlobalContext } from '@common/contexts/GlobalStateContext';
import { ProjectFilled } from '@ant-design/icons';
import { Icon } from '@iconify/react';
export type MenuItem = Required<MenuProps>['items'][number];

const APP_MODE = import.meta.env.VITE_APP_MODE;

// avoid changing route within ths same category
export const routerKeyMap = new Map<string, string[]|string>([
  ['workspace',['tenantManagement','service','team','serviceHub']],
  ['my',['tenantManagement','service','team']],
  ['mainPage',['dashboard','systemrunning']],
  ['operationCenter',['member','user','role','servicecategories']],
  ['organization',['member','user','role']],
  ['serviceHubSetting',['servicecategories']],
  ['maintenanceCenter',['partition','logsettings','resourcesettings','openapi']
]])

  
export const TOTAL_MENU_ITEMS: MenuProps['items'] = [
  
  getNavItem('工作空间', 'workspace','/tenantManagement',<Icon icon="ic:baseline-space-dashboard" width="18" height="18"/>, [
    getNavItem('我的', 'my','/tenantManagement',null,[
      getNavItem(<a>应用</a>, 'tenantManagement','/tenantManagement',<Icon icon="ic:baseline-apps" width="18" height="18"/>,undefined,undefined,''),
      getNavItem(<a>服务</a>, 'service','/service',<Icon icon="ic:baseline-blinds-closed" width="18" height="18"/>,undefined,undefined,''),
      getNavItem(<a>团队</a>, 'team','/team',<Icon icon="ic:baseline-people-alt" width="18" height="18"/>,undefined,undefined,''),
    ],undefined,''),
      getNavItem(<a>API 市场</a>, 'serviceHub','/serviceHub',<Icon icon="ic:baseline-hub" width="18" height="18"/>,undefined,undefined,'system.workspace.api_market.view'),
  ]),


  APP_MODE === 'pro' ? getNavItem('仪表盘', 'mainPage', '/dashboard',<Icon icon="ic:baseline-bar-chart" width="18" height="18"/>,[
    getNavItem(<a >运行视图</a>, 'dashboard','/dashboard',<ProjectFilled />,undefined,undefined,''),
    getNavItem(<a >系统拓扑图</a>, 'systemrunning','/systemrunning',<ProjectFilled />,undefined,undefined,''),
  ]):null,

  getNavItem('系统设置', 'operationCenter','/member',<Icon icon="ic:baseline-settings" width="18" height="18"/>, [
    getNavItem('组织', 'organization','/member',null,[
      getNavItem(<a>成员</a>, 'member','/member',<Icon icon="ic:baseline-people-alt" width="18" height="18"/>,undefined,undefined,'system.organization.member.view'),
      getNavItem(<a>角色</a>, 'role','/role',<Icon icon="ic:baseline-verified-user" width="18" height="18"/>,undefined,undefined,'system.organization.role.view'),
    ],undefined,''),
    getNavItem('API 市场', 'serviceHubSetting','/servicecategories',null,[
      getNavItem(<a>服务分类管理</a>, 'servicecategories','/servicecategories',<Icon icon="ic:baseline-hub" width="18" height="18"/>,undefined,undefined,'system.api_market.service_classification.view'),
    ],undefined,'system.api_market.service_classification.view'),

    getNavItem('运维与集成', 'maintenanceCenter','/cluster', null, [
      getNavItem(<a>集群</a>, 'cluster','/cluster',<Icon icon="ic:baseline-device-hub" width="18" height="18"/>,undefined,undefined,'system.devops.cluster.view'),
      getNavItem(<a>证书</a>, 'cert','/cert',<Icon icon="ic:baseline-security" width="18" height="18"/>,undefined,undefined,'system.devops.ssl_certificate.view'),
      getNavItem(<a>日志</a>, 'logsettings','/logsettings',<Icon icon="ic:baseline-sticky-note-2" width="18" height="18"/>,undefined,undefined,'system.devops.log_configuration.view'),
      APP_MODE === 'pro' ? getNavItem(<a>资源</a>, 'resourcesettings','/resourcesettings',null,undefined,undefined,'system.partition.self.view'):null,
      APP_MODE === 'pro' ? getNavItem(<a>Open API</a>, 'openapi','/openapi',null,undefined,undefined,'system.openapi.self.view'):null,
    ]),
  ]),
];

const Navigation: FC = () => {
  const location = useLocation()
  const [selectedKeys, setSelectedKeys] = useState<string>('')
  const currentUrl = location.pathname
  const navigateTo = useNavigate()
  const { accessData,checkPermission} = useGlobalContext()

  const onClick: MenuProps['onClick'] = (e) => {
    if(location.pathname.split('/')[1] === e.key) return
    const newUrl = routerKeyMap.get(e.key)
    newUrl && navigateTo(newUrl)
  };

  const menuData = useMemo(()=>{
    const filterMenu = (menu:Array<{[k:string]:unknown}>)=>{
        return menu.filter(x=> x && (x.access ? checkPermission(x.access as keyof typeof PERMISSION_DEFINITION[0]): true))
    }
    return TOTAL_MENU_ITEMS!.filter(x=>x).map((x)=> ( x.children ? {...x, children:filterMenu(x.children)} : x))?.filter(x=> x.key === 'service' || (x.children && x.children?.length > 0))
},[accessData])

  useEffect(() => {
    setSelectedKeys(currentUrl.split('/')[1] === 'template' ? currentUrl.split('/')[2] : currentUrl.split('/')[1])
  }, [currentUrl]);

  return (
    <Menu
      onClick={onClick}
      theme="dark"
      style={{height:'100%' }}
      selectedKeys={[selectedKeys]}
      defaultOpenKeys={['mainPage','dataAssets','operationCenter','maintenanceCenter']}
      mode="inline"
      items={[...menuData]}
    />
  );
};

export default Navigation;