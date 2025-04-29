import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

export default function ServicePolicyLayout() {
  const location = useLocation()
  const pathName = location.pathname
  const navigator = useNavigate()
  useEffect(() => {
    const tmpPath = pathName.split('/')
    if (tmpPath[tmpPath.length - 1] === 'servicepolicy') {
      navigator('datamasking/list')
    }
  }, [pathName])
  return <Outlet></Outlet>
}
