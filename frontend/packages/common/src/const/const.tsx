export type BasicResponse<T> = {
    code:number
    data:T
    msg:string
}

export const STATUS_CODE = {
    SUCCESS:0,
    UNANTHORIZED:401,
    FORBIDDEN:403
}

export const STATUS_COLOR = {
    'done':'text-[#03a9f4]',
    'error':'text-[#ff3b30]'
}


// avoid changing route within ths same category
export const routerKeyMap = new Map<string, string[]|string>([
    ['workspace',['consumer','service','team','guide']],
    ['my',['consumer','service','team']],
    ['mainPage',['dashboard','systemrunning']],
    ['operationCenter',['member','user','role','common']],
    ['organization',['member','user','role']],
    ['serviceHubSetting',['common']],
    ['maintenanceCenter',['aisetting','datasourcing','cluster','cert','logsettings','resourcesettings','openapi']
  ]])
  

    
  export const COLUMNS_TITLE  = {
    operate : ''
  }
  
  export const VALIDATE_MESSAGE = {
    required: ('必填项'),
    email:('不是有效邮箱地址')
  }

  export const PLACEHOLDER = {
    input:('请输入'),
    select:('请选择'),
    startWithAlphabet:('英文数字下划线任意一种，首字母必须为英文'),
    specialStartWithAlphabet:('支持字母开头、英文数字中横线下划线组合'),
    onlyAlphabet:('字符非法，仅支持英文'),
  }

  export const FORM_ERROR_TIPS = {
    refuseOpinion: ('选择拒绝时，审核意见为必填'),
    clusterTest:('无法连接集群，请检查集群地址是否正确或防火墙配置'),
    
  }

  export const RESPONSE_TIPS = {
    success: ('操作成功'),
    error: ('操作失败'),
    operating:('正在操作'),
    loading:('正在加载数据'),
    dataError:('获取数据失败'),
    loginSuccess: ('登录成功'),
    logoutSuccess:('退出成功，将跳转至登录页'),
    refuseOpinion: ('未填写审核意见'),
    copySuccess:('复制成功'),
    copyError:('复制失败,请手动复制')
  }

  export const DELETE_TIPS = {
    default:('该数据删除后将无法找回，请确认是否删除？')
  }
  
  export const DATA_SHOW_TYPE_OPTIONS = [
    {label:'列表', value:'list'},
    {label:'块', value:'block'},
  ]