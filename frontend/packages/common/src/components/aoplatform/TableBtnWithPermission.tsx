
import { Button, Tooltip } from "antd"
import { useState, useMemo, useEffect, useCallback } from "react"
import { useGlobalContext } from "@common/contexts/GlobalStateContext"
import { useNavigate } from "react-router-dom"
import { PERMISSION_DEFINITION } from "@common/const/permissions"
import { Icon } from "@iconify/react/dist/iconify.js"
import { $t } from "@common/locales"

type TableBtnWithPermissionProps = {
  btnTitle: string
  access?: keyof typeof PERMISSION_DEFINITION[0],
  tooltip?: string,
  disabled?: boolean,
  navigateTo?: string,
  onClick?: (args?: unknown) => void
  className?: string
  btnType: string
}

const TableIconName = {
  'add': 'ic:baseline-add',
  'edit': 'ic:baseline-edit',
  'delete': 'ic:baseline-delete',
  'remove': 'ic:baseline-minus',
  'copy': 'ic:baseline-file-copy',
  'view': 'ic:baseline-remove-red-eye',
  'publish': 'ic:baseline-publish',
  'approval': 'ic:baseline-approval',
  'stop': 'ic:baseline-stop-circle',
  'online': 'ic:baseline-check-circle',
  'cancel': 'ic:baseline-cancel-schedule-send',
  'refresh': 'ic:baseline-refresh',
  'logs': 'hugeicons:google-doc'
}
// 表格操作栏按钮，受权限控制
const TableBtnWithPermission = ({ btnTitle, access, tooltip, disabled, navigateTo, onClick, className, btnType }: TableBtnWithPermissionProps) => {

  const [btnAccess, setBtnAccess] = useState<boolean>(false)
  const [btnStatus, setBtnStatus] = useState<boolean>(false)
  const [closeToolTip, setCloseToolTip] = useState<boolean>(false)
  const { accessData, checkPermission, accessInit } = useGlobalContext()
  const navigate = useNavigate()
  const lastAccess = useMemo(() => {
    if (!accessInit) return false
    if (!access) return true
    return checkPermission(access)
  }, [access, accessData, checkPermission, accessInit])

  useEffect(() => {
    access ? setBtnAccess(lastAccess) : setBtnAccess(true)
  }, [access, lastAccess])


  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setTimeout(() => {
      setBtnStatus(false)
      setCloseToolTip(true)
    })
    
    navigateTo ? navigate(navigateTo) : onClick?.()
  }, [navigateTo, navigate, onClick])
  const changeTooltipStatus = (open: boolean) => {
    setBtnStatus(open)
    if (closeToolTip) {
      setBtnStatus(false)
      setCloseToolTip(false)
    }
  }
  return (<>{
    !btnAccess || (disabled && tooltip) ?
      <Tooltip placement="top" title={tooltip ?? $t('暂无(0)权限，请联系管理员分配。', [$t(btnTitle).toLowerCase()])}>
        <Button type="text" disabled={true} className={`h-[22px] border-none p-0 flex items-center bg-transparent ${className}`} key={btnType} icon={<Icon icon={TableIconName[btnType as keyof typeof TableIconName]} width="18" height="18" />} >{ }</Button>
      </Tooltip>
      :
      <Tooltip placement="top" title={$t(btnTitle)} trigger='hover' open={btnStatus} onOpenChange={changeTooltipStatus}>
        <Button type="text" disabled={disabled} className={`h-[22px] border-none p-0 flex items-center bg-transparent ${className} `} key={btnType} icon={<Icon icon={TableIconName[btnType as keyof typeof TableIconName]} width="18" height="18" />} onClick={handleClick}>{ }</Button>
      </Tooltip>

  }</>
  );
}

export default TableBtnWithPermission