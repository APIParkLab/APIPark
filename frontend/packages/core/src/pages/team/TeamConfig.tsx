import  { forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {App, Button, Form, Input, Row, Select} from "antd";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import { v4 as uuidv4 } from 'uuid'
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {MemberItem} from "@common/const/type.ts";
import {useFetch} from "@common/hooks/http.ts";
import {DefaultOptionType} from "antd/es/cascader";
import { TeamConfigFieldType } from "../../const/team/type.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext.tsx";
import { useTeamContext } from "../../contexts/TeamContext.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";

export type TeamConfigHandle = {
    save:()=>Promise<string|boolean>|undefined
}

type TeamConfigProps = {
    entity?:TeamConfigFieldType
}

const TeamConfig= forwardRef<TeamConfigHandle,TeamConfigProps>((props,ref) => {
    const {entity} = props
    const { message } = App.useApp()
    const { teamId } = useParams<RouterParams>();
    const [onEdit, setOnEdit] = useState<boolean>(!!teamId)
    const [form] = Form.useForm();
    const location = useLocation()
    const currentUrl = location.pathname
    const {fetchData} = useFetch()
    const [managerOption, setManagerOption] = useState<DefaultOptionType[]>([])
    const { setBreadcrumb} = useBreadcrumb()
    const { setTeamInfo } =useTeamContext()
    const {checkPermission} = useGlobalContext()
    const pageType= checkPermission('system.organization.team.view') ? 'manage' : 'myteam'
    const [canDelete, setCanDelete] = useState<boolean>(false)
    const navigateTo = useNavigate()
    useImperativeHandle(ref, () => ({
        save:onFinish
    }));
    
    const onFinish = () => {
        return form.validateFields().then((value)=>{
            let params:{[k:string]:string} = {}
            if(pageType === 'manage'){
                params = {id:teamId!}
            }else{
                params = {team:teamId!}
            }
            return fetchData<BasicResponse<{team:TeamConfigFieldType}>>(pageType === 'manage'?'manager/team' : 'team',{method:onEdit ? 'PUT' : 'POST', eoParams:params,eoBody:(value),eoTransformKeys:['teamId']}).then(response=>{
                const {code,data,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || '操作成功！')
                    setTeamInfo?.(data.team)
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

    // 获取表单默认值
    const getTeamInfo = () => {
        fetchData<BasicResponse<{ team: TeamConfigFieldType }>>(pageType === 'manage'?'manager/team' : 'team',{method:'GET',eoParams:(pageType === 'manage'? {id:teamId}:{team:teamId}),eoTransformKeys:['can_delete']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setCanDelete(data.team.canDelete)
                setTimeout(()=>{form.setFieldsValue({...data.team})},0)
            }else{
                message.error(msg || '操作失败')
            }
        })
    };

    const getManagerList = ()=>{
        setManagerOption([])
        fetchData<BasicResponse<{ members: MemberItem[] }>>('simple/member',{method:'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setManagerOption(data.members?.map((x:MemberItem)=>{return {
                    label:x.name, value:x.id
                }}) || [])
            }else{
                message.error(msg || '操作失败')
            }
        })
    }
    
    const deleteTeam = ()=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>(`manager/team`,{method:'DELETE',eoParams:{id:form.getFieldValue('id')}}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || '操作成功！')
                    navigateTo('/team/list')

                    resolve(true)
                }else{
                    message.error(msg || '操作失败')
                    reject(msg || '操作失败')
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    useEffect(() => {
        getManagerList()
        if(entity){
            setOnEdit(true);
            form.setFieldsValue(entity)
        }else if (teamId !== undefined) {
            setBreadcrumb([
                {title:<Link to="/team/list">团队</Link>},
                {title:'设置'}
            ])
            setOnEdit(true);
            getTeamInfo();
        } else {
            setOnEdit(false);
            form.setFieldsValue({id:uuidv4()}); // 清空 initialValues
        }
        return (form.setFieldsValue({}))
    }, [teamId]);

    return (
        <>
            <div className='overflow-auto h-full w-full pr-PAGE_INSIDE_X'>
                <WithPermission access={onEdit ?(currentUrl.split('/')[1] === 'myteam'? 'team.team.team.edit':'system.organization.team.edit') : 'system.organization.team.add'}>
                    <Form
                        layout='vertical'
                        labelAlign='left'
                        scrollToFirstError
                        form={form}
                        className={`mx-auto`}
                        name="teamConfig"
                        // labelCol={{ offset:1, span: 4 }}
                        // wrapperCol={{ span: 19}}
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item<TeamConfigFieldType>
                            label="团队名称"
                            name="name"
                            rules={[{ required: true, message: '必填项',whitespace:true  }]}
                        >
                            <Input className="w-INPUT_NORMAL" placeholder="请输入团队名称"/>
                        </Form.Item>

                        <Form.Item<TeamConfigFieldType>
                            label="团队 ID"
                            name="id"
                            extra="团队 ID（team_id）可用于检索团队，一旦保存无法修改。"
                            rules={[{ required: true, message: '必填项',whitespace:true  }]}
                        >
                            <Input className="w-INPUT_NORMAL" disabled={onEdit} placeholder="请输入团队ID"/>
                        </Form.Item>

                        {!onEdit &&
                        <Form.Item<TeamConfigFieldType>
                            label="团队负责人"
                            name="master"
                            extra="负责人对团队内的团队、服务、成员有管理权限"
                            rules={[{required: true, message: '必填项'}]}
                        >
                            <Select className="w-INPUT_NORMAL" placeholder="请选择负责人" options={managerOption}>
                            </Select>
                        </Form.Item>}


                        <Form.Item<TeamConfigFieldType>
                            label="描述"
                            name="description"
                        >
                            <Input.TextArea className="w-INPUT_NORMAL" placeholder="请输入描述"/>
                        </Form.Item>

                    { onEdit &&
                    <Row className="mb-[10px]" 
                    // wrapperCol={{ offset: 5, span: 19 }}
                    >
                        <WithPermission access={['system.organization.team.edit','team.team.team.edit']}><Button type="primary" htmlType="submit">
                                保存
                            </Button></WithPermission>
                    </Row>
                }
                  {onEdit &&
                    <WithPermission access="system.organization.team.delete" showDisabled={false}>
                        <div className="bg-[rgb(255_120_117_/_5%)] rounded-[10px] mt-[50px] p-btnrbase pb-0">
                        <p className="text-left"><span className="font-bold">删除团队：</span>删除操作不可恢复，请谨慎操作！</p>
                            <div className="text-left">
                            <WithPermission access="system.organization.team.delete" disabled={!canDelete}  tooltip={canDelete ? '':'服务数据清除后，方可删除'}>
                                <Button className="m-auto mt-[16px] mb-[20px]" type="default" danger onClick={()=>deleteTeam(entity!)}>删除</Button>
                                </WithPermission>
                            </div>
                        </div>
                    </WithPermission>
                    }
                    </Form>
                </WithPermission>
            </div>
        </>
    )
})
export default TeamConfig