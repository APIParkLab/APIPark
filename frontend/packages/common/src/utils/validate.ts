
export const validateUrlSlash = (_, value) => {
    if (value && value.includes('//')) {
      return Promise.reject(new Error('暂不支持带有双斜杠//的url'));
    }
    return Promise.resolve();
  };