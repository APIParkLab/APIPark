import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

export default function GlobalPolicyLayout() {
  const location = useLocation()
  const pathName = location.pathname
  const navigator = useNavigate()
  useEffect(() => {
    if (pathName === '/aiApis') {
      const queryParams = new URLSearchParams(location.search).toString()
      navigator(`/aiApis/list${queryParams ? `?${queryParams}` : ''}`)
    }
  }, [pathName])
  return <Outlet></Outlet>
}
