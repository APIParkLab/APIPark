export const objectToSearchParameters = (obj:Record<string, string | string[]|undefined>, prefix?:string)=>{
    const params = new URLSearchParams();
  
    for (const key in obj) {
        const value = obj[key];
        const prefixedKey = prefix ? `${prefix}[${key}]` : key;
  
        if(value === undefined) continue
        if (Array.isArray(value)) {
          // 如果值是数组，展开数组每个元素为单独的键值对
          value.forEach((item, index) => {
            params.append(`${prefixedKey}[${index}]`, item);
          });
        } else if (value !== null && typeof value === 'object') {
          // 如果值是对象，递归处理
          params.append(prefixedKey, JSON.stringify(value)); // 将嵌套对象转换为字符串
        } else {
          // 否则，直接添加键值对
          params.append(prefixedKey, value);
        }
    }
  
    return params;
}