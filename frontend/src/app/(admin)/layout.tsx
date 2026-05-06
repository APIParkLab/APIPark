'use client'

import { StyleProvider } from '@ant-design/cssinjs'
import { ProConfigProvider, ProLayout } from '@ant-design/pro-components'
import { LoadingOutlined } from '@ant-design/icons'
import AvatarPic from '@common/assets/default-avatar.png'
import Logo from '@common/assets/layout-logo.png'
import LanguageSetting from '@common/components/aoplatform/LanguageSetting'
import { BasicResponse, RESPONSE_TIPS, routerKeyMap, STATUS_CODE } from '@common/const/const'
import { PERMISSION_DEFINITION } from '@common/const/permissions'
import { UserInfoType } from '@common/const/type'
import { GlobalProvider, useGlobalContext } from '@common/contexts/GlobalStateContext'
import { LocaleProvider, useLocaleContext } from '@common/contexts/LocaleContext'
import { PluginEventHubProvider } from '@common/contexts/PluginEventHubContext'
import { PluginSlotHubProvider, usePluginSlotHub } from '@common/contexts/PluginSlotHubContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { transformMenuData } from '@common/utils/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import { App as AppAntd, Button, ConfigProvider, Dropdown, MenuProps, Spin } from 'antd'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useMemo, useState } from 'react'

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

