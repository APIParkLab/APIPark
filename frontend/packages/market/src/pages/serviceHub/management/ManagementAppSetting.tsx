import { RouterParams } from "@core/components/aoplatform/RenderRoutes";
import { useParams } from "react-router-dom";
import ManagementConfig from "./ManagementConfig";
import { $t } from "@common/locales";

export default function ManagementAppSetting(){
    const {teamId,appId} = useParams<RouterParams>()
    
    return (
        <div className=" h-full pt-[32px]">
        <div className="flex items-center justify-between w-full ml-[10px] text-[18px] leading-[25px] pb-[16px]" ><span className="font-bold">{$t('消费者管理')}</span></div>
        <div className="h-[calc(100%-41px)] flex flex-col ">
            <ManagementConfig type='edit' teamId={teamId!} appId={appId!}/>
        </div>
       </div>
    )
}