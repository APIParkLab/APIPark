
import {  Tooltip } from "antd";
import  {  ReactElement, cloneElement, useEffect, useMemo, useState } from "react";
import { useGlobalContext } from "../../contexts/GlobalStateContext";
import { PERMISSION_DEFINITION } from "@common/const/permissions";

type WithPermissionProps = {
    access?:string | string[]
    tooltip?:string
    children:ReactElement
    disabled?:boolean
}
// 权限控制的高阶组件
const WithPermission = ({access, tooltip, children,disabled}:WithPermissionProps) => {
  
    const [editAccess, setEditAccess] = useState<boolean>(access ? false:true)
    const {accessData,checkPermission} = useGlobalContext()

    const lastAccess = useMemo(()=>{
      if(!access) return true
      return checkPermission(access as keyof typeof PERMISSION_DEFINITION[0])
  },[access, accessData])

    useEffect(()=>{
      // 先判断权限，无论权限是否为true，如果disabled为true时则必须为ture
      access && setEditAccess(lastAccess) 
      disabled && setEditAccess(false)
    },[lastAccess,disabled])

    return (
      <>
        {editAccess ? cloneElement(children): 
        <Tooltip  title={tooltip ?? "暂无操作权限，请联系管理员分配。"}> 
          { cloneElement(children, {disabled:true})}
           </Tooltip>
        }
      </>
    );
    }
    
export default WithPermission