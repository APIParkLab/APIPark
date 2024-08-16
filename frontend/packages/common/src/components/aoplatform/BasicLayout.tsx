import { 
    ConfigProvider,
    Dropdown, 
    MenuProps,
    App,
    Button} from 'antd';
import Logo from '@common/assets/layout-logo.png';
import AvatarPic from '@common/assets/default-avatar.png'
import { routerKeyMap, TOTAL_MENU_ITEMS } from "./Navigation";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useMemo, useRef, useState} from "react";
import { useGlobalContext } from '@common/contexts/GlobalStateContext.tsx';
import { PERMISSION_DEFINITION } from '@common/const/permissions.ts';
  import {
    ProConfigProvider,
    ProLayout,
  } from '@ant-design/pro-components';
import { UserProfile } from './UserProfile.tsx';
import { ResetPsw, ResetPswHandle } from './ResetPsw.tsx';
import { BasicResponse, STATUS_CODE } from '@common/const/const.ts';
import { UserInfoType, UserProfileHandle } from '@common/const/type.ts';
import { useFetch } from '@common/hooks/http.ts';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react/dist/iconify.js';
  
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
    const { accessData,checkPermission} = useGlobalContext()
    const [pathname, setPathname] = useState(currentUrl);
     const mainPage = project === 'core' ?'/service/list':'/serviceHub/list'

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
                        return hasAccess(item.access) ? item : null;
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
    }, [accessData]);

    const { modal,message } = App.useApp()
    const { dispatch,resetAccess,getGlobalAccessData} = useGlobalContext()
    const [userInfo,setUserInfo] = useState<UserInfoType>()
    const resetPswRef = useRef<ResetPswHandle>(null)
    const userProfileRef = useRef<UserProfileHandle>(null)
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
                message.error(msg || '操作失败')
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
                message.success(msg || '退出成功，将跳转至登录页')
                navigate('/login')
            }else{
                message.error(msg ||'操作失败')
            }
        })
    }

    const items: MenuProps['items'] = [
        {
            key: '2',
            label: (
                <Button key="changePsw" type="text" className="border-none p-0 flex items-center bg-transparent " onClick={()=>navigator('/userProfile/changepsw')}>
                账号设置
                </Button>)
        },
        {
            key: '3',
            label: (
                <Button key="logout" type="text" className="border-none p-0 flex items-center bg-transparent " onClick={logOut}>
                退出登录
                </Button>)
        },
    ];

    const openModal = (type:'userSetting'|'resetPsw')=>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'userSetting':
                title='用户设置'
                content=<UserProfile ref={userProfileRef} entity={userInfo}/>
                break;
            case 'resetPsw':
                title='重置密码'
                content=<ResetPsw ref={resetPswRef} entity={userInfo}  />
                break;
        }
        modal.confirm({
            title,
            content,
            onOk:()=>{
                switch (type){
                    case 'userSetting':
                        return userProfileRef.current?.save().then((res)=>{if(res === true) getUserInfo()})
                    case 'resetPsw':
                        return resetPswRef.current?.save().then((res)=>{if(res === true) logOut()})
                }
            },
            width:600,
            okText:'确认',
            cancelText:'取消',
            closable:true,
            icon:<></>,
        })
    }

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
                    <Button  className=" text-[#ffffffb3] hover:text-[#fff] border-none" type="default" ghost onClick={()=>{window.open('https://docs.apipark.com','_blank')}}>
                      <span className='flex items-center gap-[8px]'> <Icon icon="ic:baseline-help" width="14" height="14"/>文档</span>
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
                pageTitleRender={()=>'APIPark - 企业API数据开放平台'}
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