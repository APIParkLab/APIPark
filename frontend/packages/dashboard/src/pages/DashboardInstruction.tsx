import WithPermission from '@common/components/aoplatform/WithPermission'
import { $t } from '@common/locales'

export default function DashboardInstruction({
  showClusterIns,
  showMonitorIns
}: {
  showClusterIns: boolean
  showMonitorIns: boolean
}) {
  return (
    <div className="h-full w-full overflow-auto">
      <div className=" m-auto mt-[10%] flex flex-col items-center  p-[20px]">
        <p className="text-[20px] font-medium leading-[32px] text-MAIN_TEXT">{$t('集群配置并开启监控')}</p>
        <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT mt-[12px]">
          {$t('监控功能用于辅助管理集群内信息，请配置集群、设置监控信息后查看当前集群监控情况；')}
        </p>
        {/* <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT mt-[8px]">更多配置问题，请点击帮助中心
                    {/* <a>查看更多</a> *
                    </p> */}
        <div className="flex mt-[28px] gap-[20px] w-full justify-center items-center">
          {showClusterIns && (
            <div className="h-[208px] w-[50%] max-w-[384px] flex flex-col items-center py-[32px] px-[24px] gap-[16px] rounded-DEFAULT bg-MENU_BG mr-[24px] justify-around">
              <p className="text-[20px] font-medium leading-[32px] text-MAIN_TEXT">{$t('集群配置')}</p>
              <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT">
                {$t('配置集群地址，以确保监控系统能够正确识别和连接到集群')}
              </p>
              <p>
                <WithPermission access="system.settings.api_gateway.view">
                  <a href="/cluster" target="_blank">
                    {$t('配置集群信息')}
                  </a>
                </WithPermission>
              </p>
            </div>
          )}
          {showMonitorIns && (
            <div className="h-[208px] w-[50%] max-w-[384px] flex flex-col items-center py-[32px] px-[24px] gap-[16px] rounded-DEFAULT bg-MENU_BG  justify-around">
              <p className="text-[20px] font-medium leading-[32px] text-MAIN_TEXT">{$t('监控设置')}</p>
              <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT">
                {$t('设置监控报表的数据来源，设置完成之后即可获得详细的API调用统计图表。')}
              </p>
              <p>
                <WithPermission access="system.settings.data_source.view">
                  <a href="/datasourcing" target="_blank">
                    {$t('配置监控信息')}
                  </a>
                </WithPermission>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
