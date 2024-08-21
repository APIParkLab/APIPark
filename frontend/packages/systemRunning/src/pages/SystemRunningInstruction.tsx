import { useBreadcrumb } from "@common/contexts/BreadcrumbContext";
import { $t } from "@common/locales";
import { useEffect } from "react";
import { Link } from "react-router-dom";
export default function SystemRunningInstruction() {
    const { setBreadcrumb } = useBreadcrumb()

    useEffect(()=>{
        setBreadcrumb([
            {title:$t('系统拓扑图')}
        ])
    },[])
    return (
        <div className="h-full w-full overflow-auto">
            <div className=" m-auto mt-[10%] flex flex-col items-center  p-[20px]">
                <p className="text-[20px] font-medium leading-[32px] text-MAIN_TEXT">系统配置并开启拓扑关联</p>
                <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT mt-[12px]" >系统拓扑功能辅助用户可视化了解系统结构，分析系统性能，规划系统部署，诊断系统故障。有助于提高系统可见性、可靠性和可维护性。</p>
                {/* <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT mt-[8px]">更多配置及关联问题，请点击帮助中心
                    {/* <a>查看更多</a> *
                    </p> */}
                <div className="flex mt-[28px]">
                    <div className="h-[208px] w-[384px] flex flex-col items-center py-[32px] px-[24px] gap-[16px] rounded-DEFAULT bg-MENU_BG mr-[24px]">
                        <p className="text-[20px] font-medium leading-[32px] text-MAIN_TEXT">服务设置</p>
                        <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT">支持根据权限，拆分人员对 API 添加 、上游设置、鉴权设置等信息发布及管理；同时支持管理 API 调用服务（包含第三方调用）及订阅；</p>
                        <p><Link to="/service/list">添加服务信息</Link></p>
                    </div>
                </div>
            </div></div>
    )
}