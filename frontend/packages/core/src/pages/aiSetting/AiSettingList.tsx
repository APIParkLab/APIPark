import { LoadingOutlined } from "@ant-design/icons";
import InsidePage from "@common/components/aoplatform/InsidePage";
import { BasicResponse, STATUS_CODE, RESPONSE_TIPS } from "@common/const/const";
import { useFetch } from "@common/hooks/http";
import { $t } from "@common/locales";
import { Icon } from "@iconify/react/dist/iconify.js";
import { App, Spin, Card, Tag, Button, Empty, Divider } from "antd";
import { memo, useEffect, useRef, useState } from "react";
import AiSettingModalContent, { AiSettingModalContentHandle } from "./AiSettingModal";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { useGlobalContext } from "@common/contexts/GlobalStateContext";
import { checkAccess } from "@common/utils/permission";

export type AiSettingListItem = {
    name: string
    id:string
    logo:string
    defaultLlm: string
    defaultLlmLogo:string
    enable:boolean
    configured:boolean
}

export type AiProviderLlmsItems = {
    id:string
    logo:string
    scopes:('chat'|'completions')[]
    config:string
}

export type AiProviderDefaultConfig = {
    id:string
    provider:string
    name:string
    logo:string
    defaultLlm:string
    scopes:string[]
}

