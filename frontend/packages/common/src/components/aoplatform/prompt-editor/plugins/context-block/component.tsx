import type { FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
// import {
//   RiAddLine,
// } from '@remixicon/react'
import { useSelectOrDelete, useTrigger } from '../../hooks'
import { UPDATE_DATASETS_EVENT_EMITTER } from '../../constants'
import type { Dataset } from './index'
import { DELETE_CONTEXT_BLOCK_COMMAND } from './index'
// import { File05, Folder } from '@/app/components/base/icons/src/vender/solid/files'
// import {
//   PortalToFollowElem,
//   PortalToFollowElemContent,
//   PortalToFollowElemTrigger,
// } from '@/app/components/base/portal-to-follow-elem'
import { useEventEmitterContextContext } from '@common/contexts/event-emitter'
import { $t } from '@common/locales'

type ContextBlockComponentProps = {
  nodeKey: string
  datasets?: Dataset[]
  onAddContext: () => void
  canNotAddContext?: boolean
}

const ContextBlockComponent: FC<ContextBlockComponentProps> = ({
  nodeKey,
  datasets = [],
  onAddContext,
  canNotAddContext,
}) => {
  const [ref, isSelected] = useSelectOrDelete(nodeKey, DELETE_CONTEXT_BLOCK_COMMAND)
  const [triggerRef, open, setOpen] = useTrigger()
  const { eventEmitter } = useEventEmitterContextContext()
  const [localDatasets, setLocalDatasets] = useState<Dataset[]>(datasets)

  eventEmitter?.useSubscription((v: any) => {
    if (v?.type === UPDATE_DATASETS_EVENT_EMITTER)
      setLocalDatasets(v.payload)
  })

  return (
    <div className={`
      group inline-flex items-center pl-1 pr-0.5 h-6 border border-transparent bg-[#F4F3FF] text-[#6938EF] rounded-[5px] hover:bg-[#EBE9FE]
      ${open ? 'bg-[#EBE9FE]' : 'bg-[#F4F3FF]'}
      ${isSelected && '!border-[#9B8AFB]'}
    `} ref={ref}>
      {/* <File05 className='mr-1 w-[14px] h-[14px]' /> */}
      <div className='mr-1 text-xs font-medium'>{$t('上下文')}</div>

    </div>
  )
}

export default ContextBlockComponent
