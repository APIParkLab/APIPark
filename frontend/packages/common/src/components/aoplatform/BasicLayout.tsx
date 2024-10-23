import { 
    ConfigProvider,
    Dropdown, 
    MenuProps,
    App,
    Button} from 'antd';
import Logo from '@common/assets/layout-logo.png';
import AvatarPic from '@common/assets/default-avatar.png'
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import { useEffect, useMemo, useState} from "react";
import { useGlobalContext } from '@common/contexts/GlobalStateContext.tsx';
import { PERMISSION_DEFINITION } from '@common/const/permissions.ts';
  import {
    ProConfigProvider,
    ProLayout,
  } from '@ant-design/pro-components';
import { BasicResponse, RESPONSE_TIPS, routerKeyMap, STATUS_CODE } from '@common/const/const.tsx';
import { UserInfoType } from '@common/const/type.ts';
import { useFetch } from '@common/hooks/http.ts';
import { ProjectFilled } from '@ant-design/icons';
import { getNavItem } from '@common/utils/navigation';
import { Icon } from '@iconify/react';
import { $t } from '@common/locales';
import LanguageSetting from './LanguageSetting';

const APP_MODE = import.meta.env.VITE_APP_MODE;
export type MenuItem = Required<MenuProps>['items'][number];

const themeToken = {
    bgLayout:'#17163E;',
    header: {
        heightLayoutHeader:72
    },
    pageContainer:{
        paddingBlockPageContainerContent:0,
        paddingInlinePageContainerContent:0,
    }
}
  
 function BasicLayout({project = 'core'}:{project:string}){
     const navigator = useNavigate()
     const location = useLocation()
     const currentUrl = location.pathname
    const { state,accessData,checkPermission,accessInit} = useGlobalContext()
    const [pathname, setPathname] = useState(currentUrl);
     const mainPage = project === 'core' ?'/service/list':'/serviceHub/list'

   const TOTAL_MENU_ITEMS:MenuProps['items'] =  useMemo(() => [
    getNavItem($t('工作空间'), 'workspace','/guide/page',<Icon icon="ic:baseline-space-dashboard" width="18" height="18"/>, [
        getNavItem(<a>{$t('首页')}</a>, 'guide','/guide/page',<Icon icon="ic:baseline-home" width="18" height="18"/>,undefined,undefined,'all'),
        getNavItem(<a>{$t('服务')}</a>, 'service','/service',<Icon icon="ic:baseline-blinds-closed" width="18" height="18"/>,undefined,undefined,'all'),
        getNavItem(<a>{$t('消费者')}</a>, 'consumer','/consumer',<Icon icon="ic:baseline-apps" width="18" height="18"/>,undefined,undefined,'all'),
        getNavItem(<a>{$t('团队')}</a>, 'team','/team',<Icon icon="ic:baseline-people-alt" width="18" height="18"/>,undefined,undefined,'all'),
    ]),
    getNavItem($t('API 市场'), 'serviceHub','/serviceHub',<Icon icon="ic:baseline-hub" width="18" height="18"/>,undefined,undefined,'system.workspace.api_market.view'),

     getNavItem($t('仪表盘'), 'mainPage', APP_MODE === 'pro' ? '/analytics' : '/analytics/total',<Icon icon="ic:baseline-bar-chart" width="18" height="18"/>,[
      getNavItem(<a >{$t('运行视图')}</a>, 'analytics',APP_MODE === 'pro' ? '/analytics' : '/analytics/total' ,<ProjectFilled />,undefined,undefined,'system.dashboard.run_view.view'),
      APP_MODE === 'pro' ? getNavItem(<a >{$t('系统拓扑图')}</a>, 'systemrunning','/systemrunning',<ProjectFilled />,undefined,undefined,'system.dashboard.systemrunning.view') : null,
    ],undefined,'system.dashboard.run_view.view'),
  
    getNavItem($t('系统设置'), 'operationCenter','/commonsetting',<Icon icon="ic:baseline-settings" width="18" height="18"/>, [
            getNavItem($t('系统'), 'serviceHubSetting','/commonsetting',null,[
            getNavItem(<a>{$t('常规')}</a>, 'commonsetting','/commonsetting',<Icon icon="ic:baseline-hub" width="18" height="18"/>,undefined,undefined,'system.api_market.service_classification.view'),
            getNavItem(<a>{$t('API 网关')}</a>, 'cluster','/cluster',<Icon icon="ic:baseline-device-hub" width="18" height="18"/>,undefined,undefined,'system.devops.cluster.view'),
            getNavItem(<a>{$t('AI 模型')}</a>, 'aisetting','/aisetting',<Icon icon="hugeicons:ai-network" width="18" height="18"/>,undefined,undefined,'system.devops.cluster.view'),
        ],undefined,'system.api_market.service_classification.view'),
      getNavItem($t('用户'), 'organization','/member',null,[
        getNavItem(<a>{$t('账号')}</a>, 'member','/member',<Icon icon="ic:baseline-people-alt" width="18" height="18"/>,undefined,undefined,'system.organization.member.view'),
        getNavItem(<a>{$t('角色')}</a>, 'role','/role',<Icon icon="ic:baseline-verified-user" width="18" height="18"/>,undefined,undefined,'system.organization.role.view'),
      ],undefined,''),
      getNavItem($t('集成'), 'maintenanceCenter','/datasourcing', null, [
        getNavItem(<a>{$t('数据源')}</a>, 'datasourcing','/datasourcing',<Icon icon="ic:baseline-monitor-heart" width="18" height="18"/>,undefined,undefined,'system.devops.data_source.view'),
        getNavItem(<a>{$t('证书')}</a>, 'cert','/cert',<Icon icon="ic:baseline-security" width="18" height="18"/>,undefined,undefined,'system.devops.ssl_certificate.view'),
        getNavItem(<a>{$t('日志')}</a>, 'logsettings','/logsettings',<Icon icon="ic:baseline-sticky-note-2" width="18" height="18"/>,undefined,undefined,'system.devops.log_configuration.view'),
        APP_MODE === 'pro' ? getNavItem(<a>{$t('资源')}</a>, 'resourcesettings','/resourcesettings',null,undefined,undefined,'system.partition.self.view'):null,
        APP_MODE === 'pro' ? getNavItem(<a>{$t('Open API')}</a>, 'openapi','/openapi',null,undefined,undefined,'system.openapi.self.view'):null,
      ]),
    ]),
  ],[state.language,accessInit])


     useEffect(() => {
         if(currentUrl === '/'){
             navigator(mainPage)
         }
         
     }, [currentUrl]);

     const headerMenuData = useMemo(() => {
        // 判断权限
        const hasAccess = (access: unknown) => checkPermission(access as keyof typeof PERMISSION_DEFINITION[0]);
    
        // 过滤菜单项
        const filterMenu = (menu: Array<{ [k: string]: unknown }>) => {
            return [...menu]
                .filter(x => x)  // 过滤掉空数据
                .map((item: any) => {
                    if (item.routes && item.routes.length > 0) {
                        // 递归处理子菜单
                        const filteredRoutes: Array<{ [k: string]: unknown }> = filterMenu(item.routes);
                        
                        if(filteredRoutes.length === 0){
                            return false
                        }
                        return {...item, routes: filteredRoutes};
                    }
                    // 处理没有 routes 的菜单项
                    if (item.access) {
                        return (item.access === 'all' || hasAccess(item.access)) ? item : null;
                    }

                    // 如果没有 access 和 routes，则保留
                    return item;
                })
                .filter(x => x); // 过滤掉处理后为 null 的项
        };
    
        // 初始过滤操作
        const res = [...TOTAL_MENU_ITEMS]!.filter(x => x).map((x: any) => (x.routes ? { ...x, routes: filterMenu(x.routes) } : x));
        // 返回处理后的数据
        return { path: '/', routes: res.map(x=> ({...x, routes: x.routes?.filter(x=> (x.access || x.routes?.length > 0))})).filter(x=> (x.access || x.routes?.length > 0)) };
    }, [accessData, state.language]);

    

     
    const { message } = App.useApp()
    const { dispatch,resetAccess,getGlobalAccessData} = useGlobalContext()
    const [userInfo,setUserInfo] = useState<UserInfoType>()
    const {fetchData} = useFetch()
    const navigate = useNavigate();

    const getUserInfo = ()=>{
        fetchData<BasicResponse<{profile:UserInfoType}>>('account/profile',{method:'GET'})
            .then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setUserInfo(data.profile)
                dispatch({type:'UPDATE_USERDATA',userData:data.profile})
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        })
    }

    useEffect(() => {
        getUserInfo()
        getGlobalAccessData()
    }, []);
    
    const logOut = ()=>{
        fetchData<BasicResponse<null>>('account/logout',{method:'GET'}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                dispatch({type:'LOGOUT'})
                resetAccess()
                // message.success(msg || $t(RESPONSE_TIPS.logoutSuccess))
                navigate('/login')
            }else{
                message.error(msg ||$t(RESPONSE_TIPS.error))
            }
        })
    }

    const items: MenuProps['items'] = [
        {
            key: '2',
            label: (
                <Button key="changePsw" type="text" className="flex items-center p-0 bg-transparent border-none " onClick={()=>navigator('/userProfile/changepsw')}>
                {$t('账号设置')}
                </Button>)
        },
        {
            key: '3',
            label: (
                <Button key="logout" type="text" className="flex items-center p-0 bg-transparent border-none " onClick={logOut}>
                {$t('退出登录')}
                </Button>)
        },
    ];



    return(
        <div
            id="test-pro-layout"
            style={{
            height: '100vh',
            overflow: 'auto',
            }}
        >
            <ProConfigProvider hashed={false}>
                <ConfigProvider
                    getTargetContainer={() => {
                    return document.getElementById('test-pro-layout') || document.body;
                    }}
                >
                    <ProLayout
                        prefixCls="apipark-layout"
                        location={{
                            pathname,
                        }}
                        siderWidth={220}
                        breakpoint={'lg'}
                        route={headerMenuData}
                        token={themeToken}
                        siderMenuType="group"
                        menu={{
                            type: 'group',
                            collapsedShowGroupTitle: true,
                        }}
                        disableMobile={true}
                        avatarProps={{
                            src: AvatarPic || userInfo?.avatar,
                            size: 'small',
                            title: userInfo?.username||'unknown',
                            render: (props, dom) => {
                            return (
                                <Dropdown
                                menu={{
                                    items
                                }}
                                >
                                <div className='avatar-dom'>{dom}
                                </div>
                                </Dropdown>
                            );
                            },
                        }}
                        actionsRender={(props) => {
                          if (props.isMobile) return [];
                          if (typeof window === 'undefined') return [];
                          return [
                            <LanguageSetting />,
                            <Button  className=" text-[#ffffffb3] hover:text-[#fff] border-none" type="default" ghost onClick={()=>{window.open('https://docs.apipark.com','_blank')}}>
                              <span className='flex items-center gap-[8px]'> <Icon icon="ic:baseline-help" width="14" height="14"/>{$t('文档')}</span>
                            </Button> 
                          ];
                        }}
                        headerTitleRender={() => (
                            <div className="w-[192px]  flex items-center">
                            <img
                                className="h-[20px] cursor-pointer "
                                src={Logo}
                                onClick={()=> navigator(mainPage)}
                            />
                            </div>
                        )}
                        logo={Logo}
                        pageTitleRender={()=>$t('APIPark - 企业API数据开放平台')}
                        menuFooterRender={(props) => {
                            if (props?.collapsed) return undefined;
                        }}
                        menuItemRender={(item, dom) => (
                            <div
                                onClick={() => {
                                // 同级目录点击无效
                                if(item.key && routerKeyMap.get(item.key) && routerKeyMap.get(item.key).length > 0 && routerKeyMap.get(item.key)?.indexOf(pathname.split('/')[1]) !== -1){
                                return
                                }
                                if(item.key === pathname.split('/')[1]){
                                return
                                }
                                
                                if(item.path){
                                navigator(item.path)
                                }
                                setPathname(item.path || '');
                            }}
                            >
                            {dom}
                            </div>
                        )}
                        fixSiderbar={true}
                        layout='mix'
                        splitMenus={true}
                        collapsed={false}
                        collapsedButtonRender={false}
                    >
                    <div className={`w-full h-calc-100vh-minus-navbar pl-PAGE_INSIDE_X pt-PAGE_INSIDE_T ${currentUrl.startsWith('/role/list') ? 'overflow-auto' : 'overflow-hidden' }`}>
                        <Outlet />
                    </div>
                    </ProLayout>
                </ConfigProvider>
            </ProConfigProvider>
      </div>
    )
}
export default BasicLayout