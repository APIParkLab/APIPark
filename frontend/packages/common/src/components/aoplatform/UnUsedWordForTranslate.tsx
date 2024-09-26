import { $t } from "@common/locales"

/* 本组件不在页面渲染，只是为了让i18next-scanner能找到从接口传递的、需要翻译的字段 */
export const TranslateWord = ()=>{
    return (
        <>
            {$t('上传文件')}
            {$t('替换文件')}
            {$t('是否放行')}
            {$t('监控')}
            {$t('必填')}
            {$t('字符非法，仅支持英文')}
        </>
    )
}