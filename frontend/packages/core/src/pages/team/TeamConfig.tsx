import  { forwardRef, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {App, Button, Form, Input, Row, Select} from "antd";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import { v4 as uuidv4 } from 'uuid'
import {BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {MemberItem} from "@common/const/type.ts";
import {useFetch} from "@common/hooks/http.ts";
import {DefaultOptionType} from "antd/es/cascader";
import { TeamConfigFieldType } from "../../const/team/type.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext.tsx";
import { useTeamContext } from "../../contexts/TeamContext.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { $t } from "@common/locales/index.ts";

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
    const {checkPermission,accessInit,state} = useGlobalContext()
    const pageType= useMemo(()=>{
        if(!accessInit) return 'myteam'
        return checkPermission('system.workspace.team.view_all') ? 'manage' : 'myteam'
    },[checkPermission,accessInit]) 
    
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
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    setTeamInfo?.(data.team)
                    return Promise.resolve(true)
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    return Promise.reject(msg || $t(RESPONSE_TIPS.error))
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
                message.error(msg || $t(RESPONSE_TIPS.error))
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
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        })
    }
    
    const deleteTeam = ()=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>(`manager/team`,{method:'DELETE',eoParams:{id:form.getFieldValue('id')}}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    navigateTo('/team/list')

                    resolve(true)
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    reject(msg || $t(RESPONSE_TIPS.error))
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
                {title:<Link to="/team/list">{$t('团队')}</Link>},
                {title:$t('设置')}
            ])
            setOnEdit(true);
            getTeamInfo();
        } else {
            setOnEdit(false);
            form.setFieldsValue(
                {id:uuidv4(),
                    master:state?.userData?.uid
                }); // 清空 initialValues
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
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item<TeamConfigFieldType>
                            label={$t("团队名称")}
                            name="name"
                            rules={[{ required: true,whitespace:true  }]}
                        >
                            <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                        </Form.Item>

                        <Form.Item<TeamConfigFieldType>
                            label={$t("团队 ID")}
                            name="id"
                            extra={$t("团队 ID（team_id）可用于检索团队，一旦保存无法修改。")}
                            rules={[{ required: true,whitespace:true  }]}
                        >
                            <Input className="w-INPUT_NORMAL" disabled={onEdit} placeholder={$t(PLACEHOLDER.input)}/>
                        </Form.Item>

                        {!onEdit &&
                        <Form.Item<TeamConfigFieldType>
                            label={$t("团队负责人")}
                            name="master"
                            extra={$t("负责人对团队内的团队、服务、成员有管理权限")}
                            rules={[{required: true}]}
                        >
                            <Select className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.select)} options={managerOption}>
                            </Select>
                        </Form.Item>}


                        <Form.Item<TeamConfigFieldType>
                            label={$t("描述")}
                            name="description"
                        >
                            <Input.TextArea className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                        </Form.Item>

                    { onEdit &&
                    <Row className="mb-[10px]" 
                    >
                        <WithPermission access={['system.organization.team.edit','team.team.team.edit']}><Button type="primary" htmlType="submit">
                                {$t('保存')}
                            </Button></WithPermission>
                    </Row>
                }
                  {onEdit &&
                    <WithPermission access="system.organization.team.delete" showDisabled={false}>
                        <div className="bg-[rgb(255_120_117_/_5%)] rounded-[10px] mt-[50px] p-btnrbase pb-0">
                        <p className="text-left"><span className="font-bold">{$t('删除团队')}：</span>{$t('删除操作不可恢复，请谨慎操作！')}</p>
                            <div className="text-left">
                            <WithPermission access="system.organization.team.delete" disabled={!canDelete}  tooltip={canDelete ? '':$t('服务数据清除后，方可删除')}>
                                <Button className="m-auto mt-[16px] mb-[20px]" type="default" danger onClick={()=>deleteTeam()}>{$t('删除')}</Button>
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