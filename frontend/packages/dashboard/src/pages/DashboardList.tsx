
import { useParams } from "react-router-dom"
import { RouterParams } from "@core/components/aoplatform/RenderRoutes"
import DashboardApiList from "./DashboardApiList"
import DashboardProjectList from "./DashboardProjectList"
import DashboardApplicationList from "./DashboardApplicationList"

export default function DashboardList(){
    const {dashboardType} = useParams<RouterParams>()
    
    return (
        <>
        {
            dashboardType === 'api' && <DashboardApiList />
        }
        {
            dashboardType === 'subscriber' && <DashboardProjectList />
        }
        {
            dashboardType === 'provider' && <DashboardApplicationList />
        }
        </>
    )
}