
import PageList from "@common/components/aoplatform/PageList.tsx"
import {ActionType, ProColumns} from "@ant-design/pro-components";
import  {FC, useEffect, useMemo, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {App, Divider, Modal} from "antd";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import { SimpleMemberItem } from "@common/const/type.ts";
import {useFetch} from "@common/hooks/http.ts";
import { TEAM_TABLE_COLUMNS } from "../../const/team/const.tsx";
import { TeamConfigFieldType, TeamConfigHandle, TeamTableListItem } from "../../const/team/type.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import TeamConfig from "./TeamConfig.tsx";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";

const TeamList:FC = ()=>{
    const [searchWord, setSearchWord] = useState<string>('')
    const navigate = useNavigate();
    const location = useLocation()
    const currentUrl = location.pathname
    const { setBreadcrumb } = useBreadcrumb()
    const { modal,message } = App.useApp()
    const pageListRef = useRef<ActionType>(null);
    const {fetchData} = useFetch()
    const [memberValueEnum, setMemberValueEnum] = useState<{[k:string]:{text:string}}>({})
    const teamConfigRef = useRef<TeamConfigHandle>(null)
    const {accessData,checkPermission} = useGlobalContext()
    const [curTeam, setCurTeam] = useState<TeamConfigFieldType>({} as TeamConfigFieldType)
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [modalType, setModalType] = useState<'add'|'edit'>('add')

    const getTeamList = ()=>{
        return fetchData<BasicResponse<{teams:TeamTableListItem}>>(!checkPermission('system.workspace.team.view_all') ? 'teams':'manager/teams',{method:'GET',eoParams:{keyword:searchWord},eoTransformKeys:['create_time','service_num','can_delete']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                return  {data:data.teams, success: true}
            }else{
                message.error(msg || '操作失败')
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    const deleteTeam = (entity:TeamTableListItem)=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>(`manager/team`,{method:'DELETE',eoParams:{id:entity.id}}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || '操作成功！')
                    resolve(true)
                }else{
                    message.error(msg || '操作失败')
                    reject(msg || '操作失败')
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }
    
    const getMemberList = async ()=>{
        setMemberValueEnum({})
        const {code,data,msg}  = await fetchData<BasicResponse<{ members: SimpleMemberItem[] }>>('simple/member',{method:'GET'})
        if(code === STATUS_CODE.SUCCESS){
            const tmpValueEnum:{[k:string]:{text:string}} = {}
            data.members?.forEach((x:SimpleMemberItem)=>{
                tmpValueEnum[x.name] = {text:x.name}
            })
            setMemberValueEnum(tmpValueEnum)
        }else{
            message.error(msg || '操作失败')
        }
    }

    const manualReloadTable = () => {
        pageListRef.current?.reload()
    };

    const openModal = async (type:'add'|'edit'|'delete',entity?:TeamTableListItem)=>{
        //console.log(type,entity)
        let title:string = ''
        let content:string | React.ReactNode= ''
        switch (type){
            case 'add':{
                setModalType('add')
                setModalVisible(true)
                return;}
            case 'edit':{
                message.loading('正在加载数据')
                const {code,data,msg} = await fetchData<BasicResponse<{team:TeamConfigFieldType}>>(`manager/team`,{method:'GET',eoParams:{id:entity!.id}})
                message.destroy()
                if(code === STATUS_CODE.SUCCESS){
                    setCurTeam({...data.team,master:data.team.master.id})
                    setModalVisible(true)
                }else{
                    message.error(msg || '操作失败')
                    return
                }
                setModalType('edit')
                return;}
            case 'delete':
                title='删除'
                content='该数据删除后将无法找回，请确认是否删除？'
                break;
        }

        modal.confirm({
            title,
            content,
            onOk:()=>{
                switch (type){
                    case 'delete':
                        return deleteTeam(entity!).then((res)=>{if(res === true) manualReloadTable()})
                }
            },
            width:600,
            okText:'确认',
            okButtonProps:{
                disabled : !checkAccess( `system.organization.team.${type}`, accessData)
            },
            cancelText:'取消',
            closable:true,
            icon:<></>,
        })
    }

    const operation:ProColumns<TeamTableListItem>[] =[
        {
            title: '操作',
            key: 'option',
            fixed:'right',
            width:  96,
            valueType: 'option',
            render: (_: React.ReactNode, entity: TeamTableListItem) => [
                    <TableBtnWithPermission  access="" key="view" navigateTo={`../inside/${entity.id}/setting`} btnTitle="查看"/>,
                    <Divider type="vertical" className="mx-0"  key="div2"/>,
                    <TableBtnWithPermission  access="system.organization.team.delete" key="delete"  disabled={!entity.canDelete} tooltip="服务数据清除后，方可删除" onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/>,
            ],
        }
    ]

    useEffect(() => {
        setBreadcrumb([
            {title: '团队'}
        ])
        manualReloadTable()
    }, [currentUrl]);

    useEffect(()=>{
        getMemberList()
    },[])

    const columns = useMemo(()=>{
        return TEAM_TABLE_COLUMNS.map(x=>{if(x.filters &&((x.dataIndex as string[])?.indexOf('master') !== -1 ) ){x.valueEnum = memberValueEnum} return x})
    },[memberValueEnum])


    return (
            <InsidePage 
                pageTitle='团队' 
                description="设置团队和成员，然后你可以在团队内创建服务和应用、订阅API，成员只能看到所属团队内的服务和应用。"
                showBorder={false}
                contentClassName=" pr-PAGE_INSIDE_X pb-PAGE_INSIDE_B"
                >
            <PageList
                id="global_team"
                className="pl-btnbase"
                ref={pageListRef}
                columns = {[...columns,...operation]}
                request = {()=>getTeamList()}
                showPagination={false}
                addNewBtnTitle='添加团队'
                addNewBtnAccess = "system.organization.team.add"
                searchPlaceholder="输入名称、ID、负责人查找团队"
                onAddNewBtnClick={()=>{openModal('add')}}
                onSearchWordChange={(e)=>{setSearchWord(e.target.value)}}
                onRowClick={(row:TeamTableListItem)=>(navigate(`../inside/${row.id}/setting`))}
            />
            <Modal
                title={modalType === 'add' ? "添加团队" : "配置团队"}
                open={modalVisible}
                width={600}
                destroyOnClose={true}
                maskClosable={false}
                afterOpenChange={(open:boolean)=>{
                    if(!open){
                        setModalVisible(false)
                        setCurTeam({} as unknown as TeamConfigFieldType)
                    }
                }}
                onCancel={() => {setModalVisible(false)}}
                okText="确认"
                okButtonProps={{disabled : !checkAccess( `system.organization.team.edit`, accessData)}}
                cancelText='取消'
                closable={true}
                onOk={()=>teamConfigRef.current?.save().then((res)=>{
                    if(res){
                        setModalVisible(false)
                        manualReloadTable()
                    }
                    return res})}
            >
                <TeamConfig ref={teamConfigRef} inModal entity={modalType === 'add' ? undefined : curTeam} />
            </Modal>
        </InsidePage>
    )

}
export default TeamList