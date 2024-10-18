import { $t } from "@common/locales"

/* 本组件不在页面渲染，只是为了让i18next-scanner能找到从接口传递的、需要翻译的字段 , 此处的字段除非确认不在页面上渲染了,否则不应删除,容易导致翻译遗漏*/
export const TranslateWord = ()=>{
    return (
        <> 
            {$t('文件日志')}
            {$t('HTTP日志')}
            {$t('Kafka日志')}
            {$t('NSQ日志')}
            {$t('Syslog日志')}
            {$t('未分配')}
            {$t('超级管理员')}
            {$t('团队管理员')}
            {$t('运维管理员')}
            {$t('普通成员')}
            {$t('只读成员')}
            {$t('服务管理员')}
            {$t('服务开发者')}
            {$t('应用开发者')}
            {$t('应用管理员')}
            {$t('驱动名称')}
            {$t('请求失败数')}
            {$t('转发失败数')}
            {$t('作用范围')}
            {$t('添加条目')}
            {$t('添加地址')}
            {$t('文件名称')}
            {$t('存放目录')}
            {$t('日志分割周期')}
            {$t('过期时间')}
            {$t('单位：天')}
            {$t('输出格式')}
            {$t('格式化配置')}
            {$t('服务器地址')}
            {$t('Access日志')}
            {$t('NSQD地址列表')}
            {$t('鉴权Secret')}
            {$t('网络协议')}
            {$t('日志等级')}
            {$t('单行')}
            {$t('小时')}
            {$t('天')}
            {$t('未发布')}
            {$t('待发布')}
            {$t('单位：s，最小值：1')}
            {$t('上传文件')}
            {$t('替换文件')}
            {$t('是否放行')}
            {$t('监控')}
            {$t('必填')}
            {$t('字符非法，仅支持英文')}
            {$t('上传 OpenAPI 文档 (.json/.yaml)')}
            {$t('替换 OpenAPI 文档 (.json/.yaml)')}
            {$t('打开 OpenAPI YAML 编辑器')}
            {$t('无需审核：允许任何应用调用该服务')}
            {$t('人工审核：仅允许通过人工审核的应用调用该服务')}
            {$t('永久')}
            {$t('否')}
            {$t('是')}
            {$t('无需审核')}
            {$t('需要审核')}
        </>
    )
}