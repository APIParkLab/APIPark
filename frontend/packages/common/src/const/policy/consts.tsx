import { codeBoxLanguagesType } from "@common/components/postcat/api/Codebox";

export const MatchRules = [
    { value: 'inner', label: '数据格式' },
    { value: 'keyword', label: '关键字' },
    { value: 'regex', label: '正则表达式' },
    { value: 'json_path', label: 'JSON Path' }
  ];
  
  
  export const DataFormatOptions = [
    { label: '姓名', value: 'name' },
    { label: '手机号', value: 'phone' },
    { label: '身份证号', value: 'id-card' },
    { label: '银行卡号', value: 'bank-card' },
    { label: '日期', value: 'date' },
    { label: '金额', value: 'amount' }
  ];
  
  
  export const DataMaskBaseOptionOptions = [
    { value: 'partial-display', label: '局部显示' },
    { value: 'partial-masking', label: '局部遮蔽' },
    { value: 'truncation', label: '截取' },
    { value: 'replacement', label: '替换' },
  ];
  
  
  export const DataMaskOrderOptions = [
    ...DataMaskBaseOptionOptions,
    { label: '乱序', value: 'shuffling' }
  ]
  
  
  export const DataMaskReplaceStrOptions = [
    { value: 'random', label: '随机字符串' },
    { value: 'custom', label: '自定义字符串' }
  ];
  
  
export const PolicyOptions = [
    {label:'数据脱敏',value:'data-masking'},
]

export const StrategyStatusEnum = {
    'update':'待更新',
    'online':'已发布',
    'offline':'未发布',
    "delete":'待删除',
  }
  
  export const StrategyStatusColorClass = {
    "online":'text-status_success',
    "update":'text-status_pending',
    "offline":'text-status_fail',
    "delete":'text-status_offline',
  }

  export const contentTypeToLanguageMap: Record<string, codeBoxLanguagesType> = {
    // JSON
    "application/json": "json",
  
    // XML
    "application/xml": "xml",
    "text/xml": "xml",
  
    // HTML
    "text/html": "html",
  
    // Plain text
    "text/plain": "plaintext",
  
    // JavaScript
    "application/javascript": "javascript",
    "text/javascript": "javascript",
  
    // CSS
    "text/css": "css",
  
    // YAML
    "application/x-yaml": "yaml",
    "text/yaml": "yaml",
  
    // Others (fallback)
    "*/*": "plaintext", // 任意类型默认处理为普通文本
  };
  
  