
import {  Tooltip } from "antd";
import  {  ReactElement, cloneElement, useEffect, useMemo, useState } from "react";
import { useGlobalContext } from "../../contexts/GlobalStateContext";
import { PERMISSION_DEFINITION } from "@common/const/permissions";
import { $t } from "@common/locales";
import { last } from "lodash-es";

type WithPermissionProps = {
    access?:string | string[]
    tooltip?:string
    children:ReactElement
    disabled?:boolean
    showDisabled?:boolean
}
// 权限控制的高阶组件
const WithPermission = ({access, tooltip, children,disabled, showDisabled = true}:WithPermissionProps) => {
  
    const [editAccess, setEditAccess] = useState<boolean>(access ? false:true)
    const {accessData,checkPermission,accessInit} = useGlobalContext()

    const lastAccess = useMemo(()=>{
      if(!access) return true
      return checkPermission(access as keyof typeof PERMISSION_DEFINITION[0])
  },[access, accessData,checkPermission,accessInit])

    useEffect(()=>{
      // 先判断权限，无论权限是否为true，如果disabled为true时则必须为ture
      access && setEditAccess(lastAccess) 
    },[lastAccess,disabled])



    return (
      <>
        {editAccess && !disabled && cloneElement(children)}
        {editAccess && disabled  && <Tooltip  title={tooltip}> 
            { cloneElement(children, {disabled:true})}
             </Tooltip>}
        {!editAccess && (children?.type?.displayName !== 'Button' && children?.type?.displayName !== 'Upload' && showDisabled ) && <Tooltip  title={tooltip ?? $t("暂无操作权限，请联系管理员分配。")}> 
            { cloneElement(children, {disabled:true})}
             </Tooltip>}
        
      </>
    );
    }
    
export default WithPermission