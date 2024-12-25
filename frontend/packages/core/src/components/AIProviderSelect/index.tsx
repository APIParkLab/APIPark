import React from 'react';
import { Select, Space } from 'antd';
import { useTranslation } from 'react-i18next';

export interface AIProviderOption {
  label: string;
  value: string;
}

interface AIProviderSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
  options?: AIProviderOption[];
}

const defaultOptions: AIProviderOption[] = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic', value: 'anthropic' }
];

const AIProviderSelect: React.FC<AIProviderSelectProps> = ({
  value,
  onChange,
  style = { width: 200 },
  options = defaultOptions
}) => {
  const { t } = useTranslation();

  return (
    <Space className="flex items-center">
      <span>{t('AI 供应商')}:</span>
      <Select
        value={value}
        onChange={onChange}
        style={style}
        options={options}
      />
    </Space>
  );
};

export default AIProviderSelect;