function AdminShell({ children, project = 'core' }: { children: ReactNode; project?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const { state, accessData, checkPermission, accessInit, dispatch, resetAccess, getGlobalAccessData, menuList } =
    useGlobalContext()
  const [currentPath, setCurrentPath] = useState(pathname)
  const mainPage = state.mainPage || (project === 'core' ? '/guide/page' : '/portal/list')
  const [menuItems, setMenuItems] = useState<MenuProps['items']>()
  const pluginSlotHub = usePluginSlotHub()
  const { message } = AppAntd.useApp()
  const [userInfo, setUserInfo] = useState<UserInfoType>()
  const { fetchData } = useFetch()

  useEffect(() => {
    setMenuItems(transformMenuData(menuList))
  }, [menuList, state.language, accessInit])

  useEffect(() => {
    if (pathname === '/') {
      router.push(mainPage)
    }
  }, [pathname, mainPage, router])

  useEffect(() => {
    setCurrentPath(pathname)
  }, [pathname])

  const headerMenuData = useMemo(() => {
    const hasAccess = (access: unknown) => checkPermission(access as keyof (typeof PERMISSION_DEFINITION)[0])

    const filterMenu = (menu: Array<{ [k: string]: unknown }>) => {
      return [...menu]
        .filter((x) => x)
        .map((item: any) => {
          if (item.routes && item.routes.length > 0) {
            const filteredRoutes: Array<{ [k: string]: unknown }> = filterMenu(item.routes)
            if (filteredRoutes.length === 0) {
              return false
            }
            return { ...item, routes: filteredRoutes, name: $t(item.name) }
          }
          if (item.access) {
            return item.access === 'all' || hasAccess(item.access) ? { ...item, name: $t(item.name) } : null
          }
          return { ...item, name: $t(item.name) }
        })
        .filter((x) => x)
    }

    const res = [...(menuItems || [])]
      .filter((x) => x)
      .map((x: any) =>
        x.routes ? { ...x, name: $t(x.name), routes: filterMenu(x.routes) } : { ...x, name: $t(x.name) }
      )

    return {
      path: '/',
      routes: res
        .map((x) => ({ ...x, routes: x.routes?.filter((routeItem: any) => routeItem.access || routeItem.routes?.length > 0) }))
        .filter((x) => x.access || x.routes?.length > 0)
    }
  }, [accessData, state.language, menuItems, checkPermission])

  useEffect(() => {
    fetchData<BasicResponse<{ profile: UserInfoType }>>('account/profile', { method: 'GET' }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setUserInfo(data.profile)
        dispatch({ type: 'UPDATE_USERDATA', userData: data.profile })
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
    getGlobalAccessData()
  }, [])

  const logOut = () => {
    fetchData<BasicResponse<null>>('account/logout', { method: 'GET' }).then((response) => {
      const { code, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        dispatch({ type: 'LOGOUT' })
        resetAccess()
        router.push('/admin/login')
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const items: MenuProps['items'] = useMemo(
    () =>
      [
        !['guest', 'third-user'].includes(userInfo?.type as string) && {
          key: '2',
          label: (
            <Button
              key="changePsw"
              type="text"
              className="flex items-center p-0 bg-transparent border-none"
              onClick={() => router.push('/userProfile/changepsw')}
            >
              {$t('账号设置')}
            </Button>
          )
        },
        {
          key: '3',
          label: (
            <Button key="logout" type="text" className="flex items-center p-0 bg-transparent border-none" onClick={logOut}>
              {$t('退出登录')}
            </Button>
          )
        }
      ].filter(Boolean),
    [userInfo, router]
  )

  const actionRender = useMemo(() => {
    return [
      <LanguageSetting key="lang" />,
      <Button
        key="docs"
        className="text-[#ffffffb3] hover:text-[#fff] border-none"
        type="default"
        ghost
        onClick={() => window.open('https://docs.apipark.com', '_blank')}
      >
        <span className="flex items-center gap-[8px]">
          <Icon icon="ic:baseline-help" width="14" height="14" />
          {$t('文档')}
        </span>
      </Button>,
      ...(((pluginSlotHub.getSlot('basicLayoutAfterBtns') as ReactNode[]) || []) as ReactNode[])
    ]
  }, [state.language, pluginSlotHub])

  const logoSrc = typeof Logo === 'string' ? Logo : (Logo as any)?.src
  const avatarSrc = userInfo?.avatar || (typeof AvatarPic === 'string' ? AvatarPic : (AvatarPic as any)?.src)

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
            location={{ pathname: currentPath }}
            siderWidth={220}
            breakpoint={'lg'}
            route={headerMenuData as any}
            token={themeToken}
            siderMenuType="group"
            menu={{ type: 'group', collapsedShowGroupTitle: true }}
            disableMobile={true}
            avatarProps={{
              src: avatarSrc,
              size: 'small',
              title: userInfo?.username || 'unknown',
              render: (props, dom) => (
                <Dropdown menu={{ items }}>
                  <div className="avatar-dom">{dom}</div>
                </Dropdown>
              )
            }}
            actionsRender={(props) => {
              if (props.isMobile) return []
              return actionRender
            }}
            headerTitleRender={() => (
              <div className="w-[192px] flex items-center">
                <img className="h-[20px] cursor-pointer" src={logoSrc} onClick={() => router.push(mainPage)} alt="logo" />
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
            logo={logoSrc}
            pageTitleRender={() => $t('APIPark')}
            menuFooterRender={(props) => {
              if (props?.collapsed) return undefined
            }}
            menuItemRender={(item, dom) => (
              <div
                onClick={() => {
                  if (
                    item.key &&
                    routerKeyMap.get(item.key as string) &&
                    (routerKeyMap.get(item.key as string) as string[])?.length > 0 &&
                    (routerKeyMap.get(item.key as string) as string[])?.indexOf(currentPath.split('/')[1]) !== -1
                  ) {
                    return
                  }
                  if (item.key === currentPath.split('/')[1]) {
                    return
                  }
                  if (item.path) {
                    router.push(item.path)
                  }
                  setCurrentPath(item.path || '')
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
              className={`w-full h-calc-100vh-minus-navbar ${currentPath.startsWith('/role/list') ? 'overflow-auto' : 'overflow-hidden'
                } ${currentPath.startsWith('/guide/page') ? '' : 'pl-PAGE_INSIDE_X pt-PAGE_INSIDE_T'}`}
            >
              {children}
            </div>
          </ProLayout>
        </ConfigProvider>
      </ProConfigProvider>
    </div>
  )
}

function AdminProviders({ children }: { children: ReactNode }) {
  const { locale } = useLocaleContext()

  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider locale={locale} wave={{ disabled: true }}>
        <PluginEventHubProvider>
          <GlobalProvider>
            <AppAntd className="h-full" message={{ maxCount: 1 }}>
              <PluginSlotHubProvider>
                <AdminShell project="core">{children}</AdminShell>
              </PluginSlotHubProvider>
            </AppAntd>
          </GlobalProvider>
        </PluginEventHubProvider>
      </ConfigProvider>
    </StyleProvider>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        spinning={true}
        className="w-full h-full flex items-center justify-center"
      />
    )
  }

  return (
    <LocaleProvider>
      <AdminProviders>{children}</AdminProviders>
    </LocaleProvider>
  )
}
