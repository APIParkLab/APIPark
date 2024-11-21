import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function GlobalPolicyLayout(){
    const location = useLocation()
    const pathName = location.pathname
    const navigator = useNavigate()
    useEffect(()=>{
        if(pathName === '/globalpolicy'){
            navigator('/globalpolicy/datamasking/list')
        }
    },[pathName])
    return (<Outlet></Outlet>)
}