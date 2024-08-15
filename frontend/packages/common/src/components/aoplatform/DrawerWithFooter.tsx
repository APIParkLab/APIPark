
import { Button, Drawer, DrawerProps, Space } from "antd";
import WithPermission from "./WithPermission";
import { useEffect, useState } from "react";

export type DrawerWithFooterProps = DrawerProps & {
    onSubmit?: () => Promise<boolean|string>|undefined
    submitAccess?: string
    submitDisabled?:boolean
    onClose?:()=>void
    showLastStep?:boolean
    onLastStep?:()=>void
    notAutoClose?:boolean
    showOkBtn?:boolean
    extraBtn?:React.ReactNode
    okBtnTitle?:string
    cancelBtnTitle?:string
}
export function DrawerWithFooter(props:DrawerWithFooterProps){
    const {children,title,placement='right',onClose,onSubmit,submitDisabled = false,okBtnTitle='提交',cancelBtnTitle,open,submitAccess,showLastStep,onLastStep,notAutoClose,showOkBtn=true,extraBtn} = props
    const [submitLoading, setSubmitLoading] = useState<boolean>(false)
    const handlerSubmit = ()=>{
      setSubmitLoading(true)
       onSubmit?.()?.then(()=>{!notAutoClose && onClose?.()}).finally(()=>{setSubmitLoading(false)})
    }

    useEffect(()=>{!open && setSubmitLoading(false)},[open])
    return (<>
        <Drawer
          {...props}
          push={false}
          title={title}
          placement={placement}
          width="60%"
          destroyOnClose={true}
          maskClosable={false}
          classNames={
            {footer:'text-right'}
          }
          footer={
            <Space className="flex flex-end" style={{justifyContent:'flex-end'}}> 
                {showOkBtn && <WithPermission access={submitAccess}>
                    <Button onClick={handlerSubmit} type="primary" loading={submitLoading} disabled={submitDisabled}>
                  {okBtnTitle}
                    </Button>
                </WithPermission>}
                { showLastStep && <Button onClick={onLastStep ?? onClose}>上一步</Button>}
                { extraBtn }
                <Button onClick={onClose}>{cancelBtnTitle ?? (showOkBtn ? '取消':'关闭')}</Button>
            </Space>
          }
          onClose={onClose}
          open={open}
        >
          {children}
        </Drawer>
        </>)
}