import { $t } from "@common/locales";

export const validateUrlSlash = (_, value) => {
    if (value && value.includes('//')) {
      return Promise.reject(new Error($t('暂不支持带有双斜杠//的url')));
    }
    return Promise.resolve();
  };

  export const validateIPorCIDR = (rule, value) => {
    if (!value) {
      return Promise.resolve();
    }
  
    const lines = value.split('\n');
    const ipCidrRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
  
    for (const line of lines) {
      if (line && !ipCidrRegex.test(line.trim())) {
        return Promise.reject($t('输入的IP或CIDR不符合格式'));
      }
    }
  
    return Promise.resolve();
  };

  
  export const validateApiPath = (rule, value) => {
    if (!value) {
      return Promise.resolve();
    }

    const invalidCharsRegex = /[^a-zA-Z0-9\-\/\*]/;
    const validPathRegex = /^(\/?\*?\/?[a-zA-Z0-9\-\/\*]*)$/;
  
    if (value && (invalidCharsRegex.test(value.trim()) || !validPathRegex.test(value.trim()))) {
      return Promise.reject($t('请正确输入路径，如/usr/*或*/usr/*'));
    }
    
    return Promise.resolve();
  };