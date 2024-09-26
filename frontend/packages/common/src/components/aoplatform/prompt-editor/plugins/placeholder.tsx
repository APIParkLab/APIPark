import { $t } from '@common/locales'
import { memo } from 'react'

const Placeholder = ({
  compact,
  value
}: {
  compact?: boolean
  value?: string
  className?: string
}) => {

  return (
    <div 
    className={`absolute top-0 left-0 h-full w-full text-sm text-[#BBB] select-none pointer-events-none ${compact ? 'leading-5 text-[13px]' : 'leading-6 text-sm'}`}
    >
      {value || $t('AI 模型调用默认仅使用 Query 变量，可输入 “{” 增加新变量。')}
    </div>
  )
}

export default memo(Placeholder)
