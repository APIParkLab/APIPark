import { ServiceDetailType } from "@market/const/serviceHub/type"
import { Input, Button, Space, message } from 'antd'
import { $t } from "@common/locales"
import { RESPONSE_TIPS } from '@common/const/const'
import { downloadFile } from "@common/utils/download.ts"


const Integrate = ({ service }: { service: ServiceDetailType }) => {
  console.log('service', service);
  const stepClass = "leading-[20px] truncate font-bold items-center gap-[4px] mt-[15px]";
  const url = 'https://www.baidu.com';

  /**
   * Agent 平台地址
   */
  const agentAddress = '/cluster';
  /**
   * 消费者地址
   */
  const consumerAddress = '/consumer/list';
  /**
   * 复制代码
   */
  const copyURL = async (): Promise<void> => {
    await navigator.clipboard.writeText(url)
    message.success($t(RESPONSE_TIPS.copySuccess))
  }
  /**
   * 下载文件
   */
  const onDownload = () => {
    console.log('downloadFile');
    downloadFile({
      body: '',
      contentType: 'raw',
      filename: 'test_response',
      responseType: 'text',
      uri: ''
    })
  }
  return (
    <div>
      <div>{$t('支持把当前服务对接主流的 AI Agent平台，实现在 Agent 平台上快速、安全和合规地使用企业开放的 API 能力。')}</div>
      <div className='my-[10px]'>{$t('可按以下步骤进行对接：')}</div>
      <p className={stepClass}>{$t('步骤一：Agent 平台上创建自定义插件')}</p>
      <div className="my-[10px]">{$t('不同 Agent 平台的操作细节可查看')} <a href={agentAddress} target="_blank">{$t('《 Agent 对接手册》')}</a>。</div>
      <p className={stepClass}>{$t('步骤二：导入 API 文档数据')}</p>
      <div className='my-[10px]'>{$t('可通过以下 URL 或 下载 Json 文件，导入 API 文档数据到 Agent 平台中。')}</div>
      <div>
        <Space.Compact className="w-[500px]">
          <Input disabled defaultValue={url} />
          <Button type="primary" onClick={copyURL}>{$t('复制 URL')}</Button>
        </Space.Compact>
        <span className="text-[14px] font-bold mx-[30px]">OR</span> <Button onClick={onDownload}>{$t('下载 Json 文件')}</Button>
      </div>
      <p className={stepClass}>{$t('步骤三：配置 API 密钥')}</p>
      <div className='my-[10px]'>{$t('在')}<a href={consumerAddress} target="_blank"> {$t('消费者')} </a>{$t('菜单中，选择已通过本 API 服务申请的消费者，')}</div>
      <div className='my-[10px]'>{$t('把 "访问权限" 菜单下的密钥填入到 Agent 平台对应的插件密钥配置中。')}</div>
    </div>
  );
}
export default Integrate;