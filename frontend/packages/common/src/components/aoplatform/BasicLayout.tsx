import { ProConfigProvider, ProLayout } from '@ant-design/pro-components'
import AvatarPic from '@common/assets/default-avatar.png'
import Logo from '@common/assets/layout-logo.png'
import { BasicResponse, RESPONSE_TIPS, routerKeyMap, STATUS_CODE } from '@common/const/const.tsx'
import { PERMISSION_DEFINITION } from '@common/const/permissions.ts'
import { UserInfoType } from '@common/const/type.ts'
import { useGlobalContext } from '@common/contexts/GlobalStateContext.tsx'
import { usePluginSlotHub } from '@common/contexts/PluginSlotHubContext'
import { useFetch } from '@common/hooks/http.ts'
import { $t } from '@common/locales'
import { transformMenuData } from '@common/utils/navigation'
import { Icon } from '@iconify/react'
import { App, Button, ConfigProvider, Dropdown, MenuProps } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import LanguageSetting from './LanguageSetting'

const APP_MODE = import.meta.env.VITE_APP_MODE
export type MenuItem = Required<MenuProps>['items'][number]

const themeToken = {
  bgLayout: '#17163E;',
  header: {
    heightLayoutHeader: 72
  },
  pageContainer: {
    paddingBlockPageContainerContent: 0,
    paddingInlinePageContainerContent: 0
  }
}

