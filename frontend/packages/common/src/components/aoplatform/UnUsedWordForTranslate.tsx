import { $t } from "@common/locales"

/* 本组件不在页面渲染，只是为了让i18next-scanner能找到从接口传递的、需要翻译的字段 */
export const TranslateWord = ()=>{
    return (
        <>
            {$t('文件日志')}
            {$t('HTTP日志')}
            {$t('Kafka文件日志')}
            {$t('NSQ文件日志')}
            {$t('Syslog文件日志')}
            {$t('文件日志')}
            {$t('文件日志')}
            {$t('文件日志')}
        </>
    )
}