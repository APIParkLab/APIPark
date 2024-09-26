import {App, Col, Form, Input, Row, Select, Spin, Switch} from "antd";
import  {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import EditableTableWithModal from "@common/components/aoplatform/EditableTableWithModal.tsx";
import styles from "./SystemInsideApi.module.css"
import {BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { API_PROTOCOL, HTTP_METHOD, MATCH_CONFIG, MatchPositionEnum, MatchTypeEnum } from "../../../const/system/const.tsx";
import { SystemInsideRouterCreateHandle, SystemInsideRouterCreateProps, SystemApiProxyFieldType, SystemInsideApiProxyHandle } from "../../../const/system/type.ts";
import { MatchItem } from "@common/const/type.ts";
import { validateUrlSlash } from "@common/utils/validate.ts";
import { $t } from "@common/locales/index.ts";
import SystemInsideApiProxy from "@core/pages/system/api/SystemInsideApiProxy.tsx";
import { LoadingOutlined } from "@ant-design/icons";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";

const SystemInsideRouterCreate = forwardRef<SystemInsideRouterCreateHandle,SystemInsideRouterCreateProps>((props, ref) => {
    const { message } = App.useApp()
    const {type, entity, serviceId,teamId, modalApiPrefix:apiPrefix, modalPrefixForce:prefixForce} = props
    const [form] = Form.useForm();
    const {fetchData} = useFetch()
    const [loading, setLoading] = useState<boolean>(false)
    const proxyRef = useRef<SystemInsideApiProxyHandle>(null)
    const { state } = useGlobalContext()

    const onFinish = ()=>{
        return Promise.all([proxyRef.current?.validate?.(), form.validateFields()]).then(([,formValue])=>{
            const body = {...formValue,path:formValue.path.trim(),proxy:{...formValue.proxy,path:formValue.proxy.path ? (formValue.proxy.path.startsWith('/')? formValue.proxy.path: '/'+ formValue.proxy.path) : undefined}}
            return fetchData<BasicResponse<null>>('service/router',{method: type === 'add' ? 'POST' : 'PUT',eoBody:(body), eoParams: {service:serviceId,team:teamId, ...(type === 'edit' ? {router:entity?.id}: {})},eoTransformKeys:['matchType','disable']}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    return Promise.resolve(true)
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    return Promise.reject(msg || $t(RESPONSE_TIPS.error))
                }
            }).catch(errInfo=>Promise.reject(errInfo))
        })
    }

    const copy: ()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            return form.validateFields().then((value)=>{
                fetchData<BasicResponse<{api:SystemApiProxyFieldType}>>('service/api/copy',{method:'POST',eoParams:{service:serviceId,team:teamId, api:entity!.id},eoBody:({...value,path:value.path.trim()})}).then(response=>{
                    const {code,data,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || $t(RESPONSE_TIPS.success))
                        return resolve(data.api.id)
                    }else{
                        message.error(msg || $t(RESPONSE_TIPS.error))
                        return reject(msg || $t(RESPONSE_TIPS.error))
                    }
                }).catch((errorInfo)=> reject(errorInfo))
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    useImperativeHandle(ref, ()=>({
            copy,
            save:onFinish
        })
    )

    const getRouterConfig = ()=>{
        setLoading(true)
        fetchData<BasicResponse<{router:SystemApiProxyFieldType}>>('service/router/detail',{method:'GET',eoParams:{service:serviceId,team:teamId, router:entity!.id}, eoTransformKeys:['create_time','update_time','match_type','upstream_id','opt_type']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                const {disable, protocols, path, methods, description, match, proxy} = data.router
                form.setFieldsValue({disable, protocols, path:prefixForce && path?.startsWith(apiPrefix + '/')? path.slice((apiPrefix?.length || 0) + 1) : path, methods, description, match,proxy
                })
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        }).catch((errorInfo)=> console.error(errorInfo))
        .finally(()=>setLoading(false))
    }

    useEffect(() => {
        switch(type){
            case 'edit':
                getRouterConfig()
                break;
            case 'add':
                form.setFieldValue('prefix',apiPrefix)
                form.setFieldValue(['proxy','timeout'],10000)
                form.setFieldValue(['proxy','retry'],0)
                form.setFieldValue('protocols',['HTTP','HTTPS'])
                break;
            case 'copy':
                // form.setFieldsValue({
                //     ...entity,
                //     name:`${$t('副本')}-${entity!.name}`,
                //     ...(prefixForce?
                //         {prefix:apiPrefix,path: entity!.path.substring(apiPrefix?.length|| 0)}:
                //         {}),
                //     proxy:{timeout:10000, retry:0, ...entity?.proxy}
                // });
                break;
        }
        return (form.setFieldsValue({}))
    }, []);


    const translatedMatchConfig = useMemo(()=>{
        return MATCH_CONFIG.map((item)=>{
            if(item.key === 'position'){
                return ({...item,component:<Select className="w-INPUT_NORMAL" options={Object.entries(MatchPositionEnum)?.map(([key,value])=>{
                    return { label:$t(value), value:key}
                })}/>})
            }
            if(item.key === 'matchType'){
                return ({...item, component: <Select className="w-INPUT_NORMAL" options={Object.entries(MatchTypeEnum)?.map(([key,value])=>{
                    return { label:$t(value), value:key}
                })}/>})
            }
            return {...item}
        })
    }, [state.language])

    return (<div className="h-full w-full">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading} className=''>
                <Form
                    layout='vertical'
                    labelAlign='left'
                    scrollToFirstError
                    form={form}
                    className="mx-auto  flex flex-col  h-full"
                    name="SystemInsideRouterCreate"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <div className="">
                        <Row className="mb-btnybase" > <Col  ><span className="font-bold mr-[13px]">{$t('API 基础信息')}</span></Col></Row>
                        <Form.Item<SystemApiProxyFieldType>
                            label={$t("拦截该接口的请求")}
                            name="disable"
                            extra={$t('开启拦截后，网关会拦截所有该路径的请求，相当于防火墙禁用了特定路径的访问。')}
                        >
                            <Switch  />
                        </Form.Item>
                        
                        <Form.Item<SystemApiProxyFieldType>
                            label={$t("请求协议")}
                            name="protocols"
                            rules={[{ required: true }]}
                        >
                            <Select className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.select)} mode="multiple" options={API_PROTOCOL}>
                            </Select>
                        </Form.Item>

                        <Form.Item<SystemApiProxyFieldType>
                            label={$t("请求路径")}
                            name="path"
                            rules={[{ required: true,whitespace:true  },
                            {
                            validator: validateUrlSlash,
                            }]}
                            className={styles['form-input-group']}
                        >
                            <Input  prefix={(prefixForce ? `${apiPrefix}/` :"/")} className="w-INPUT_NORMAL" 
                                placeholder={$t(PLACEHOLDER.input)}/>
                        </Form.Item>

                        <Form.Item<SystemApiProxyFieldType>
                            label={$t("请求方式")}
                            name="methods"
                            rules={[{ required: true }]}
                        >
                            <Select className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.select)} mode="multiple" options={HTTP_METHOD.map((method:string)=>{
                                return { label:method, value:method}
                            })}>
                            </Select>
                        </Form.Item>

                        <Form.Item<SystemApiProxyFieldType>
                            label={$t("描述")}
                            name="description"
                        >
                            <Input.TextArea className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                        </Form.Item>

                        <Form.Item<SystemApiProxyFieldType>
                            label={$t("高级匹配")}
                            name="match"
                        >
                            <EditableTableWithModal<MatchItem & {_id:string}>
                                configFields={translatedMatchConfig}
                            />
                        </Form.Item>
                        {/* } */}

                        { type !== 'copy' &&<>

                        <Row className="mb-btnybase mt-[40px]"><Col  ><span className="font-bold mr-[13px]">{$t('转发规则设置')} </span></Col></Row>
                        <Form.Item<SystemApiProxyFieldType>
                            className="mb-0 bg-transparent border-none p-0"
                            name="proxy"
                        >
                            <SystemInsideApiProxy type={type} serviceId={serviceId!} teamId={teamId!} ref={proxyRef} />
                        </Form.Item>
                        </>}
                        </div>
                    </Form>
                </Spin>
    </div>
    )
})
export default SystemInsideRouterCreate