function BasicLayout({ project = 'core' }: { project: string }) {
  const navigator = useNavigate()
  const location = useLocation()
  const currentUrl = location.pathname
  const { state, accessData, checkPermission, accessInit, dispatch, resetAccess, getGlobalAccessData, menuList } =
    useGlobalContext()
  const [pathname, setPathname] = useState(currentUrl)
  const mainPage = project === 'core' ? '/service/list' : '/portal/list'
  const [menuItems, setMenuItems] = useState<MenuProps['items']>()
  const pluginSlotHub = usePluginSlotHub()

  useEffect(() => {
    const newMenu = transformMenuData(menuList)
    setMenuItems(newMenu)
  }, [menuList, state.language, accessInit])

  useEffect(() => {
    if (currentUrl === '/') {
      navigator(mainPage)
    }
  }, [currentUrl])

  const headerMenuData = useMemo(() => {
    // 判断权限
    const hasAccess = (access: unknown) => checkPermission(access as keyof (typeof PERMISSION_DEFINITION)[0])

    // 过滤菜单项
    const filterMenu = (menu: Array<{ [k: string]: unknown }>) => {
      return [...menu]
        .filter((x) => x) // 过滤掉空数据
        .map((item: any) => {
          if (item.routes && item.routes.length > 0) {
            // 递归处理子菜单
            const filteredRoutes: Array<{ [k: string]: unknown }> = filterMenu(item.routes)

            if (filteredRoutes.length === 0) {
              return false
            }
            return { ...item, routes: filteredRoutes, name: $t(item.name) }
          }
          // 处理没有 routes 的菜单项
          if (item.access) {
            return item.access === 'all' || hasAccess(item.access) ? { ...item, name: $t(item.name) } : null
          }
          // 如果没有 access 和 routes，则保留
          return { ...item, name: $t(item.name) }
        })
        .filter((x) => x) // 过滤掉处理后为 null 的项
    }

    // 初始过滤操作
    const res = [...(menuItems || [])]!
      .filter((x) => x)
      .map((x: any) =>
        x.routes ? { ...x, name: $t(x.name), routes: filterMenu(x.routes) } : { ...x, name: $t(x.name) }
      )
    // 返回处理后的数据
    return {
      path: '/',
      routes: res
        .map((x) => ({ ...x, routes: x.routes?.filter((x) => x.access || x.routes?.length > 0) }))
        .filter((x) => x.access || x.routes?.length > 0)
    }
  }, [accessData, state.language, menuItems])

  const { message } = App.useApp()
  const [userInfo, setUserInfo] = useState<UserInfoType>()
  const { fetchData } = useFetch()
  const navigate = useNavigate()

  const getUserInfo = () => {
    fetchData<BasicResponse<{ profile: UserInfoType }>>('account/profile', { method: 'GET' }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setUserInfo(data.profile)
        dispatch({ type: 'UPDATE_USERDATA', userData: data.profile })
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  useEffect(() => {
    getUserInfo()
    getGlobalAccessData()
  }, [])

  useEffect(() => {
    setPathname(location.pathname)
  }, [location.pathname])

  const logOut = () => {
    fetchData<BasicResponse<null>>('account/logout', { method: 'GET' }).then((response) => {
      const { code, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        dispatch({ type: 'LOGOUT' })
        resetAccess()
        // message.success(msg || $t(RESPONSE_TIPS.logoutSuccess))
        navigate('/login')
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const items: MenuProps['items'] = useMemo(
    () =>
      [
        userInfo?.type !== 'guest' && {
          key: '2',
          label: (
            <Button
              key="changePsw"
              type="text"
              className="flex items-center p-0 bg-transparent border-none"
              onClick={() => navigator('/userProfile/changepsw')}
            >
              {$t('账号设置')}
            </Button>
          )
        },
        {
          key: '3',
          label: (
            <Button
              key="logout"
              type="text"
              className="flex items-center p-0 bg-transparent border-none"
              onClick={logOut}
            >
              {$t('退出登录')}
            </Button>
          )
        }
      ].filter(Boolean),
    [userInfo]
  )

  const actionRender = useMemo(() => {
    return [
      <LanguageSetting />,
      <Button
        className=" text-[#ffffffb3] hover:text-[#fff] border-none"
        type="default"
        ghost
        onClick={() => {
          window.open('https://docs.apipark.com', '_blank')
        }}
      >
        <span className="flex items-center gap-[8px]">
          {' '}
          <Icon icon="ic:baseline-help" width="14" height="14" />
          {$t('文档')}
        </span>
      </Button>,
      ...((pluginSlotHub.getSlot('basicLayoutAfterBtns') as unknown[]) || [])
    ]
  }, [state.language, pluginSlotHub.getSlot('basicLayoutAfterBtns')])

  return (
    <div
      id="test-pro-layout"
      style={{
        height: '100vh',
        overflow: 'auto'
      }}
    >
      <ProConfigProvider hashed={false}>
        <ConfigProvider
          getTargetContainer={() => {
            return document.getElementById('test-pro-layout') || document.body
          }}
        >
          <ProLayout
            prefixCls="apipark-layout"
            location={{
              pathname
            }}
            siderWidth={220}
            breakpoint={'lg'}
            route={headerMenuData}
            token={themeToken}
            siderMenuType="group"
            menu={{
              type: 'group',
              collapsedShowGroupTitle: true
            }}
            disableMobile={true}
            avatarProps={{
              src: AvatarPic || userInfo?.avatar,
              size: 'small',
              title: userInfo?.username || 'unknown',
              render: (props, dom) => {
                return (
                  <Dropdown
                    menu={{
                      items
                    }}
                  >
                    <div className="avatar-dom">{dom}</div>
                  </Dropdown>
                )
              }
            }}
            actionsRender={(props) => {
              if (props.isMobile) return []
              if (typeof window === 'undefined') return []
              return actionRender
            }}
            headerTitleRender={() => (
              <div className="w-[192px]  flex items-center">
                <img className="h-[20px] cursor-pointer " src={Logo} onClick={() => navigator(mainPage)} />
                <a
                  className="align-text-top ml-[5px] h-[25px] relative"
                  href="https://github.com/APIParkLab/APIPark"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src="https://img.shields.io/github/stars/APIParkLab/APIPark?style=social"
                    className="absolute top-[6px]"
                    width={75}
                    alt=""
                  />
                </a>
              </div>
            )}
            logo={Logo}
            pageTitleRender={() => $t('APIPark')}
            menuFooterRender={(props) => {
              if (props?.collapsed) return undefined
            }}
            menuItemRender={(item, dom) => (
              <div
                onClick={() => {
                  // 同级目录点击无效
                  if (
                    item.key &&
                    routerKeyMap.get(item.key) &&
                    routerKeyMap.get(item.key).length > 0 &&
                    routerKeyMap.get(item.key)?.indexOf(pathname.split('/')[1]) !== -1
                  ) {
                    return
                  }
                  if (item.key === pathname.split('/')[1]) {
                    return
                  }

                  if (item.path) {
                    navigator(item.path)
                  }
                  setPathname(item.path || '')
                }}
              >
                {dom}
              </div>
            )}
            fixSiderbar={true}
            layout="mix"
            splitMenus={true}
            collapsed={false}
            collapsedButtonRender={false}
          >
            <div
              className={`w-full h-calc-100vh-minus-navbar ${
                currentUrl.startsWith('/role/list') ? 'overflow-auto' : 'overflow-hidden'
              } ${currentUrl.startsWith('/guide/page') ? '' : 'pl-PAGE_INSIDE_X pt-PAGE_INSIDE_T'}`}
            >
              <Outlet />
            </div>
          </ProLayout>
        </ConfigProvider>
      </ProConfigProvider>
    </div>
  )
}
export default BasicLayout
