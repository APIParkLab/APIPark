import {App, Col, Form, Input, Row, Select} from "antd";
import  {forwardRef, useEffect, useImperativeHandle, useRef} from "react";
import EditableTableWithModal from "@common/components/aoplatform/EditableTableWithModal.tsx";
import styles from "./SystemInsideApi.module.css"
import {BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { HTTP_METHOD, MATCH_CONFIG } from "../../../const/system/const.tsx";
import { SystemInsideApiCreateHandle, SystemInsideApiCreateProps, SystemApiProxyFieldType, SystemInsideApiProxyHandle } from "../../../const/system/type.ts";
import { MatchItem } from "@common/const/type.ts";
import { validateUrlSlash } from "@common/utils/validate.ts";
import { $t } from "@common/locales/index.ts";
import SystemInsideApiProxy from "@core/pages/system/api/SystemInsideApiProxy";

const SystemInsideApiCreate = forwardRef<SystemInsideApiCreateHandle,SystemInsideApiCreateProps>((props, ref) => {
    const { message } = App.useApp()
    const {type, entity, serviceId,teamId, modalApiPrefix:apiPrefix, modalPrefixForce:prefixForce} = props
    const [form] = Form.useForm();
    const {fetchData} = useFetch()
    const proxyRef = useRef<SystemInsideApiProxyHandle>(null)
    
    const onFinish = ()=>{
        return Promise.all([proxyRef.current?.validate?.(), form.validateFields()]).then(([,formValue])=>{
            const body = {...formValue,path:formValue.path.trim(),proxy:{...formValue.proxy,path:formValue.proxy.path ? (formValue.proxy.path.startsWith('/')? formValue.proxy.path: '/'+ formValue.proxy.path) : undefined}}
            return fetchData<BasicResponse<{api:SystemApiProxyFieldType}>>('service/api',{method:'POST',eoBody:(body), eoParams: {service:serviceId,team:teamId},eoTransformKeys:['matchType']}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || RESPONSE_TIPS.success)
                    return Promise.resolve(true)
                }else{
                    message.error(msg || RESPONSE_TIPS.error)
                    return Promise.reject(msg || RESPONSE_TIPS.error)
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
                        message.success(msg || RESPONSE_TIPS.success)
                        return resolve(data.api.id)
                    }else{
                        message.error(msg || RESPONSE_TIPS.error)
                        return reject(msg || RESPONSE_TIPS.error)
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

    useEffect(() => {
        if(type === 'copy'){
            form.setFieldsValue({
                ...entity,
                name:`${$t('副本')}-${entity!.name}`,
                ...(prefixForce?
                    {prefix:apiPrefix,path: entity!.path.substring(apiPrefix?.length|| 0)}:
                    {}),
                proxy:{timeout:10000, retry:0, ...entity?.proxy}
            });
        }
        else{
            form.setFieldValue('prefix',apiPrefix)
            form.setFieldValue(['proxy','timeout'],10000)
            form.setFieldValue(['proxy','retry'],0)
        }
        return (form.setFieldsValue({}))
    }, []);

    return (<div className="h-full w-full">
            <Form
                layout='vertical'
                labelAlign='left'
                scrollToFirstError
                form={form}
                className="mx-auto  flex flex-col  h-full"
                name="systemInsideApiCreate"
                onFinish={onFinish}
                autoComplete="off"
            >
                <div className="">
                    <Row className="mb-btnybase" > <Col  ><span className="font-bold mr-[13px]">{$t('API 基础信息')}</span></Col></Row>
                    <Form.Item<SystemApiProxyFieldType>
                        label={$t("API 名称")}
                        name="name"
                        rules={[{ required: true, message: VALIDATE_MESSAGE.required ,whitespace:true }]}
                    >
                        <Input className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.input}/>
                    </Form.Item>

                    <Form.Item<SystemApiProxyFieldType>
                        label={$t("描述")}
                        name="description"
                    >
                        <Input.TextArea className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.input}/>
                    </Form.Item>

                    <Form.Item<SystemApiProxyFieldType>
                        label={$t("请求方式")}
                        name="method"
                        rules={[{ required: true, message: VALIDATE_MESSAGE.required }]}
                    >
                        <Select className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.select} options={HTTP_METHOD.map((method:string)=>{
                            return { label:method, value:method}
                        })}>
                        </Select>
                    </Form.Item>

                    <Form.Item<SystemApiProxyFieldType>
                        label={$t("请求路径")}
                        name="path"
                        rules={[{ required: true, message: VALIDATE_MESSAGE.required,whitespace:true  },
                        {
                          validator: validateUrlSlash,
                        }]}
                        className={styles['form-input-group']}
                    >
                        <Input  prefix={(prefixForce ? `${apiPrefix}/` :"/")} className="w-INPUT_NORMAL" 
                               placeholder={PLACEHOLDER.input}/>
                    </Form.Item>

                    <Form.Item<SystemApiProxyFieldType>
                        label={$t("高级匹配")}
                        name="match"
                    >
                        <EditableTableWithModal<MatchItem & {_id:string}>
                            configFields={MATCH_CONFIG}
                        />
                    </Form.Item>
                    {/* } */}

                    { type !== 'copy' &&<>

                    <Row className="mb-btnybase mt-[40px]"><Col  ><span className="font-bold mr-[13px]">{$t('转发规则设置')} </span></Col></Row>
                    <Form.Item<SystemApiProxyFieldType>
                        className="mb-0 bg-transparent border-none p-0"
                        name="proxy"
                    >
                        <SystemInsideApiProxy serviceId={serviceId!} teamId={teamId!} ref={proxyRef} />
                    </Form.Item>
                    </>}
                    </div>
                </Form>
    </div>
    )
})
export default SystemInsideApiCreate