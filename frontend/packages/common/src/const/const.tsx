import { $t } from "@common/locales"

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
    ['workspace',['tenantManagement','service','team','guide']],
    ['my',['tenantManagement','service','team']],
    ['mainPage',['dashboard','systemrunning']],
    ['operationCenter',['member','user','role','servicecategories']],
    ['organization',['member','user','role']],
    ['serviceHubSetting',['servicecategories']],
    ['maintenanceCenter',['dashboardsetting','cluster','cert','logsettings','resourcesettings','openapi']
  ]])
  
    
  export const COLUMNS_TITLE  = {
    operate : $t('操作')
  }
  
  export const VALIDATE_MESSAGE = {
    required: $t('必填项'),
    email:$t('不是有效邮箱地址')
  }

  export const PLACEHOLDER = {
    input:$t('请输入'),
    select:$t('请选择'),
    startWithAlphabet:$t('英文数字下划线任意一种，首字母必须为英文'),
    specialStartWithAlphabet:$t('支持字母开头、英文数字中横线下划线组合')
  }

  export const FORM_ERROR_TIPS = {
    refuseOpinion: $t('选择拒绝时，审批意见为必填'),
    clusterTest:$t('无法连接集群，请检查集群地址是否正确或防火墙配置'),
    
  }

  export const RESPONSE_TIPS = {
    success: $t('操作成功'),
    error: $t('操作失败'),
    operating:$t('正在操作'),
    loading:$t('正在加载数据'),
    dataError:$t('获取数据失败'),
    loginSuccess: $t('登录成功'),
    logoutSuccess:$t('退出成功，将跳转至登录页'),
    refuseOpinion: $t('未填写审核意见'),
    copySuccess:$t('复制成功'),
    copyError:$t('复制失败,请手动复制')
  }

  export const DELETE_TIPS = {
    default:$t('该数据删除后将无法找回，请确认是否删除？')
  }