export type AiProviderConfig = {
    id:string 
    name:string
    config:string
    getApikeyUrl:string
}
const AiSettingList = ()=>{
    const { modal,message } = App.useApp()
    const {fetchData} = useFetch()
    const [aiSettingList, setAiSettingList] = useState<AiSettingListItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    // const [updateLoading, setUpdateLoading] = useState<boolean>(false)
    const modalRef = useRef<AiSettingModalContentHandle>() 
    const {setAiConfigFlushed,accessData} = useGlobalContext()

    const getAiSettingList = ()=>{
        setLoading(true)
        return fetchData<BasicResponse<{providers:Omit<AiSettingListItem,'availableLlms'|'llmListStatus'>[]}>>(`ai/providers`,{method:'GET', eoTransformKeys:['default_llm','default_llm_logo']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setAiSettingList(data.providers?.map((x:AiSettingListItem)=>({...x,name:$t(x.name),llmListStatus:'unload', availableLlms:[]})
                ))
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        }).finally(()=>setLoading(false))
    }


    // 第一期暂时隐藏
    // const updateModalList = ()=>{
    //     setUpdateLoading(true)
    //     return fetchData<BasicResponse<{roles:AiSettingListItem[]}>>(`aisetting`,{method:'GET'}).then(response=>{
    //         const {code,msg} = response
    //         if(code === STATUS_CODE.SUCCESS){
    //             getAiSettingList()
    //         }else{
    //             message.error(msg || $t(RESPONSE_TIPS.error))
    //         }
    //     }).finally(()=>setUpdateLoading(false))
    // }

    const openModal = async (entity:AiSettingListItem)=>{
        message.loading($t(RESPONSE_TIPS.loading))
        const {code,data,msg} = await fetchData<BasicResponse<{provider:AiProviderConfig}>>('ai/provider/config',{method:'GET',eoParams:{provider:entity!.id}, eoTransformKeys:['get_apikey_url']})
        message.destroy()
        if(code !== STATUS_CODE.SUCCESS){
            message.error(msg || $t(RESPONSE_TIPS.error))
            return
        }
        modal.confirm({
            title:$t('模型配置'),
            content:<AiSettingModalContent ref={modalRef} entity={{...data.provider,defaultLlm:entity.defaultLlm}} readOnly={!checkAccess('system.devops.ai_provider.edit', accessData)}/>,
            onOk:()=>{
                return modalRef.current?.save().then((res)=>{if(res === true) 
                    setAiConfigFlushed(true)
                    getAiSettingList()})
            },
            width:600,
            okText:$t('确认'),
            footer:(_, { OkBtn, CancelBtn }) =>{
                return (
                        <div className="flex items-center justify-between">
                            <a target="_blank" rel="noopener noreferrer" href={data.provider.getApikeyUrl} className="flex items-center gap-[8px]">
                                <span>{$t('从 (0) 获取 API KEY',[data.provider.name])}</span>
                                <Icon icon="ic:baseline-open-in-new" width={16} height={16} />
                            </a>
                            <div>
                            <CancelBtn/>
                            {
                                checkAccess('system.devops.ai_provider.edit', accessData) ? <OkBtn/> : null
                            }
                            </div>
                        </div>
                );
            },
            cancelText:$t('取消'),
            closable:true,
            icon:<></>,
        })
    }

    useEffect(() => {
        getAiSettingList()
    }, []);

    const CardBox = memo(({provider}:{provider:AiSettingListItem})=>{
        return (
            <Card title={
                    <div className="flex w-full items-center justify-between gap-[4px]">
                        <div className="flex flex-1 overflow-hidden items-center  gap-[4px]">
                            <span className=" flex items-center h-[22px]  ai-setting-svg-container" dangerouslySetInnerHTML={{ __html: provider.logo }}  ></span>
                            <span className="font-normal truncate">{provider.name}</span>
                        </div>
                        <Tag bordered={false} color={provider.configured ? 'green' : undefined} className="h-[22px] px-[4px] text-center">
                            {provider.configured ? $t('已配置') : $t('未配置')}
                        </Tag>
                </div> }
                    className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible  h-[156px] m-0 flex flex-col "  
                    classNames={{header:'border-b-[0px] p-[20px] px-[24px]', body:"pt-0 flex-1"}} 
                    >
                        <div className="flex flex-col justify-between h-full gap-btnbase ">
                            <div className="flex items-center w-full h-[32px]  flex-1">{
                                provider.configured && <><label className="text-nowrap">{$t('默认')}：</label>
                                <span className="flex-1 overflow-hidden truncate">{provider.defaultLlm}</span>
                                </> 
                                }
                                   
                                </div>
                            <WithPermission access="system.settings.ai_provider.view">
                                <Button block icon={<Icon icon="ic:outline-settings"  width={18} height={18}/>} onClick={()=>openModal(provider)} classNames={{icon:'h-[18px]'}}>{$t('设置')}</Button>
                            </WithPermission>
                        </div>
                </Card>
        )
    });

    const ModelCardArea = ({modelList,className}:{ modelList:AiSettingListItem[] ;className?:string})=>{
        return ( <>
            { modelList.length > 0 ?
            <div 
                className={className}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px',
                }}
            >
                {modelList.map((provider:AiSettingListItem)=><CardBox key={provider.id} provider={provider} />)}
            </div> : <Empty  image={Empty.PRESENTED_IMAGE_SIMPLE}/>
        }</>
        )
    }

    return (<>
        <InsidePage 
            className="overflow-y-auto pb-PAGE_INSIDE_B"
            pageTitle={$t('AI 模型管理')}
            description={$t('配置好 AI 模型后，你可以使用对应的大模型来创建 AI 服务')} 
            showBorder={false}
            scrollPage={false}
            // customBtn={
                // <WithPermission access="system.devops.ai_provider.edit">
            // <Button 
            //     icon={<Icon icon="ic:baseline-refresh" width={20} height={20} />} 
            //     type="text" 
            //     iconPosition={'start'} 
            //     classNames={{icon:'h-[20px]'}} 
            //     loading={updateLoading} 
            //     onClick={updateModalList}>
            //     {$t('同步最新模型')}
            // </Button>
                // </WithPermission>
            // }
            >
            <Spin className="h-full" wrapperClassName="h-full pr-PAGE_INSIDE_X"  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading}>
            {aiSettingList && aiSettingList.length > 0 ? <div>
                <p className="text-[14px] text-[#666] mb-[4px] font-bold">{$t('已配置')}</p>
                <ModelCardArea className="mb-[20px]" modelList={aiSettingList.filter((item)=>item.configured) || [] }/>
                    {
                        aiSettingList.filter((item)=>!item.configured).length > 0 && <>
                            <Divider style={{margin:'20px 0 !important;'}} />
                            <p className="text-[14px] text-[#666]  mb-[4px] mt-[20px]  font-bold">{$t('未配置')}</p>
                                <ModelCardArea modelList={aiSettingList.filter((item)=>!item.configured) || [] }/>
                            </>
                    }
            </div>:<Empty  image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
        </Spin>
        </InsidePage>
    </>)
}
export default AiSettingList;