import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { RouterParams } from '@core/components/aoplatform/RenderRoutes'
import { useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'

export default function SystemOutlet() {
  const { teamId } = useParams<RouterParams>()
  const { getTeamAccessData, cleanTeamAccessData } = useGlobalContext()

  useEffect(() => {
    teamId ? getTeamAccessData(teamId) : cleanTeamAccessData()
    return () => {
      cleanTeamAccessData()
    }
  }, [teamId])

  return <Outlet />
}
