
import { Outlet, useParams } from "react-router-dom"
import { RouterParams } from "@core/components/aoplatform/RenderRoutes"
import { useEffect } from "react"
import { useGlobalContext } from "@common/contexts/GlobalStateContext"

export default function AiServiceOutlet(){
    const {teamId} = useParams<RouterParams>()
    const {getTeamAccessData,cleanTeamAccessData} = useGlobalContext()

    useEffect(()=>{
        teamId ? getTeamAccessData(teamId) : cleanTeamAccessData()
        return ()=>{
            cleanTeamAccessData()
        }
    },[teamId])


    return (<Outlet />)
}