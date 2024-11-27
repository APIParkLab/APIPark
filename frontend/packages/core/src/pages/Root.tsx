import { useGlobalContext } from "@common/contexts/GlobalStateContext"
import { Navigate, useLocation } from "react-router-dom"

export default function Root() {
    const { state } = useGlobalContext()
    const location  = useLocation()
    console.log(state?.isAuthenticated ,location?.pathname)
    return (<>
    {
        state?.isAuthenticated && !location?.pathname
            ?<Navigate to={location?.pathname ?? state?.mainPage} />:<Navigate to="/login" />
    }</>
    )
}