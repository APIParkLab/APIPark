import { STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { ModelDetailData } from '@core/pages/aiSetting/types'
import { Select, Space, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface AIProvider extends ModelDetailData {
  default_config: string
  backupName: string
  backupModel: string
}

interface AIProviderResponse {
  code: number
  msg: string
  data: {
    providers: AIProvider[]
    backup: string
  }
  msg_zh: string
}

interface AIProviderSelectProps {
  value?: string
  onChange?: (value: string, provider: AIProvider) => void
  style?: React.CSSProperties
}

const AIProviderSelect: React.FC<AIProviderSelectProps> = ({ value, onChange, style = { width: 200 } }) => {
  const { t } = useTranslation()
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [loading, setLoading] = useState(false)
  const { fetchData } = useFetch()

  useEffect(() => {
    let isMounted = true
    const fetchProviders = async () => {
      if (isMounted) setLoading(true)
      try {
        const endpoint = 'simple/ai/providers/configured'
        const response = await fetchData<AIProviderResponse>(endpoint, { method: 'GET' })
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          isMounted &&
            setProviders(
              data.providers.map((val) => ({
                ...val,
                backupName: data.backup?.name,
                backupModel: data.backup?.model?.name
              }))
            )
          if (!data.providers?.length) return
          const selectedProvider: AIProvider = value ? data.providers.find((p) => p.id === value) : data.providers[0]
          onChange?.(selectedProvider.id, selectedProvider)
        } else {
          message.error(msg || t('Failed to fetch AI providers'))
        }
      } catch (error) {
        message.error(t('Failed to fetch AI providers'))
      } finally {
        isMounted && setLoading(false)
      }
    }

    fetchProviders()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Space className="flex items-center">
      <span>{t('AI 供应商')}:</span>
      <Select
        value={value}
        onChange={(selectedValue) => {
          const selectedProvider = providers.find((p) => p.id === selectedValue)
          onChange?.(selectedValue, selectedProvider as AIProvider)
        }}
        style={style}
        loading={loading}
        showSearch
        filterOption={(input, option) => {
          const label = option?.label as React.ReactElement
          const nameSpan = label.props.children[1] as React.ReactElement
          return nameSpan.props.children.toLowerCase().includes(input.toLowerCase())
        }}
        options={providers.map((provider) => ({
          label: (
            <Space className="flex items-center">
              <span
                className="flex items-center h-[20px] w-[20px]"
                dangerouslySetInnerHTML={{ __html: provider.logo }}
              ></span>
              <span>{provider.name}</span>
            </Space>
          ),
          value: provider.id
        }))}
      />
    </Space>
  )
}

export default AIProviderSelect
