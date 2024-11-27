import { useGlobalContext } from "@common/contexts/GlobalStateContext"
import { Navigate, useLocation } from "react-router-dom"

export default function Root() {
    const { state } = useGlobalContext()
    const location  = useLocation()
    return (<>
    {
        state?.isAuthenticated && !location?.pathname
            ?<Navigate to={location?.pathname ?? state?.mainPage} />:<Navigate to="/login" />
    }</>
    )
}