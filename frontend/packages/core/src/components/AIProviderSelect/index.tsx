import { STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { Select, Space, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface AIProvider {
  id: string
  name: string
  logo: string
  configured: boolean
  status: string
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
  onChange?: (value: string) => void
  style?: React.CSSProperties
}

const AIProviderSelect: React.FC<AIProviderSelectProps> = ({ value, onChange, style = { width: 200 } }) => {
  const { t } = useTranslation()
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [loading, setLoading] = useState(false)
  const { fetchData } = useFetch()

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true)
      try {
        const response = await fetchData<AIProviderResponse>('simple/ai/providers', { method: 'GET' })
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setProviders(data.providers)
        } else {
          message.error(msg || t('Failed to fetch AI providers'))
        }
      } catch (error) {
        message.error(t('Failed to fetch AI providers'))
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [])

  return (
    <Space className="flex items-center">
      <span>{t('AI 供应商')}:</span>
      <Select
        value={value}
        onChange={onChange}
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
