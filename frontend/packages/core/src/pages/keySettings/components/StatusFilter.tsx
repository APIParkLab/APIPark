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
    { label: $t('Normal'), value: 'normal', color: token.colorSuccess },
    { label: $t('Exceeded'), value: 'exceeded', color: token.colorError },
    { label: $t('Expired'), value: 'expired', color: token.colorWarning },
    { label: $t('Disabled'), value: 'disabled', color: token.colorTextDisabled },
    { label: $t('Error'), value: 'error', color: token.colorError }
  ]

  return (
    <Space>
      <span>{$t('Status')}:</span>
      <Select
        mode="multiple"
        value={value}
        onChange={onChange}
        style={{ width: 300 }}
        placeholder={$t('Filter by status')}
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
