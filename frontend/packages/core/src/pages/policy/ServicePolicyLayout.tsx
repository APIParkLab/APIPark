import { useBreadcrumb } from '@common/contexts/BreadcrumbContext'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { $t } from '@common/locales'

export default function ServicePolicyLayout() {
  const location = useLocation()
  const pathName = location.pathname
  const navigator = useNavigate()
  const { setBreadcrumb } = useBreadcrumb()
  useEffect(() => {
    const tmpPath = pathName.split('/')
    if (tmpPath[tmpPath.length - 1] === 'servicepolicy') {
      setBreadcrumb([
        {
          title: $t('服务'),
          onClick: () => navigator('/service/list')
        },
        {
          title: $t('服务策略')
        }
      ])
      navigator('datamasking/list')
    }
  }, [pathName])
  return <Outlet></Outlet>
}
