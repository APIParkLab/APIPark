import { Button, Drawer, DrawerProps, Space } from 'antd'
import WithPermission from './WithPermission'
import { useEffect, useState } from 'react'
import { $t } from '@common/locales'

export type DrawerWithFooterProps = DrawerProps & {
  onSubmit?: () => Promise<boolean | string> | undefined
  submitAccess?: string
  submitDisabled?: boolean
  onClose?: () => void
  showLastStep?: boolean
  onLastStep?: () => void
  notAutoClose?: boolean
  showOkBtn?: boolean
  extraBtn?: React.ReactNode
  okBtnTitle?: string
  cancelBtnTitle?: string
  width?: string
  footerLeft?: React.ReactNode
}
export function DrawerWithFooter(props: DrawerWithFooterProps) {
  const {
    children,
    title,
    placement = 'right',
    onClose,
    onSubmit,
    submitDisabled = false,
    okBtnTitle = $t('提交'),
    cancelBtnTitle,
    open,
    submitAccess,
    showLastStep,
    onLastStep,
    notAutoClose,
    showOkBtn = true,
    extraBtn,
    width = '60%',
    footerLeft
  } = props
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const handlerSubmit = () => {
    setSubmitLoading(true)
    onSubmit?.()
      ?.then(() => {
        !notAutoClose && onClose?.()
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }

  useEffect(() => {
    !open && setSubmitLoading(false)
  }, [open])
  return (
    <>
      <Drawer
        {...props}
        push={false}
        title={title}
        placement={placement}
        width={width}
        destroyOnClose={true}
        maskClosable={false}
        classNames={{ footer: 'text-right' }}
        footer={
          <div className={footerLeft ? 'flex justify-between items-center' : ''}>
            {footerLeft}
            <Space className="flex flex-row-reverse" style={{}}>
              {showOkBtn && (
                <WithPermission access={submitAccess}>
                  <Button onClick={handlerSubmit} type="primary" loading={submitLoading} disabled={submitDisabled}>
                    {okBtnTitle}
                  </Button>
                </WithPermission>
              )}
              {showLastStep && <Button onClick={onLastStep ?? onClose}> {$t('上一步')}</Button>}
              {extraBtn}
              <Button onClick={onClose}>{cancelBtnTitle ?? (showOkBtn ? $t('取消') : $t('关闭'))}</Button>
            </Space>
          </div>
        }
        onClose={onClose}
        open={open}
      >
        {children}
      </Drawer>
    </>
  )
}
