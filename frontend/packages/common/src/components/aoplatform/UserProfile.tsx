import {App, Form, Input, Upload, UploadFile, UploadProps} from "antd";
import  {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {useFetch} from "@common/hooks/http.ts";
import {RcFile, UploadChangeParam} from "antd/es/upload";
import {LoadingOutlined} from "@ant-design/icons";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import { UserInfoType, UserProfileHandle, UserProfileProps } from "@common/const/type";
import { getImgBase64 } from "@common/utils/dataTransfer";
import { Icon } from "@iconify/react/dist/iconify.js";

export const UserProfile = forwardRef<UserProfileHandle,UserProfileProps>((props,ref)=>{
    const { message } = App.useApp()
    const [form] = Form.useForm();
    const {entity,} = props
    const {fetchData} = useFetch()
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>();

    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
                fetchData<BasicResponse<null>>('account/profile',{method:'PUT',eoBody:value}).then(response=>{
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
        })
    }

    useImperativeHandle(ref, ()=>({
            save
        })
    )


    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getImgBase64(info.file.originFileObj as RcFile, (url) => {
                setLoading(false);
                setImageUrl(url);
            });
        }
        if (info.fileList.length === 0) {
            // 如果文件被移除，清除 logo 字段
            form.setFieldValue( "avatar", null );
        }
    };

    const uploadButton = (
        <div>
            <div className="h-[68px] w-[68px] border-[1px] border-dashed border-BORDER flex items-center justify-center rounded bg-bar-theme cursor-pointer" style={{ marginTop: 8 }}>
            {loading ? <LoadingOutlined /> : <Icon icon="ic:baseline-add" width="18" height="18" className='mr-[2px]'/>}</div>
        </div>
    );

    const beforeUpload = (file: RcFile) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            setImageBase64(e.target?.result as string);
            form.setFieldValue("avatar",e.target?.result)
        };
        reader.readAsDataURL(file);
        return false;
    };

    useEffect(() => {
        form.setFieldsValue(entity)
    }, []);

    
const normFile = (e: unknown) => {
    if (Array.isArray(e)) {
      return e;
    }
    return( e as {fileList:unknown} )?.fileList;
  };
    return (<>
        <Form
            labelAlign='left'
            layout='vertical'
            scrollToFirstError
            form={form}
            className="mx-auto mt-mbase "
            name="userProfile"
            // labelCol={{ span: 8 }}
            // wrapperCol={{ span: 10}}
            autoComplete="off"
        >
            <Form.Item<UserInfoType>
                label="账号"
                name="username"
                rules={[{ required: true, message: '必填项',whitespace:true  }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="账号" disabled={true}/>
            </Form.Item>

            <Form.Item<UserInfoType>
                label="昵称"
                name="nickname"
                rules={[{ required: true, message: '必填项',whitespace:true  }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

            <Form.Item<UserInfoType>
                label="头像"
                name="avatar"
                valuePropName="fileList" getValueFromEvent={normFile}
            >
                <Upload
                    listType="picture"
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                    showUploadList={false}
                    maxCount={1}
                >
                    {imageBase64 ? <img src={imageBase64} alt="Logo" style={{  maxWidth: '200px'}} /> : uploadButton}
                </Upload>

            </Form.Item>

            <Form.Item<UserInfoType>
                label="邮箱"
                name="email"
                rules={[{ required: true, message: '必填项' ,whitespace:true },{type:'email',message: '输入的不是有效邮箱格式'}]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

            <Form.Item<UserInfoType>
                label="手机号码"
                name="phone"
                rules={[{pattern:/^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/, message:'输入的不是有效手机号码',warningOnly: true }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

        </Form>
    </>)
})