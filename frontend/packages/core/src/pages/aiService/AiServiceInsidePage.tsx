import InsidePage from '@common/components/aoplatform/InsidePage.tsx'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const.tsx'
import { PERMISSION_DEFINITION } from '@common/const/permissions.ts'
import { useGlobalContext } from '@common/contexts/GlobalStateContext.tsx'
import { useFetch } from '@common/hooks/http.ts'
import { $t } from '@common/locales/index.ts'
import { getItem } from '@common/utils/navigation.tsx'
import { RouterParams } from '@core/components/aoplatform/RenderRoutes.tsx'
import { AiServiceConfigFieldType } from '@core/const/ai-service/type.ts'
import { App, Menu, MenuProps } from 'antd'
import { ItemType, MenuItemGroupType, MenuItemType } from 'antd/es/menu/interface'
import ServiceInfoCard from '@common/components/aoplatform/serviceInfoCard.tsx'
import { cloneDeep } from 'lodash-es'
import { FC, useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAiServiceContext } from '../../contexts/AiServiceContext.tsx'
import { useBreadcrumb } from '@common/contexts/BreadcrumbContext.tsx'
const APP_MODE = import.meta.env.VITE_APP_MODE

const AiServiceInsidePage: FC = () => {
  const { message } = App.useApp()
  const { teamId, serviceId, apiId, routeId, policyId } = useParams<RouterParams>()
  const location = useLocation()
  const currentUrl = location.pathname
  const { fetchData } = useFetch()
  const { setPrefixForce, setApiPrefix, aiServiceInfo, setAiServiceInfo } = useAiServiceContext()
  const { accessData, checkPermission, accessInit, state } = useGlobalContext()
  const [activeMenu, setActiveMenu] = useState<string>()
  const navigateTo = useNavigate()
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const { setBreadcrumb } = useBreadcrumb()

  const getAiServiceInfo = () => {
    fetchData<BasicResponse<{ service: AiServiceConfigFieldType }>>('service/info', {
      method: 'GET',
      eoParams: { team: teamId, service: serviceId },
      eoTransformKeys: ['provider_type']
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setAiServiceInfo(data.service)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const getApiDefine = () => {
    setApiPrefix('')
    setPrefixForce(false)
    fetchData<BasicResponse<{ prefix: string; force: boolean }>>('service/router/define', {
      method: 'GET',
      eoParams: { service: serviceId, team: teamId }
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setApiPrefix(data.prefix)
        setPrefixForce(data.force)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const SYSTEM_PAGE_MENU_ITEMS = useMemo(
    () => [
      getItem(
        $t('服务'),
        'assets',
        null,
        [
          getItem(<Link to="./overview">{$t('总览')}</Link>, 'overview', undefined, undefined, undefined, ''),
          getItem(
            <Link to="./route">{$t('API 路由')}</Link>,
            'route',
            undefined,
            undefined,
            undefined,
            'team.service.router.view'
          ),
          getItem(
            <Link to="./api">{$t('API 文档')}</Link>,
            'api',
            undefined,
            undefined,
            undefined,
            'team.service.api_doc.view'
          ),
          getItem(
            <Link to="./document">{$t('使用说明')}</Link>,
            'document',
            undefined,
            undefined,
            undefined,
            'team.service.service_intro.view'
          ),
          getItem(
            <Link to="./servicepolicy">{$t('服务策略')}</Link>,
            'servicepolicy',
            undefined,
            undefined,
            undefined,
            'team.service.policy.view'
          ),
          getItem(
            <Link to="./publish">{$t('发布')}</Link>,
            'publish',
            undefined,
            undefined,
            undefined,
            'team.service.release.view'
          )
        ],
        'group'
      ),
      getItem(
        $t('订阅管理'),
        'provideSer',
        null,
        [
          getItem(
            <Link to="./approval">{$t('订阅审核')}</Link>,
            'approval',
            undefined,
            undefined,
            undefined,
            'team.service.subscription.view'
          ),
          getItem(
            <Link to="./subscriber">{$t('订阅方管理')}</Link>,
            'subscriber',
            undefined,
            undefined,
            undefined,
            'team.service.subscription.view'
          )
        ],
        'group'
      ),
      getItem(
        $t('管理'),
        'mng',
        null,
        [
          APP_MODE === 'pro'
            ? getItem(
                <Link to="./topology">{$t('调用拓扑图')}</Link>,
                'topology',
                undefined,
                undefined,
                undefined,
                'project.myAiService.topology.view'
              )
            : null,
          getItem(<Link to="./setting">{$t('设置')}</Link>, 'setting', undefined, undefined, undefined, ''),
          getItem(<Link to="./logs">{$t('日志')}</Link>, 'logs', undefined, undefined, undefined, '')
        ],
        'group'
      )
    ],
    [state.language]
  )

  const menuData = useMemo(() => {
    const filterMenu = (menu: MenuItemGroupType<MenuItemType>[]) => {
      const newMenu = cloneDeep(menu)
      return newMenu!.filter((m: MenuItemGroupType) => {
        if (m && m.children && m.children.length > 0) {
          m.children = m.children.filter((c) => {
            if (!c) return false
            return (c as MenuItemType & { access: string }).access
              ? checkPermission(
                  (c as MenuItemType & { access: string }).access as keyof (typeof PERMISSION_DEFINITION)[0]
                )
              : true
          })
        }
        return m.children && m.children.length > 0
      })
    }
    const filteredMenu = filterMenu(SYSTEM_PAGE_MENU_ITEMS as MenuItemGroupType<MenuItemType>[])
    const menu = (activeMenu ?? filteredMenu[0]?.children) ? filteredMenu[0]?.children?.[0]?.key : filteredMenu[0]?.key
    if (menu && currentUrl.split('/')[-1] !== menu) {
      navigateTo(`/service/${teamId}/aiInside/${serviceId}/${menu}`)
    }
    return filteredMenu || []
  }, [accessData, accessInit, SYSTEM_PAGE_MENU_ITEMS])

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    setActiveMenu(key)
  }

  useEffect(() => {
    // route edit and policy edit page don't need to show menu
    setShowMenu(
      !routeId &&
        !currentUrl.includes('route/create') &&
        !policyId &&
        !currentUrl.includes('servicepolicy/datamasking/create')
    )

    if (apiId !== undefined) {
      setActiveMenu('api')
    } else if (currentUrl.includes('servicepolicy')) {
      setActiveMenu('servicepolicy')
    } else if (serviceId !== currentUrl.split('/')[currentUrl.split('/').length - 1]) {
      setActiveMenu(currentUrl.split('/')[currentUrl.split('/').length - 1])
    } else {
      setActiveMenu('overview')
    }
  }, [currentUrl])

  useEffect(() => {
    if (accessData && checkPermission('team.service.router.view')) {
      getApiDefine()
    }
  }, [accessData])

  useEffect(() => {
    setBreadcrumb([
      {
        title: $t('服务'),
        onClick: () => navigateTo('/service/list')
      },
      {
        title: aiServiceInfo?.name || ''
      }
    ])
    if (activeMenu && serviceId === currentUrl.split('/')[currentUrl.split('/').length - 1]) {
      navigateTo(`/service/${teamId}/aiInside/${serviceId}/${activeMenu}`)
    }
  }, [activeMenu, state.language, aiServiceInfo])

  useEffect(() => {
    serviceId && getAiServiceInfo()
  }, [serviceId])
  // 创建一个回调函数
  const onSaveCallback = () => {
    getAiServiceInfo()
  }

  return (
    <>
      {showMenu ? (
        <InsidePage
          pageTitle={aiServiceInfo?.name || '-'}
          backUrl="/service/list"
          customBanner={<ServiceInfoCard serviceId={serviceId} teamId={teamId} />}
        >
          <div className="flex flex-1 h-full">
            <Menu
              onClick={onMenuClick}
              className="overflow-y-auto h-full"
              style={{ width: 220 }}
              selectedKeys={[activeMenu!]}
              mode="inline"
              items={menuData as unknown as ItemType<MenuItemType>[]}
            />
            <div
              className={` ${['setting', 'upstream'].indexOf(activeMenu!) !== -1 ? '' : ''} w-full h-full flex flex-1 flex-col overflow-auto bg-MAIN_BG  pt-[20px] pl-[20px] pb-PAGE_INSIDE_B `}
            >
              <Outlet context={{ onSaveComplete: onSaveCallback }} />
            </div>
          </div>
        </InsidePage>
      ) : (
        <Outlet />
      )}
    </>
  )
}
export default AiServiceInsidePage
