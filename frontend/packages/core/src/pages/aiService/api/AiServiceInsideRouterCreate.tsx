import {App, Button, Form, Input, InputNumber, Row, Spin, Tag} from "antd";
import  { MutableRefObject, useEffect, useRef, useState} from "react";
import {BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { $t } from "@common/locales/index.ts";
import { LoadingOutlined } from "@ant-design/icons";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";
import { Icon } from "@iconify/react/dist/iconify.js";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { useAiServiceContext } from "@core/contexts/AiServiceContext.tsx";
import EditableTableNotAutoGen from "@common/components/aoplatform/EditableTableNotAutoGen.tsx";
import { AI_SERVICE_VARIABLES_TABLE_COLUMNS } from "@core/const/ai-service/const.tsx";
import { VariableItems } from "@core/const/ai-service/type.ts";
import PromptEditorResizable from '@common/components/aoplatform/prompt-editor/PromptEditorResizable.tsx';
import { DrawerWithFooter } from "@common/components/aoplatform/DrawerWithFooter";
import AiServiceRouterModelConfig, { AiServiceRouterModelConfigHandle } from "./AiServiceInsideRouterModelConfig";
import { AiProviderDefaultConfig, AiProviderLlmsItems } from "@core/pages/aiSetting/AiSettingList";
import { EditableFormInstance } from "@ant-design/pro-components";

type AiServiceRouterField = {
    name:string
    path:string
    prompt:string
    variables:Array<{key:string, description:string, require:true}>
    description:string
    timeout:number
    retry:number
}

type AiServiceRouterConfig = {
    name:string
    path:string
    aiPrompt:{
        prompt:string
        variables:Array<{key:string, description:string, require:true}>
    }
    aiModel:{
        id:string
        config:string
    }
    description:string
    timeout:number
    retry:number
}

const AiServiceInsideRouterCreate = () => {
    const navigator = useNavigate()
    const { message } = App.useApp()
    const {serviceId, teamId,routeId} = useParams<RouterParams>()
    const [form] = Form.useForm();
    const {fetchData} = useFetch()
    const [loading, setLoading] = useState<boolean>(false)
    const {apiPrefix,prefixForce ,aiServiceInfo} = useAiServiceContext()
    const [variablesTable,setVariablesTable] = useState<VariableItems[]>([])
    const [drawerType,setDrawerType]= useState<'edit'|undefined>()
    const [open, setOpen] = useState(false);
    const drawerAddFormRef = useRef<AiServiceRouterModelConfigHandle>(null)
    const [defaultLlm, setDefaultLlm] = useState<AiProviderDefaultConfig & {config:string}>()
    const [llmList, setLlmList] = useState<AiProviderLlmsItems[]>([])
    const [variablesTableRef, setVariablesTableRef] = useState<MutableRefObject<EditableFormInstance<T> | undefined>>()
    const onFinish =  ()=>{
        return variablesTableRef?.current?.validateFields().then(()=>{
            return form.validateFields().then((formValue)=>{
                const {name, path, description, variables, prompt, timeout, retry} = formValue
                const body = {name, path: !routeId && prefixForce ?  `${apiPrefix}/${path}`:path , description,timeout, retry,aiPrompt:{variables:variables, prompt:prompt},aiModel:{id:defaultLlm?.id, config:defaultLlm?.config}}
                return fetchData<BasicResponse<null>>('service/ai-router',{method: routeId ? 'PUT' : 'POST',eoBody:(body), eoParams: {service:serviceId,team:teamId, ...(routeId ? {router:routeId}: {})},eoTransformKeys:['aiPrompt','aiModel']}).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || $t(RESPONSE_TIPS.success))
                        navigator(`/aiservice/${teamId}/inside/${serviceId}/route`)
                        return Promise.resolve(true)
                    }else{
                        message.error(msg || $t(RESPONSE_TIPS.error))
                        return Promise.reject(msg || $t(RESPONSE_TIPS.error))
                    }
                }).catch(errInfo=>Promise.reject(errInfo))
            })
        })
        .catch(errInfo=>Promise.reject(errInfo))
    }

    const openDrawer = (type:'edit')=>{
        setDrawerType(type)
    }

    useEffect(()=>{drawerType !== undefined ? setOpen(true):setOpen(false)},[drawerType])

    const getRouterConfig = ()=>{
        setLoading(true)
        fetchData<BasicResponse<{api:AiServiceRouterConfig}>>('service/ai-router',{method:'GET',eoParams:{service:serviceId,team:teamId, router:routeId}, eoTransformKeys:['ai_model', 'ai_prompt']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                const {path, aiPrompt,aiModel} = data.api
                form.setFieldsValue({...data.api,...aiPrompt, path:prefixForce && path?.startsWith(apiPrefix + '/')? path.slice((apiPrefix?.length || 0) + 1) : path })
                setVariablesTable(aiPrompt.variables as VariableItems[])
                setDefaultLlm(prev => ({...prev, id:aiModel?.id, config:aiModel.config}) as (AiProviderDefaultConfig & { config: string; }))
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        }).catch((errorInfo)=> console.error(errorInfo))
        .finally(()=>setLoading(false))
    }

    const getDefaultModelConfig = ()=>{
        fetchData<BasicResponse<{llms:AiProviderLlmsItems[],provider:AiProviderDefaultConfig}>>('ai/provider/llms',{method:'GET',eoParams:{provider:aiServiceInfo?.provider?.id}, eoTransformKeys:['default_llm']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setLlmList(data.llms)
                setDefaultLlm(prev => {
                    const llmSetting = data.llms?.find((x:AiProviderLlmsItems)=>x.id ===( prev?.id ?? data.provider.defaultLlm))
                    return {...prev, 
                        defaultLlm:data.provider.defaultLlm, 
                        name:data.provider.name,
                        config:llmSetting?.config || '',
                        ...(llmSetting ?? {})
                    } as (AiProviderDefaultConfig & { config: string; })
                    })
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        }).catch((errorInfo)=> console.error(errorInfo))
    }


    useEffect(()=>{
        aiServiceInfo?.provider && getDefaultModelConfig()
    },[
        aiServiceInfo
    ])


    useEffect(() => {
        if(routeId){
            getRouterConfig()
        }else{
            form.setFieldsValue({
                prefix:apiPrefix,
                variables:[{key:'Query',value:'',require:true}],
                prompt:'{{Query}}',
                retry:0,
                timeout:300000
            })
        }
        return (form.setFieldsValue({}))
    }, []);

    const addVariable = ()=>{
        form.setFieldsValue({
            variables:[...form.getFieldValue('variables'),{key:'',value:'',require:true}]
        })
    }

    const handleVariablesChange = (newKeys:string[])=>{
        const variables = form.getFieldValue('variables') || []
        const variablesKeys = variables?.map(({key}:{key:string})=>(key))
        for(const key of newKeys){
            if(!variablesKeys ||variablesKeys.indexOf(key) === -1){
                variables.push({key, value:'',require:true})
            }
        }
        form.setFieldsValue({
            variables:[...variables]
        })
        setVariablesTable(variables as VariableItems[])
    }


    const handleValuesChange = (changedValues:Record<string,unknown>) => {
        if(changedValues.variables){
            setVariablesTable(changedValues.variables as VariableItems[])
        }
    };

    
    const handlerSubmit:() => Promise<boolean>|undefined= ()=>{
        return drawerAddFormRef.current?.save()?.then((res:{id:string, config:string})=>{
            setDefaultLlm(prev => ({...prev, id:res.id, config:res.config, logo:llmList?.find((x:AiProviderLlmsItems)=>x.id === res.id)?.logo}) as (AiProviderDefaultConfig & { config: string; }))
        return true})
    }

    const onClose = () => {
        setDrawerType(undefined);
      };

    return (
        
        <InsidePage pageTitle={ 'AI 路由设置'|| '-'} 
            showBorder={false}
            scrollPage={false}
            className="overflow-y-auto"
            backUrl={`/aiservice/${teamId}/inside/${serviceId}/route`}
            customBtn={
                <div className="flex gap-btnbase items-center">
                    <Button icon={<Icon icon='ic:baseline-tune' height={18} width={18} />} iconPosition='end' onClick={()=>openDrawer('edit')}>
                        <div className="flex items-center gap-[4px]">
                            <span  className="flex items-center " dangerouslySetInnerHTML={{__html: defaultLlm?.logo || ''}}></span>
                            <span>{defaultLlm?.id || defaultLlm?.defaultLlm}</span>
                            {defaultLlm?.scopes?.map(x=><Tag >{x?.toLocaleUpperCase()}</Tag>)}
                        </div>
                    </Button>
                    
                    <Button type="primary" onClick={onFinish}>
                        {$t('保存')}
                    </Button>
                </div>
            }>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading} wrapperClassName=' pb-PAGE_INSIDE_B pr-PAGE_INSIDE_X'>
                <Form
                    layout='vertical'
                    labelAlign='left'
                    scrollToFirstError
                    form={form}
                    className="mx-auto  flex flex-col  h-full"
                    name="AiServiceInsideRouterCreate"
                    onValuesChange={handleValuesChange}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <div className="">
                        <Row className="flex items-center gap-btnbase w-full justify-between">
                            <Form.Item<AiServiceRouterField>
                                className="flex-1"
                                label={$t("路由名称")}
                                name="name"
                                rules={[{ required: true,whitespace:true }]}
                            >
                                <Input  className="w-INPUT_NORMAL"   placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>
                            
                            <Form.Item<AiServiceRouterField>
                                className="flex-1"
                                label={$t("请求路径")}
                                name="path"
                                rules={[{ required: true,whitespace:true }]}
                            >
                                <Input  prefix={prefixForce ? `${apiPrefix}/` :"/"} className="w-INPUT_NORMAL" 
                                    placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>
                        </Row>

                        <Form.Item<AiServiceRouterField>
                            label={$t("提示词")}
                            name="prompt"
                        >
                                <PromptEditorResizable variablesChange={handleVariablesChange} promptVariables={variablesTable}/>
                        </Form.Item>

                        <Form.Item<AiServiceRouterField>
                                    label={<div className="w-full flex justify-between items-center"><span>{$t("变量")}</span><a className="flex items-center gap-[4px]" onClick={addVariable}><Icon icon="ic:baseline-add" width={16} height={16} />New</a></div>}
                                    name="variables"
                                    className="[&>.ant-row>.ant-col>label]:w-full"
                                >
                                    <EditableTableNotAutoGen<VariableItems & {_id:string}>
                                        getFromRef={setVariablesTableRef}
                                        configFields={AI_SERVICE_VARIABLES_TABLE_COLUMNS}
                                    />
                                </Form.Item>

                        <Form.Item<AiServiceRouterField>
                            label={$t("描述")}
                            name="description"
                        >
                            <Input.TextArea className="w-INPUT_NORMAL" placeholder={$t('输入这个接口的描述')}/>
                        </Form.Item>

                        <Row className="flex items-center gap-btnbase w-full justify-between">
                                <Form.Item<AiServiceRouterField>
                                    className="flex-1"
                                    label={$t("请求超时时间")}
                                    name={'timeout'}
                                    rules={[{required: true}]}
                                >
                                    <InputNumber className="w-INPUT_NORMAL" suffix="ms" min={1} placeholder={$t(PLACEHOLDER.input)} />
                                </Form.Item>
                                <Form.Item<AiServiceRouterField>
                                    className="flex-1"
                                    label={$t("重试次数")}
                                    name={'retry'}
                                    rules={[{required: true}]}
                                >
                                    <InputNumber className="w-INPUT_NORMAL" min={0}  placeholder={$t(PLACEHOLDER.input)} />
                                </Form.Item>
                        </Row>


                        </div>
                    </Form>
                </Spin>
                <DrawerWithFooter 
                    title={ $t("模型配置")} 
                    open={open} 
                    onClose={onClose} 
                    onSubmit={()=>handlerSubmit()} 
                    >
                         <AiServiceRouterModelConfig ref={drawerAddFormRef} llmList={llmList}  entity={defaultLlm!} />
                </DrawerWithFooter>
        </InsidePage>
    )
}
export default AiServiceInsideRouterCreate


  