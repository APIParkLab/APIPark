import WithPermission from "@common/components/aoplatform/WithPermission";
import { BasicResponse, STATUS_CODE, RESPONSE_TIPS } from "@common/const/const";
import { useFetch } from "@common/hooks/http";
import { $t } from "@common/locales";
import { App } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { AiProviderConfig } from "./AiSettingList";
import { Codebox } from "@common/components/postcat/api/Codebox";


export type AiSettingModalContentProps = {
    entity:AiProviderConfig
    readOnly:boolean
}

export type AiSettingModalContentHandle = {
    save:()=>Promise<boolean|string>
}

const AiSettingModalContent = forwardRef<AiSettingModalContentHandle,AiSettingModalContentProps>((props,ref)=>{
    const { message } = App.useApp()
    const {entity,readOnly} = props
    const {fetchData} = useFetch()
    const [code, setCode] = useState<string>()

    useEffect(() => {
        try{
            entity!.config && setCode(JSON.stringify(JSON.parse(entity!.config),null,2))
        }catch(e){
            setCode('')
        }
    }, []);

    const save: ()=>Promise<boolean | string> = ()=>{
        return fetchData<BasicResponse<null>>('ai/provider/config',{method:'PUT',eoParams:{provider:entity?.id}, eoBody:({config:code})}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                message.success(msg || $t(RESPONSE_TIPS.success))
                return Promise.resolve(true)
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                return Promise.reject(msg || $t(RESPONSE_TIPS.error))
            }
        }).catch((errorInfo)=> Promise.reject(errorInfo))
    }

    useImperativeHandle(ref, ()=>({
            save
        })
    )

    return (
            <Codebox editorTheme="vs-dark" readOnly={readOnly}
                value={code} onChange={setCode} width="100%" height="300px" language='json' enableToolbar={false} />
  )
})

export default AiSettingModalContent