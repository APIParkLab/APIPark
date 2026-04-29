import WithPermission from '@common/components/aoplatform/WithPermission'
import { useBreadcrumb } from '@common/contexts/BreadcrumbContext'
import { $t } from '@common/locales'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function LogSettingsInstruction() {
  const { setBreadcrumb } = useBreadcrumb()

  useEffect(() => {
    setBreadcrumb([{ title: $t('日志配置') }])
  }, [])
  return (
    <div className="overflow-auto w-full h-full">
      <div className=" m-auto mt-[10%] flex flex-col items-center p-[20px]">
        <p className="text-[20px] font-medium leading-[32px] text-MAIN_TEXT">
          集群配置并开启日志插件
        </p>
        <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT mt-[12px]">
          日志插件用于记录和管理网关的运行日志。在启用日志插件之前，请确保已经配置了集群。配置完成后，可以利用日志插件来监控和分析各项操作日志，以提高系统的可观察性和故障排查能力。
        </p>
        {/* <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT mt-[8px]">更多配置及关联问题，请点击帮助中心
            {/* <a>查看更多</a> *
            </p> */}
        <div className="flex mt-[28px]">
          <div className="h-[208px] w-[384px] flex flex-col items-center py-[32px] px-[24px] gap-[16px] rounded-DEFAULT bg-MENU_BG mr-[24px]">
            <p className="text-[20px] font-medium leading-[32px] text-MAIN_TEXT">环境配置</p>
            <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT">
              新增集群的地址、名称、描述和其他相关属性，以确保插件能够正确识别和连接到集群
            </p>
            <p>
              <WithPermission access="system.settings.api_gateway.view">
                <Link to="/cluster">添加集群地址</Link>
              </WithPermission>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
