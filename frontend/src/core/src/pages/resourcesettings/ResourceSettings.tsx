import InsidePage from '@common/components/aoplatform/InsidePage'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { DynamicMenuItem } from '@common/const/type'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { getItem } from '@common/utils/navigation'
import { RouterParams } from '@core/components/aoplatform/RenderRoutes'
import { Menu, MenuProps, Skeleton, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom'

const LogSettings = () => {
  const { moduleId } = useParams<RouterParams>()
  const [menuItems, setMenuItems] = useState<MenuProps['items']>([])
  const [activeMenu, setActiveMenu] = useState<string>()
  const { fetchData } = useFetch()
  const [loading, setLoading] = useState<boolean>(true)
  const navigateTo = useNavigate()
  const { state } = useGlobalContext()

  const getDynamicMenuList = () => {
    setLoading(true)
    fetchData<BasicResponse<{ dynamics: DynamicMenuItem[] }>>(`simple/dynamics/resource`, { method: 'GET' })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setMenuItems(data.dynamics)
          if (!activeMenu || activeMenu.length === 0) {
            navigateTo(`/resourcesettings/template/${data.dynamics[0].name}`)
          }
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .finally(() => setLoading(false))
  }

  const menuData = useMemo(() => {
    const newMenu = menuItems?.map((x: DynamicMenuItem) => {
      return getItem(
        <Link to={`template/${x.name}`}>{$t(x.title)}</Link>,
        x.name,
        undefined,
        undefined,
        undefined,
        'system.settings.log_configuration.view'
      )
    })
    return newMenu
  }, [state.language, menuItems])

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    setActiveMenu(key)
  }

  useEffect(() => {
    setActiveMenu(moduleId)
  }, [moduleId])

  useEffect(() => {
    setLoading(true)
    getDynamicMenuList()
  }, [])

  return (
    <>
      <Skeleton className="m-btnbase w-calc-100vw-minus-padding-r" active loading={loading}>
        <InsidePage pageTitle={$t('资源配置')}>
          <div className="flex h-full">
            <Menu
              className="overflow-y-auto h-full"
              selectedKeys={[activeMenu || '']}
              onClick={onMenuClick}
              style={{ width: 220 }}
              mode="inline"
              items={menuData}
            />
            <div className={`flex overflow-auto flex-col flex-1 w-full h-full bg-MAIN_BG`}>
              <Outlet />
            </div>
          </div>
        </InsidePage>
      </Skeleton>
    </>
  )
}

export default LogSettings
