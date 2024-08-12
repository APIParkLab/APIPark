
import { Link } from "react-router-dom";

export default function DashboardInstruction() {
    return (
        <div className="h-full w-full overflow-auto">
            <div className=" m-auto mt-[10%] flex flex-col items-center  p-[20px]">
                <p className="text-[20px] font-medium leading-[32px] text-MAIN_TEXT">集群配置并开启监控</p>
                <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT mt-[12px]" >监控功能用于辅助管理集群内信息，请配置集群、设置监控信息后查看当前集群监控情况；</p>
                {/* <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT mt-[8px]">更多配置问题，请点击帮助中心
                    {/* <a>查看更多</a> *
                    </p> */}
                <div className="flex mt-[28px]">
                    <div className="h-[208px] w-[384px] flex flex-col items-center py-[32px] px-[24px] gap-[16px] rounded-DEFAULT bg-MENU_BG mr-[24px]">
                        <p className="text-[20px] font-medium leading-[32px] text-MAIN_TEXT">集群配置</p>
                        <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT">新增集群地址、描述和其他相关属性，以确保监控系统能够正确识别和连接到集群</p>
                        <p><Link to="/cluster">添加集群信息</Link></p>
                    </div>
                </div>
            </div></div>
    )
}