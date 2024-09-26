import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelectOrDelete } from '../../hooks'
import { DELETE_QUERY_BLOCK_COMMAND } from './index'
import { $t } from '@common/locales'
// import { UserEdit02 } from '@/app/components/base/icons/src/vender/solid/users'

type QueryBlockComponentProps = {
  nodeKey: string
}

const QueryBlockComponent: FC<QueryBlockComponentProps> = ({
  nodeKey,
}) => {
  const [ref, isSelected] = useSelectOrDelete(nodeKey, DELETE_QUERY_BLOCK_COMMAND)

  return (
    <div
      className={`
        inline-flex items-center pl-1 pr-0.5 h-6 bg-[#FFF6ED] border border-transparent rounded-[5px] hover:bg-[#FFEAD5]
        ${isSelected && '!border-[#FD853A]'}
      `}
      ref={ref}
    >
      {/* <UserEdit02 className='mr-1 w-[14px] h-[14px] text-[#FD853A]' /> */}
      <div className='text-xs font-medium text-[#EC4A0A] opacity-60'>{'{{'}</div>
      <div className='text-xs font-medium text-[#EC4A0A]'>{$t('查询内容')}</div>
      <div className='text-xs font-medium text-[#EC4A0A] opacity-60'>{'}}'}</div>
    </div>
  )
}

export default QueryBlockComponent
