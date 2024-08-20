import {  useEffect, useMemo, useState} from "react";
import {App, Button, Checkbox, Collapse, Form, GetProp, Input} from "antd";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE} from "@common/const/const.tsx";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes.tsx";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { $t } from "@common/locales";

type PermissionItem = {
    name:string 
    cname:string 
    value:string
}

type PermissionClassify = PermissionItem & {children : ( PermissionItem & {dependents:string[]})[]}

type RolePermissionItem = PermissionItem & {
    children:PermissionClassify[]}


type DependenciesMapType = Map<string, {dependents:string[], control:string[]}>

type PermissionCollapseProps = {
    id?: string;
    value?: string[];
    onChange?: (value:string[]) => void;
    permissionTemplate:RolePermissionItem[]
    dependenciesMap?: DependenciesMapType
}

type PermissionInfo = {
    permit: string[]
    description: string
    update_time: string
    create_time: string
    name: string
}

const PermissionContent = ({permits,onChange,value=[],id,dependenciesMap}:{permits:PermissionClassify[],dependenciesMap:DependenciesMapType,value:string[],id:string, onChange?: (value:string[]) => void;})=>{
            
    const onSingleCheckboxChange: GetProp<typeof Checkbox, 'onChange'> = (e) => {
        if(e.target.checked){
            onChange?.(Array.from(new Set([...value, e.target.id, ...(dependenciesMap?.get(e.target.id!)?.dependents || [])] as string[])))
        }else{
            const cancelValue = [...dependenciesMap?.get(e.target.id!)?.control || [], e.target.id]
            onChange?.(value.filter(x=>!cancelValue.includes(x)))
        }
    };
    
    return (
        <div id={id} className="flex flex-col gap-btnbase p-btnbase">
        {
            permits.map((item:PermissionClassify)=>(
                <>
                    <div className="flex flex-col gap-btnbase" key={`group-${item.name}`}>
                        {item.cname !== '' && <p className="">{item.cname}</p>}
                        <div className=" pl-[20px]">
                            {item.children.map(x=><Checkbox id={x.value} key={x.value} checked={value && value.length > 0 && value.indexOf(x.value)>-1} onChange={onSingleCheckboxChange}>{x.cname}</Checkbox>)}
                        </div>
                    </div>
                </>
            ))
        }</div>
    )
}
    // 自定义表单控件
    const PermissionCollapse:React.FC<PermissionCollapseProps>  = (props)=>{
        const { id, value = [], onChange,permissionTemplate ,dependenciesMap} = props;
        const [openCollapses, setOpenCollapses] = useState<string[]>([])
        
        const items = useMemo(()=>{
            const generatePermissionItem = (permissionItem:RolePermissionItem[])=> permissionItem.map((item:RolePermissionItem)=>({
                        key:item.name,
                        label:item.cname,
                        children:<PermissionContent value={value} permits={item.children} onChange={(e)=>onChange?.(e)} id={id!} dependenciesMap={dependenciesMap!}/>
                    }))
            return  permissionTemplate && permissionTemplate.length > 0 ? generatePermissionItem(permissionTemplate) : []
        },[permissionTemplate,value])

        useEffect(()=>{
            permissionTemplate && setOpenCollapses(permissionTemplate?.map(x=>x.name))
        },[permissionTemplate])
        
    const onCollapseChange = (keys: string | string[]) => {
        setOpenCollapses(keys as string[])
    };

    return <Collapse items={items} activeKey={openCollapses} onChange={onCollapseChange} />
    }


