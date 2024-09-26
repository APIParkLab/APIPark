import { LoadingOutlined } from "@ant-design/icons";
import InsidePage from "@common/components/aoplatform/InsidePage";
import { BasicResponse, STATUS_CODE, RESPONSE_TIPS } from "@common/const/const";
import { EntityItem } from "@common/const/type";
import { useFetch } from "@common/hooks/http";
import { $t } from "@common/locales";
import { Icon } from "@iconify/react/dist/iconify.js";
import { App, Spin, Card, Tag, Select, Button, Empty } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import AiSettingModalContent, { AiSettingModalContentHandle } from "./AiSettingModal";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { useGlobalContext } from "@common/contexts/GlobalStateContext";
import { DefaultOptionType } from "antd/es/select";
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
}

export type AiProviderDefaultConfig = {
    id:string
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
    const [loadingDefaultModel, setLoadingDefaultModel] = useState<string>('')
    const modalRef = useRef<AiSettingModalContentHandle>() 
    const {setAiConfigFlushed,accessData} = useGlobalContext()
    const [llmMap, setLlmMap] = useState<Map<string, {loading:boolean, list:DefaultOptionType[]}>>(new Map<string, {loading:boolean, list:DefaultOptionType[]}>)
    const [currentProvider, setCurrentProvider] = useState<string>()

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

    const getLlmList = (provider:AiSettingListItem)=>{
         setLlmMap(prev=>{
            const newMap = new Map(prev);
            if(newMap.get(provider.id)){
                newMap.get(provider.id)!.loading = true
            }else{
                newMap.set(provider.id, {loading:true,list:[]})
            }
            return newMap
         })

         fetchData<BasicResponse<{llms:AiProviderLlmsItems[]}>>(`ai/provider/llms`,{method:'GET',eoParams:{provider:provider.id}}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setLlmMap(prev=>{
                    const newMap = new Map(prev);
                    const llmDetail = newMap.get(provider.id)
                    llmDetail!.list = data.llms?.map((x:AiProviderLlmsItems)=>({
                        label:<div className="flex w-full items-center gap-[4px]">
                                <div className="flex items-center" dangerouslySetInnerHTML={{ __html: x.logo }} />
                                <span>{x.id}</span></div>, 
                        value:x.id}))
                    return newMap
                })
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
         }).finally(()=>{
            setLlmMap(prev=>{
                const newMap = new Map(prev);
                const llmDetail = newMap.get(provider.id)
                llmDetail!.loading = false
                return newMap
            })
         })
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
            content:<AiSettingModalContent ref={modalRef} entity={data.provider} readOnly={!checkAccess('system.devops.ai_provider.edit', accessData)}/>,
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
                            <WithPermission access="system.devops.ai_provider.edit" showDisabled={false}>
                                <OkBtn/>
                            </WithPermission>
                            </div>
                        </div>
                );
            },
            cancelText:$t('取消'),
            closable:true,
            icon:<></>,
        })
    }

    const changeDefaultModel = (value: string, entity:AiSettingListItem) => {
        setLoadingDefaultModel(entity.id)
        return fetchData<BasicResponse<null>>(`ai/provider/default-llm`,{method:'PUT', eoBody:{llm:value}, eoParams:{provider:entity.id}}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                getAiSettingList()
                message.success(msg || $t(RESPONSE_TIPS.success))
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        }).finally(()=>setLoadingDefaultModel(''))
    };

    const modelOptions = useMemo(()=>{
        
        return currentProvider ? llmMap?.get(currentProvider)?.list : []
    },[currentProvider,llmMap])
  
    useEffect(() => {
        getAiSettingList()
    }, []);


    return (<>
        <InsidePage 
            className="pb-PAGE_INSIDE_B overflow-y-auto"
            pageTitle={$t('AI 模型供应商')} 
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
            {aiSettingList && aiSettingList.length > 0 ?  <div 
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px',
                    }}
                >
                    {aiSettingList.map((provider:AiSettingListItem)=>(
                        <Card title={
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center" dangerouslySetInnerHTML={{ __html: provider.logo }} />
                                    <Tag bordered={false} color={provider.configured ? 'green' : undefined} className="h-[22px] px-[4px] text-center">
                                        {provider.configured ? $t('已配置') : $t('未配置')}
                                    </Tag>
                            </div> }
                                className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible  h-[156px] m-0 flex flex-col "  
                                classNames={{header:'border-b-[0px] p-[20px] px-[24px]', body:"pt-0 flex-1"}} 
                                >
                                    <div className="flex flex-col gap-btnbase h-full justify-between">
                                        <div className="flex items-center w-full h-[32px]">
                                                <label className="text-nowrap">{$t('默认')}：</label>
                                                <WithPermission access="system.devops.ai_provider.edit">
                                                    <Select
                                                        value={provider.defaultLlm}
                                                        variant="borderless"
                                                        style={{ width: '100%' }}
                                                        onChange={(value)=>changeDefaultModel(value, provider)}
                                                        labelRender={(props)=>{
                                                            return !props.label && !llmMap.get(provider.id)?.list?.length ? 
                                                                <div className="flex items-center">
                                                                    <div className="flex items-center" dangerouslySetInnerHTML={{__html:provider.defaultLlmLogo}}></div>
                                                                    <span>{provider.defaultLlm}</span>
                                                                </div>: props.label }}
    x                                                    options={modelOptions}
                                                         onFocus={()=>{if(!llmMap.get(provider.id)?.loading  && !llmMap.get(provider.id)?.list?.length ){
                                                            getLlmList(provider)
                                                            setCurrentProvider(provider.id)
                                                            }}}
                                                         loading={llmMap.get(provider.id)?.loading || !!(loadingDefaultModel && loadingDefaultModel === provider.id )}
                                                        />
                                                </WithPermission>
                                            </div>
                                        <WithPermission access="system.devops.ai_provider.view">
                                            <Button block icon={<Icon icon="ic:outline-settings"  width={18} height={18}/>} onClick={()=>openModal(provider)} classNames={{icon:'h-[18px]'}}>{$t('设置')}</Button>
                                        </WithPermission>
                                    </div>
                            </Card>
                    ))}
                </div>:<Empty  image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
        </Spin>
        </InsidePage>
    </>)
}
export default AiSettingList;