import type { FC } from 'react'
import { useState } from 'react'
// import {
//   RiMoreFill,
// } from '@remixicon/react'
import { useSelectOrDelete, useTrigger } from '../../hooks'
import { UPDATE_HISTORY_EVENT_EMITTER } from '../../constants'
import type { RoleName } from './index'
import { DELETE_HISTORY_BLOCK_COMMAND } from './index'
// import { MessageClockCircle } from '@/app/components/base/icons/src/vender/solid/general'
// import {
//   PortalToFollowElem,
//   PortalToFollowElemContent,
//   PortalToFollowElemTrigger,
// } from '@/app/components/base/portal-to-follow-elem'
import { useEventEmitterContextContext } from '@common/contexts/EventEmitterContext'
import { $t } from '@common/locales'

type HistoryBlockComponentProps = {
  nodeKey: string
  roleName?: RoleName
  onEditRole: () => void
}

const HistoryBlockComponent: FC<HistoryBlockComponentProps> = ({
  nodeKey,
  roleName = { user: '', assistant: '' },
  onEditRole
}) => {
  const [ref, isSelected] = useSelectOrDelete(nodeKey, DELETE_HISTORY_BLOCK_COMMAND)
  const [triggerRef, open, setOpen] = useTrigger()
  const { eventEmitter } = useEventEmitterContextContext()
  const [localRoleName, setLocalRoleName] = useState<RoleName>(roleName)

  eventEmitter?.useSubscription((v: any) => {
    if (v?.type === UPDATE_HISTORY_EVENT_EMITTER) setLocalRoleName(v.payload)
  })

  return (
    <div
      className={`
      group inline-flex items-center pl-1 pr-0.5 h-6 border border-transparent text-[#DD2590] rounded-[5px] hover:bg-[#FCE7F6]
      ${open ? 'bg-[#FCE7F6]' : 'bg-[#FDF2FA]'}
      ${isSelected && '!border-[#F670C7]'}
    `}
      ref={ref}
    >
      {/* <MessageClockCircle className='mr-1 w-[14px] h-[14px]' /> */}
      <div className="mr-1 text-xs font-medium">{$t('会话历史')}</div>
    </div>
  )
}

export default HistoryBlockComponent
