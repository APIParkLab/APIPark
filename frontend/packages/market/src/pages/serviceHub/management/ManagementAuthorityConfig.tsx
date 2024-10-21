import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {App, Checkbox, DatePicker, Form, Input, Select,Switch} from "antd";
import {BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { v4 as uuidv4} from 'uuid';
import { ALGORITHM_ITEM } from "@core/const/system/const.tsx";
import { EditAuthFieldType } from "@core/const/system/type";
import { RangePickerProps } from "antd/es/date-picker";
import dayjs from 'dayjs';
import { $t } from "@common/locales";

export type ManagementAuthorityConfigProps = {
    type:'add'|'edit'
    data?:EditAuthFieldType
    appId:string
    teamId:string
}

export type ManagementAuthorityConfigHandle = {
    save:()=>Promise<boolean|string>
}

export const ManagementAuthorityConfig = forwardRef<ManagementAuthorityConfigHandle,ManagementAuthorityConfigProps>((props,ref)=>{
    const { message } = App.useApp()
    const {type, data,appId, teamId} = props
    const [form] = Form.useForm();
    const [driver, setDriver]=useState('basic')
    const [algorithm, setAlgorithm] = useState('HS256')
    const [, forceUpdate] = useState<unknown>(null);
    const {fetchData} = useFetch()

    const save :()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
                fetchData<BasicResponse<null>>('app/authorization',{method:type === 'add'? 'POST' : 'PUT',eoBody:({...value,expireTime:value.expireTime ? value.expireTime.unix() : 0}), eoParams:type === 'add' ? {app:appId,team:teamId}:{authorization:data!.id,app:appId,team:teamId},eoTransformKeys:['hideCredential','expireTime','tokenName','userName']}).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || $t(RESPONSE_TIPS.success))
                        resolve(true)
                    }else{
                        message.error(msg || $t(RESPONSE_TIPS.error))
                        reject(msg || $t(RESPONSE_TIPS.error))
                    }
                }).catch((errorInfo)=> reject(errorInfo))
            }).catch((errorInfo)=> reject(errorInfo))
        })}

    useImperativeHandle(ref, ()=>({
            save
        })
    )

    const prefixSelector = (
        <Form.Item name="position" noStyle>
            <Select style={{ width: 90 }} options={[{label:'Header',value:'Header'},{label:'Query',value:'Query'},{label:'Body',value:'Body'}]}>
            </Select>
        </Form.Item>
    );

    const onAlgorithmChange = (algorithm:string)=>{
        setAlgorithm(algorithm)
    }

    const onDriverChange = (driver:string)=>{
        setDriver(driver)
        if(driver === 'jwt' && !form.getFieldValue(['config','algorithm'])){
            form.setFieldValue(['config','algorithm'],'HS256')
            forceUpdate({})
        }
    }

     

      const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        // Can not select days before today and today
        return current &&  current.isBefore(dayjs().endOf('day'), 'day');
      };
    

    useEffect(() => {
        //console.log(data)
        if(type === 'edit' && data){
            form.setFieldsValue({...data,expireTime:data.expireTime === 0 ? '' : dayjs(data.expireTime * 1000)})
            forceUpdate({})
        }else{
            form.setFieldsValue({driver, position:'Header',tokenName:'Authorization'})
            form.setFieldValue(['config','userName'],uuidv4())
            form.setFieldValue(['config','password'],uuidv4())
            form.setFieldValue(['config','apikey'],uuidv4())
            forceUpdate({})
        }
    }, []);

    return (
        // <WithPermission access={type === 'edit' ? 'service.myManagement.auth.edit':'service.myManagement.auth.add'}>
        <Form
            layout='vertical'
            labelAlign='left'
            scrollToFirstError
            form={form}
            className="mx-auto  "
            name="mngAuthorityConfig"
            // labelCol={{offset:1, span: 5}}
            // wrapperCol={{span: 18}}
            autoComplete="off"
        >
            <Form.Item<EditAuthFieldType>
                label={$t("名称")}
                name="name"
                rules={[{required: true,whitespace:true }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
            </Form.Item>

            <Form.Item<EditAuthFieldType>
                label={$t("鉴权类型")}
                name="driver"
                rules={[{required: true}]}
            >
                <Select disabled={type === 'edit'} className="w-INPUT_NORMAL" options={[
                    {label:'Basic',value:'basic'},
                    {label:'JWT',value:'jwt'},
                    {label:'AK/SK',value:'aksk'},
                    {label:'API Key',value:'apikey'}]}  onChange={(e)=>onDriverChange(e)} placeholder={$t(PLACEHOLDER.input)}/>
            </Form.Item>

            <Form.Item
                name="tokenName"
                label={$t("参数位置")}
                rules={[{required: true,whitespace:true }]}
            >
                <Input className="w-INPUT_NORMAL" addonBefore={prefixSelector} style={{width: '100%'}}/>
            </Form.Item>

            {(()=>{
                switch(form.getFieldValue('driver')){
                    case 'basic':
                        return <>
                            <Form.Item<EditAuthFieldType>
                                label={$t("用户名")}
                                name={['config','userName']}
                                rules={[{required: true,whitespace:true }]}
                            >
                                <Input  className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.startWithAlphabet)}/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label={$t("密码")}
                                name={['config','password']}
                                rules={[{required: true,whitespace:true }]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>
                        </>
                    case 'jwt':
                        return <>
                            <Form.Item<EditAuthFieldType>
                                label={$t("Iss")}
                                name={['config','iss']}
                                rules={[{required: true}]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label={$t("签名算法")}
                                name={['config','algorithm']}
                                rules={[{required: true}]}
                            >
                                <Select  className="w-INPUT_NORMAL" options={ALGORITHM_ITEM} onChange={(value)=>{onAlgorithmChange(value)}}/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label={ algorithm.includes('HS') ? $t('Secret'):$t('RSA 公钥')}
                                name={algorithm.includes('HS') ? ['config','secret']:['config','publicKey']}
                                rules={[{required: true}]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label={$t("用户名")}
                                name={['config','user']}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label={$t("用户名 JsonPath")}
                                name={['config','userPath']}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label={$t("校验字段")}
                                name={['config','claimsToVerify']}
                            >
                                <Select className="w-INPUT_NORMAL" mode="multiple" options={[{label:'exp',value:'exp'},{label:'nbf',value:'nbf'}]} placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>

                            {algorithm.includes('HS') && <Form.Item<EditAuthFieldType>
                                label={$t("是否 Base64 加密")}
                                name={['config', 'signatureIsBase64']}
                            >
                                <Switch />
                            </Form.Item>}
                        </>
                    case 'aksk':
                        return <>
                            <Form.Item<EditAuthFieldType>
                                label={$t("AK")}
                                name={['config','ak']}
                                rules={[{required: true}]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label={$t("SK")}
                                name={['config','sk']}
                                rules={[{required: true}]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>
                        </>
                    case 'apikey':
                        return <>
                            <Form.Item<EditAuthFieldType>
                                label={$t("Apikey")}
                                name={['config','apikey']}
                                rules={[{required: true,whitespace:true }]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>
                        </>
                }

            })()}

            <Form.Item<EditAuthFieldType>
                label={$t("过期时间")}
                name="expireTime"
            >
                <DatePicker   
                format="YYYY-MM-DD"
                disabledDate={disabledDate}
                className="w-INPUT_NORMAL" />
            </Form.Item>

            <Form.Item<EditAuthFieldType>
                label={$t("隐藏鉴权信息")}
                name="hideCredential" valuePropName="checked"
            >
                <Checkbox/>
            </Form.Item>
        </Form>
        // </WithPermission>
    );
})