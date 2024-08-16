
import  {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {App, Button, Form, Input, Radio, Row, Select, TreeSelect, Upload} from "antd";
import { Link, useNavigate, useParams} from "react-router-dom";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import {DefaultOptionType} from "antd/es/cascader";
import { EntityItem, MemberItem, SimpleTeamItem} from "@common/const/type.ts";
import { v4 as uuidv4 } from 'uuid'
import { SystemConfigFieldType, SystemConfigHandle } from "../../const/system/type.ts";
import { validateUrlSlash } from "@common/utils/validate.ts";
import { compressImage, normFile } from "@common/utils/uploadPic.ts"; 
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext.tsx";
import { useSystemContext } from "../../contexts/SystemContext.tsx";
import { visualizations } from "@core/const/system/const.tsx";
import { RcFile, UploadChangeParam, UploadFile, UploadProps } from "antd/es/upload/interface";
import { LoadingOutlined } from "@ant-design/icons";
import { getImgBase64 } from "@common/utils/dataTransfer.ts";
import { CategorizesType } from "@market/const/serviceHub/type.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { Icon } from "@iconify/react/dist/iconify.js";

const MAX_SIZE = 2 * 1024; // 1KB

const SystemConfig = forwardRef<SystemConfigHandle>((_,ref) => {
    const { message,modal } = App.useApp()
    const { teamId, serviceId } = useParams<RouterParams>();
    const [onEdit, setOnEdit] = useState<boolean>(!!teamId)
    const [form] = Form.useForm();
    const {fetchData} = useFetch()
    const [teamOptionList, setTeamOptionList] = useState<DefaultOptionType[]>()
    const navigate = useNavigate();
    const {setBreadcrumb} = useBreadcrumb()
    const { setSystemInfo} = useSystemContext()
    const [showClassify, setShowClassify] = useState<boolean>()
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [tagOptionList, setTagOptionList] = useState<DefaultOptionType[]>([])
    const [serviceClassifyOptionList, setServiceClassifyOptionList] = useState<DefaultOptionType[]>()
    const [uploadLoading, setUploadLoading] = useState<boolean>(false)

    useImperativeHandle(ref, () => ({
        save:onFinish
    }));

    const beforeUpload = async (file: RcFile) => {
        if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
            alert('只允许上传PNG、JPG或SVG格式的图片');
            return false;
          }
      
          if (file.size > MAX_SIZE) {
            try {
              const compressedBase64 = await compressImage(file, MAX_SIZE);
              setImageBase64(`data:${file.type};base64,${compressedBase64}`);
              form.setFieldValue('logo', `data:${file.type};base64,${compressedBase64}`);
            } catch (error) {
              console.error('压缩图片时出错', error);
            }
          } else {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
              setImageBase64(e.target?.result as string);
              form.setFieldValue('logo', e.target?.result);
            };
            reader.readAsDataURL(file);
          }
            return false;
        };
    

    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'uploading') {
            setUploadLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            getImgBase64(info.file.originFileObj as RcFile, () => {
                setUploadLoading(false);
            });
        }
        if (info.fileList.length === 0) {
            form.setFieldValue( "logo", null );
        }
    };

    const uploadButton = ( 
        <div>
            {uploadLoading ? <LoadingOutlined /> : <Icon icon="ic:baseline-add" width="24" height="24"/>}
        </div>
        );
    
    const getTagAndServiceClassifyList = ()=>{
        setTagOptionList([])
        setServiceClassifyOptionList([])
        fetchData<BasicResponse<{ catalogues:CategorizesType[],tags:EntityItem[]}>>('catalogues',{method:'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setTagOptionList(data.tags?.map((x:EntityItem)=>{return {
                    label:x.name, value:x.id
                }})||[])
                setServiceClassifyOptionList(data.catalogues)

            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    // 获取表单默认值
    const getSystemInfo = () => {
        fetchData<BasicResponse<{ service: SystemConfigFieldType }>>('service/info',{method:'GET',eoParams:{team:teamId, service:serviceId},eoTransformKeys:['team_id','service_type']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setTimeout(()=>{
                    form.setFieldsValue({
                        ...data.service,
                        team:data.service.team.id,
                        catalogue:data.service.catalogue?.id,
                        tags:data.service.tags?.map((x:EntityItem)=>x.id),
                         logoFile:[
                            {
                                uid: '-1', // 文件唯一标识
                                name: 'image.png', // 文件名
                                status: 'done', // 状态有：uploading, done, error, removed
                                url: data.service?.logo || '', // 图片 Base64 数据
                            }
                        ]
                    })
                    setImageBase64(data.service.logo)
                    setShowClassify(data.service.serviceType === 'public')
                            },0)
            }else{
                message.error(msg || '操作失败')
            }
        })
    };

    const onFinish:()=>Promise<boolean|string> = () => {
        return form.validateFields().then((value)=>{
            return fetchData<BasicResponse<{service:{id:string}}>>(serviceId === undefined? 'team/service':'service/info',{method:serviceId === undefined? 'POST' : 'PUT',eoParams: {...(serviceId === undefined ? {team:value.team} :{service:serviceId,team:teamId})},eoBody:({...value,prefix:value.prefix?.trim()}), eoTransformKeys:['serviceType']},).then(response=>{
                const {code,data,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || '操作成功！')
                    setSystemInfo(data.service)
                    return Promise.resolve(true)
                }else{
                    message.error(msg || '操作失败')
                    return Promise.reject(msg || '操作失败')
                }
            }).catch((errorInfo)=>{
                return Promise.reject(errorInfo)
            })
        })
    };


    const getTeamOptionList = ()=>{
        setTeamOptionList([])
        fetchData<BasicResponse<{ teams: SimpleTeamItem[] }>>('simple/teams/mine',{method:'GET',eoTransformKeys:['available_partitions']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setTeamOptionList(data.teams?.map((x:MemberItem)=>{return {...x,
                    label:x.name, value:x.id
                }}))
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    const deleteSystem = ()=>{
        fetchData<BasicResponse<null>>('team/service',{method:'DELETE',eoParams:{team:teamId,service:serviceId}}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                message.success(msg || '操作成功！')
                navigate(`/service/list`)
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    useEffect(() => {
        getTeamOptionList()
        getTagAndServiceClassifyList()
        if (serviceId !== undefined) {
            setOnEdit(true);
            getSystemInfo();
            setBreadcrumb([
                {
                    title: <Link to={`/service/list`}>服务</Link>
                },
                {
                    title: '设置'
                }])

        } else {
            setOnEdit(false);
            form.setFieldValue('id',uuidv4());
            form.setFieldValue('team',teamId); 
            form.setFieldValue('serviceType','inner'); 
        }
        return (form.setFieldsValue({}))
    }, [serviceId]);

    
    const deleteSystemModal = async ()=>{
        modal.confirm({
            title:'删除',
            content:'该数据删除后将无法找回，请确认是否删除？',
            onOk:()=> {
                return deleteSystem()
            },
            width:600,
            okText:'确认',
            okButtonProps:{
                danger:true
            },
            cancelText:'取消',
            closable:true,
            icon:<></>
        })
    }

    return (
        <>
                <WithPermission access={onEdit ? 'team.service.service.edit' :''}>
                <Form
                    layout='vertical'
                    labelAlign='left'
                    scrollToFirstError
                    form={form}
                    className="mx-auto  pr-PAGE_INSIDE_X "
                    name="systemConfig"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <div>
                        <Form.Item<SystemConfigFieldType>
                            label="服务名称"
                            name="name"
                            rules={[{ required: true, message: '必填项' ,whitespace:true }]}
                        >
                            <Input className="w-INPUT_NORMAL" placeholder="请输入服务名称"/>
                        </Form.Item>

                        <Form.Item<SystemConfigFieldType>
                            label="服务ID"
                            name="id"
                            rules={[{ required: true, message: '必填项' ,whitespace:true }]}
                        >
                            <Input className="w-INPUT_NORMAL" disabled={onEdit} placeholder="请输入服务ID"/>
                        </Form.Item>

                        <Form.Item<SystemConfigFieldType>
                            label="API 调用前缀"
                            name="prefix"
                            extra="选填，作为服务内所有服务的API的前缀，比如host/{sys_name}/{service_name}/{api_path}，一旦保存无法修改"
                            rules={[
                            {
                            validator: validateUrlSlash,
                            }]}
                        >
                            <Input prefix={onEdit ? '' : '/'} className="w-INPUT_NORMAL" disabled={onEdit} placeholder="请输入 API 调用前缀"/>
                        </Form.Item>

                        <Form.Item<SystemConfigFieldType>
                            label="图标"
                            name="logoFile"
                            extra="仅支持 .png .jpg .jpeg .svg 格式的图片文件, 大于 1KB 的文件将被压缩"
                            valuePropName="fileList" getValueFromEvent={normFile}
                        >
                            <Upload
                                listType="picture"
                                beforeUpload={beforeUpload}
                                onChange={handleChange}
                                showUploadList={false}
                                maxCount={1}
                                accept=".png, .jpg, .jpeg, .svg"
                            >
                                <div className="h-[68px] w-[68px] border-[1px] border-dashed border-BORDER flex items-center justify-center rounded bg-bar-theme cursor-pointer" style={{ marginTop: 8 }}>
                                    {imageBase64 ? <img src={imageBase64} alt="Logo" style={{  maxWidth: '200px', width:'68px',height:'68px'}} /> : uploadButton}
                                </div>
                            </Upload>

                        </Form.Item>

                        <Form.Item<SystemConfigFieldType>
                            label="描述"
                            name="description"
                        >
                            <Input.TextArea className="w-INPUT_NORMAL" placeholder="请输入描述"/>
                        </Form.Item>

                        <Form.Item<SystemConfigFieldType>
                            label="Logo"
                            name="logo"
                            hidden
                        >
                        </Form.Item>

                        {!onEdit && <Form.Item<SystemConfigFieldType>
                            label="所属团队"
                            name="team"
                            rules={[{ required: true, message: '必填项' }]}
                        >
                            <Select className="w-INPUT_NORMAL" disabled={onEdit} placeholder="请选择" options={teamOptionList} >
                            </Select>
                        </Form.Item>}


                        <Form.Item<SystemConfigFieldType>
                            label="标签"
                            name="tags"
                        >
                            <Select 
                                className="w-INPUT_NORMAL" 
                                mode="tags" 
                                placeholder="请选择" 
                                options={tagOptionList}>
                            </Select>
                        </Form.Item>

                        <Form.Item<SystemConfigFieldType>
                            label="服务类型"
                            name="serviceType"
                            rules={[{required: true, message: '必填项'}]}
                        >
                            <Radio.Group className="flex flex-col" options={visualizations} onChange={(e)=>{setShowClassify(e.target.value === 'public')}} />
                        </Form.Item>

                        {showClassify &&
                        <Form.Item<SystemConfigFieldType>
                            label="所属服务分类"
                            name="catalogue"
                            extra="设置服务展示在服务市场中的哪个分类下"
                            rules={[{required: true, message: '必填项'}]}
                        >
                            <TreeSelect
                                className="w-INPUT_NORMAL"
                                fieldNames={{label:'name',value:'id',children:'children'}}
                                showSearch
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                placeholder="请选择"
                                allowClear
                                treeDefaultExpandAll
                                treeData={serviceClassifyOptionList}
                            />
                        </Form.Item>
                        }
                        {onEdit && <>
                        <Row className="mb-[10px]"
                            // wrapperCol={{ offset: 5, span: 19 }}
                            >
                        <WithPermission access={onEdit ? 'team.service.service.edit' :''}>
                            <Button type="primary" htmlType="submit">
                                保存
                            </Button>
                            </WithPermission>
                        </Row></>}
                    </div>
                    {onEdit && <>
                        <WithPermission access="team.service.service.delete" showDisabled={false}>
                            <div className="bg-[rgb(255_120_117_/_5%)] rounded-[10px] mt-[50px] p-btnrbase pb-0">
                            <p className="text-left"><span className="font-bold">删除服务：</span>删除操作不可恢复，请谨慎操作！</p>
                                <div className="text-left">
                                    <WithPermission access="team.service.service.delete">
                                        <Button className="m-auto mt-[16px] mb-[20px]" type="default"  danger={true} onClick={deleteSystemModal}>删除服务</Button>
                                        </WithPermission>
                                </div>
                            </div>
                        </WithPermission>
                    </>}
                </Form>
                </WithPermission>
        </>
    )
})
export default SystemConfig