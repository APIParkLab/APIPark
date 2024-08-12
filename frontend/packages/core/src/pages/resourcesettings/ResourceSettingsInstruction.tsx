import { useBreadcrumb } from "@common/contexts/BreadcrumbContext";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function ResourceSettingsInstruction() {
    
    const { setBreadcrumb } = useBreadcrumb()

    useEffect(()=>{
        setBreadcrumb([
            {title:'资源配置'}
        ])
    },[])

    return (
        <div className="h-full w-full overflow-auto">
        <div className=" m-auto mt-[10%] flex flex-col items-center  p-[20px]">
        <p className="text-[20px] font-medium leading-[32px] text-MAIN_TEXT">集群配置并开启资源插件</p>
        <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT mt-[12px]" >资源插件用于增强网关的功能和性能。在启用资源类插件之前，请确保已经配置了集群。例如，Redis插件可以提高缓存和速率限制的性能，配置完成后，可以使用Redis作为缓存数据库。</p>
        {/* <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT mt-[8px]">更多配置及关联问题，请点击帮助中心
            {/* <a>查看更多</a> 
            </p> */}
        <div className="flex mt-[28px]">
            <div className="h-[208px] w-[384px] flex flex-col items-center py-[32px] px-[24px] gap-[16px] rounded-DEFAULT bg-MENU_BG mr-[24px]">
            <p className="text-[20px] font-medium leading-[32px] text-MAIN_TEXT">集群配置</p>
                        <p className="text-[12px] font-normal leading-[20px] text-DESC_TEXT">新增集群地址、描述和其他相关属性，以确保插件能够正确识别和连接到集群</p>
                        <p><Link to="/cluster">配置集群地址</Link></p>
            </div>
        </div>
    </div></div>
    )
}