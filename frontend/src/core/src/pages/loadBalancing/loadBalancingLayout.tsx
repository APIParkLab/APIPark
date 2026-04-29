import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

export default function LoadBalancingLayout() {
  const location = useLocation()
  const pathName = location.pathname
  const navigator = useNavigate()
  
  useEffect(() => {
    if (pathName === '/loadBalancing') {
      const queryParams = new URLSearchParams(location.search).toString()
      navigator(`/loadBalancing/list${queryParams ? `?${queryParams}` : ''}`)
    }
  }, [pathName])
  return <Outlet></Outlet>
}
