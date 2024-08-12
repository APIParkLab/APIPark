import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {App, Checkbox, Form, Input, Select,Switch} from "antd";
import moment from "moment";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import DatePicker from "@common/components/aoplatform/DatePicker.tsx";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { v4 as uuidv4} from 'uuid';
import { ALGORITHM_ITEM } from "@core/const/system/const.tsx";
import { EditAuthFieldType } from "@core/const/system/type";

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
                        message.success(msg || '操作成功！')
                        resolve(true)
                    }else{
                        message.error(msg || '操作失败')
                        reject(msg || '操作失败')
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

     
    const disabledDate = (current: moment.Moment | null): boolean => {
        // 禁用今天以前的日期，包括今天
        // 使用current?.startOf('day')是为了获取日期的开始时间点，以确保整个今天都被禁用
        // 如果只需要禁用今天之前的日期（今天可选），则可以将`isBefore`的第二个参数设置为 'day'
        return current ? current.startOf('day') < moment().startOf('day') : false;
      };
    

    useEffect(() => {
        //console.log(data)
        if(type === 'edit' && data){
            form.setFieldsValue({...data,expireTime:data.expireTime === 0 ? '' : moment(data.expireTime *1000)})
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
                label="名称"
                name="name"
                rules={[{required: true, message: '必填项',whitespace:true }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入鉴权名称"/>
            </Form.Item>

            <Form.Item<EditAuthFieldType>
                label="鉴权类型"
                name="driver"
                rules={[{required: true, message: '必填项'}]}
            >
                <Select disabled={type === 'edit'} className="w-INPUT_NORMAL" options={[
                    {label:'Basic',value:'basic'},
                    {label:'Jwt',value:'jwt'},
                    {label:'AkSk',value:'aksk'},
                    {label:'Apikey',value:'apikey'}]}  onChange={(e)=>onDriverChange(e)} placeholder="请输入鉴权类型"/>
            </Form.Item>

            <Form.Item
                name="tokenName"
                label="参数位置"
                rules={[{required: true, message: '必填项',whitespace:true }]}
            >
                <Input className="w-INPUT_NORMAL" addonBefore={prefixSelector} style={{width: '100%'}}/>
            </Form.Item>

            {(()=>{
                switch(form.getFieldValue('driver')){
                    case 'basic':
                        return <>
                            <Form.Item<EditAuthFieldType>
                                label="用户名"
                                name={['config','userName']}
                                rules={[{required: true, message: '必填项',whitespace:true }]}
                            >
                                <Input  className="w-INPUT_NORMAL" placeholder="英文数字下划线任意一种，首字母必须为英文"/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label="密码"
                                name={['config','password']}
                                rules={[{required: true, message: '必填项',whitespace:true }]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
                            </Form.Item>
                        </>
                    case 'jwt':
                        return <>
                            <Form.Item<EditAuthFieldType>
                                label="Iss"
                                name={['config','iss']}
                                rules={[{required: true, message: '必填项'}]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label="签名算法"
                                name={['config','algorithm']}
                                rules={[{required: true, message: '必填项'}]}
                            >
                                <Select  className="w-INPUT_NORMAL" options={ALGORITHM_ITEM} onChange={(value)=>{onAlgorithmChange(value)}}/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label={ algorithm.includes('HS') ? 'Secret':'RSA 公钥'}
                                name={algorithm.includes('HS') ? ['config','secret']:['config','publicKey']}
                                rules={[{required: true, message: '必填项'}]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label="用户名"
                                name={['config','user']}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label="用户名 JsonPath"
                                name={['config','userPath']}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label="校验字段"
                                name={['config','claimsToVerify']}
                            >
                                <Select className="w-INPUT_NORMAL" mode="multiple" options={[{label:'exp',value:'exp'},{label:'nbf',value:'nbf'}]} placeholder="请输入"/>
                            </Form.Item>

                            {algorithm.includes('HS') && <Form.Item<EditAuthFieldType>
                                label="是否 Base64 加密"
                                name={['config', 'signatureIsBase64']}
                            >
                                <Switch />
                            </Form.Item>}
                        </>
                    case 'aksk':
                        return <>
                            <Form.Item<EditAuthFieldType>
                                label="AK"
                                name={['config','ak']}
                                rules={[{required: true, message: '必填项'}]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
                            </Form.Item>

                            <Form.Item<EditAuthFieldType>
                                label="SK"
                                name={['config','sk']}
                                rules={[{required: true, message: '必填项'}]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
                            </Form.Item>
                        </>
                    case 'apikey':
                        return <>
                            <Form.Item<EditAuthFieldType>
                                label="Apikey"
                                name={['config','apikey']}
                                rules={[{required: true, message: '必填项',whitespace:true }]}
                            >
                                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
                            </Form.Item>
                        </>
                }

            })()}

            <Form.Item<EditAuthFieldType>
                label="过期时间"
                name="expireTime"
            >
                <DatePicker   
                format="YYYY-MM-DD"
                disabledDate={disabledDate}
                className="w-INPUT_NORMAL" />
            </Form.Item>

            <Form.Item<EditAuthFieldType>
                label="隐藏鉴权信息"
                name="hideCredential" valuePropName="checked"
            >
                <Checkbox/>
            </Form.Item>
        </Form>
        // </WithPermission>
    );
})