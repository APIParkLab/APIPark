import { $t } from '@common/locales'
import { Select, Space, theme } from 'antd'
import React from 'react'

interface StatusFilterProps {
  value: string[]
  onChange: (value: string[]) => void
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const { token } = theme.useToken()

  const options = [
    { label: $t('正常'), value: 'normal', color: token.colorSuccess },
    { label: $t('超额'), value: 'exceeded', color: token.colorError },
    { label: $t('过期'), value: 'expired', color: token.colorWarning },
    { label: $t('停用'), value: 'disabled', color: token.colorTextDisabled },
    { label: $t('错误'), value: 'error', color: token.colorError }
  ]

  return (
    <Space>
      <span>{$t('状态')}:</span>
      <Select
        mode="multiple"
        value={value}
        onChange={onChange}
        style={{ width: 300 }}
        placeholder={$t('请选择状态')}
        allowClear
        options={options.map((option) => ({
          ...option,
          label: <span style={{ color: option.color }}>{option.label}</span>
        }))}
      />
    </Space>
  )
}

export default StatusFilter
