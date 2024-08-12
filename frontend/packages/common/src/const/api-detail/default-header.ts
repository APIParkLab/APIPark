type DEFAULT_HEADER_OBJ_TYPE = {
  [key: string]: { description: string; value: string };
  // 索引签名接受任意字符串类型的参数，并返回具有指定属性的对象
};
const DEFAULT_HEADER_OBJ: DEFAULT_HEADER_OBJ_TYPE = {
  // 'Authorization-Type': {
  //   description: '鉴权方式，值为：apikey',
  //   value: 'apikey'
  // },
  'X-APISpace-Token': {
    description: '鉴权私钥，可登陆后在管理后台的[访问控制]页面查看',
    value: ''
  }
}

export default DEFAULT_HEADER_OBJ