const RoleConfig = ()=>{
    const { message } = App.useApp()
    const [form] = Form.useForm();
    const {fetchData} = useFetch()
    const navigateTo = useNavigate()
    const { roleType, roleId} = useParams<RouterParams>()
    const [permissionTemplate, setPermissionTemplate] = useState<RolePermissionItem[]>()
    const [dependenciesMap, setDependenciesMap] = useState<DependenciesMapType>()
    const APP_MODE = import.meta.env.VITE_APP_MODE;


    const generateDependenciesMap = (data:RolePermissionItem[])=>{
        const map = new Map<string, {dependents:string[], control:string[]}>()
        data.forEach((item:RolePermissionItem)=>{
            item.children.forEach((child:PermissionClassify)=>{
                child.children.forEach((permission:PermissionItem & {dependents:string[]})=>{

                    if (permission.dependents && permission.dependents.length > 0) {
                        // 获取当前权限的依赖
                        const currentDependents = map.get(permission.value);
                        if (currentDependents) {
                            currentDependents.dependents.push(...permission.dependents);
                        } else {
                            map.set(permission.value, { dependents: [...permission.dependents], control: [] });
                        }
    
                        // 更新依赖项的控制项
                        permission.dependents.forEach((dependent: string) => {
                            const dependentEntry = map.get(dependent);
                            if (dependentEntry) {
                                dependentEntry.control.push(permission.value);
                            } else {
                                map.set(dependent, { dependents: [], control: [permission.value] });
                            }
                        });
                    }
                })
            })
        })
        setDependenciesMap(map)
    }
    
    const generateNewPermit:(data:RolePermissionItem[])=>RolePermissionItem[] = (data:RolePermissionItem[]) =>{
       return data.map((item:RolePermissionItem)=>({
            ...item,children:item.children.map((child:PermissionClassify)=>({
                ...child,
                children:child.children.map((permission:PermissionItem & {dependents:string[]})=>({
                    ...permission, value:`${roleType}.${item.value}.${child.value}.${permission.value}`
                }))
            }))
        }))
    }

    const getPermissionTemplate = ()=>{
        return fetchData<BasicResponse<{permits:RolePermissionItem[]}>>(`${roleType}/role/template`,{method:'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                const newPermits = generateNewPermit(data.permits)
                generateDependenciesMap(newPermits)
                setPermissionTemplate(newPermits)
            }else{
                message.error(msg || RESPONSE_TIPS.dataError)
            }
        })
    }

    const getPermissionInfo = ()=>{
        fetchData<BasicResponse<{role:PermissionInfo}>>(`${roleType}/role`,{method:'GET',eoParams:{role:roleId}}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                form.setFieldsValue({name:data.role.name,permits:data.role.permit})
                return Promise.resolve(true)
            }else{
                message.error(msg || RESPONSE_TIPS.error)
                return Promise.reject(msg || RESPONSE_TIPS.error)
            }
        }).catch((errInfo)=>Promise.reject(errInfo))
    }

    useEffect(() => {
        getPermissionTemplate()
        form.setFieldsValue({name:'',permits:[]})
        if(roleId){
            getPermissionInfo()
        }
    }, []);

    const onFinish =async() => {
            const body = await form.validateFields()

            return fetchData<BasicResponse<null>>(`${roleType}/role`,{method:roleId === undefined? 'POST' : 'PUT',eoBody:({...body}),...(roleId !== undefined?{eoParams:{role:roleId}}:{})}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || RESPONSE_TIPS.success)
                    return Promise.resolve(true)
                }else{
                    message.error(msg || RESPONSE_TIPS.error)
                    return Promise.reject(msg || RESPONSE_TIPS.error)
                }
            }).catch((errInfo)=>Promise.reject(errInfo))
    };

    return  (<div className="h-full flex flex-col overflow-hidden ">
                <div className="text-[18px] leading-[25px] pb-[12px]">
                        <Button className="flex items-center" type="text" onClick={()=>navigateTo(-1)}><ArrowLeftOutlined className="max-h-[14px]" /><span>返回</span></Button>
                </div>
            <WithPermission access={roleId !== undefined  ? `system.organization.role.${roleType}.edit`: `system.organization.role.${roleType}.add`}>
                <Form
                    id="permission"
                    layout='vertical'
                    labelAlign='left'
                    scrollToFirstError
                    form={form}
                    className="mx-auto w-full flex-1 no-bg-form overflow-hidden "
                    name="rolePermissionConfig"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <div className="flex flex-col h-full">
                    <Form.Item
                        className=" m-btnbase  mr-PAGE_INSIDE_X"
                        name="name"
                        rules={[{ required: true, message: VALIDATE_MESSAGE.required,whitespace:true  }]}
                    >
                        <Input className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.input}/>
                    </Form.Item>
                    <Form.Item
                        name="permits"
                        className="m-btnbase mr-0 flex-1 overflow-auto pr-PAGE_INSIDE_X"
                    >
                        <PermissionCollapse permissionTemplate={permissionTemplate!} dependenciesMap={dependenciesMap} />
                    </Form.Item>

                    {APP_MODE === 'pro' && <div className="p-btnbase">
                        <WithPermission access={roleId === undefined ?`system.organization.role.${roleType}.edit`:`system.organization.role.${roleType}.add`}>
                            <Button type="primary" htmlType="submit">
                                {$t('保存')}
                            </Button>
                        </WithPermission>
                        <Button className="ml-btnrbase" type="default" onClick={() => navigateTo(-1)}>
                                {$t('取消')}
                        </Button>
                    </div>}
                    </div>
             </Form>
            </WithPermission> 
    </div>)
}
export default RoleConfig