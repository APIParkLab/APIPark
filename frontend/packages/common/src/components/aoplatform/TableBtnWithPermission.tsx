
import { Button, Tooltip } from "antd"
import { useState, useMemo, useEffect } from "react"
import { useGlobalContext } from "@common/contexts/GlobalStateContext"
import { useNavigate } from "react-router-dom"

type TableBtnWithPermissionProps = {
    btnTitle:string
    access:string,
    tooltip?:string,
    disabled?:boolean,
    navigateTo?:string,
    onClick?:(args?:unknown)=>void
    className?:string
}
// 表格操作栏按钮，受权限控制
const TableBtnWithPermission = ({btnTitle, access, tooltip, disabled, navigateTo, onClick,className}:TableBtnWithPermissionProps) => {
  
    const [btnAccess, setBtnAccess] = useState<boolean>(false)
    const {accessData,checkPermission} = useGlobalContext()
    const navigate = useNavigate()
    const lastAccess = useMemo(()=>{
        if(!access) return true
        return checkPermission(access)
    },[access, accessData])

    useEffect(()=>{
        access ? setBtnAccess(lastAccess) :  setBtnAccess(true)
    },[])

    return (<>{
         !btnAccess || (disabled&&tooltip) ? 
        <Tooltip  placement="top" title={tooltip ?? `暂无${btnTitle}权限，请联系管理员分配。`}> 
            <Button type="text" disabled={true} className={`h-[22px] border-none p-0 flex items-center bg-transparent ${className}`} key="view" >{btnTitle}</Button>
         </Tooltip>
        :
        <Button type="text" disabled={disabled} className={`h-[22px] border-none p-0 flex items-center bg-transparent ${className} `} key="view" onClick={(e)=>{e.stopPropagation();navigateTo ? navigate(navigateTo) :onClick?.() }}>{btnTitle}</Button>

    }</>
    );
    }
    
export default TableBtnWithPermission