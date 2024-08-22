
import PageList, { PageProColumns } from "@common/components/aoplatform/PageList.tsx"
import {ActionType} from "@ant-design/pro-components";
import  {FC, useEffect, useMemo, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {App, Divider, Modal} from "antd";
import {BasicResponse, COLUMNS_TITLE, DELETE_TIPS, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import { SimpleMemberItem } from "@common/const/type.ts";
import {useFetch} from "@common/hooks/http.ts";
import { TEAM_TABLE_COLUMNS } from "../../const/team/const.tsx";
import { TeamConfigFieldType, TeamConfigHandle, TeamTableListItem } from "../../const/team/type.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import TeamConfig from "./TeamConfig.tsx";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";
import { $t } from "@common/locales/index.ts";

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
    const {accessData,checkPermission,accessInit, getGlobalAccessData} = useGlobalContext()
    const [curTeam, setCurTeam] = useState<TeamConfigFieldType>({} as TeamConfigFieldType)
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [modalType, setModalType] = useState<'add'|'edit'>('add')

    const getTeamList = ()=>{
        if(!accessInit){
            getGlobalAccessData()?.then(()=>{getTeamList()})
            return
        }
        return fetchData<BasicResponse<{teams:TeamTableListItem}>>(!checkPermission('system.workspace.team.view_all') ? 'teams':'manager/teams',{method:'GET',eoParams:{keyword:searchWord},eoTransformKeys:['create_time','service_num','can_delete']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                return  {data:data.teams, success: true}
            }else{
                message.error(msg || RESPONSE_TIPS.error)
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
                    message.success(msg || RESPONSE_TIPS.success)
                    resolve(true)
                }else{
                    message.error(msg || RESPONSE_TIPS.error)
                    reject(msg || RESPONSE_TIPS.error)
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
            message.error(msg || RESPONSE_TIPS.error)
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
                message.loading(RESPONSE_TIPS.loading)
                const {code,data,msg} = await fetchData<BasicResponse<{team:TeamConfigFieldType}>>(`manager/team`,{method:'GET',eoParams:{id:entity!.id}})
                message.destroy()
                if(code === STATUS_CODE.SUCCESS){
                    setCurTeam({...data.team,master:data.team.master.id})
                    setModalVisible(true)
                }else{
                    message.error(msg || RESPONSE_TIPS.error)
                    return
                }
                setModalType('edit')
                return;}
            case 'delete':
                title=$t('删除')
                content=DELETE_TIPS.default
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
            okText:$t('确认'),
            okButtonProps:{
                disabled : !checkAccess( `system.organization.team.${type}`, accessData)
            },
            cancelText:$t('取消'),
            closable:true,
            icon:<></>,
        })
    }

    const operation:PageProColumns<TeamTableListItem>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            fixed:'right',
            btnNums:2,
            valueType: 'option',
            render: (_: React.ReactNode, entity: TeamTableListItem) => [
                    <TableBtnWithPermission  access="" key="view" btnType="view" navigateTo={`../inside/${entity.id}/setting`} btnTitle="查看"/>,
                    <Divider type="vertical" className="mx-0"  key="div2"/>,
                    <TableBtnWithPermission  access="system.organization.team.delete" key="delete" btnType="delete" disabled={!entity.canDelete} tooltip="服务数据清除后，方可删除" onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/>,
            ],
        }
    ]

    useEffect(() => {
        setBreadcrumb([
            {title: $t('团队')}
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
                pageTitle={$t('团队')} 
                description={$t("设置团队和成员，然后你可以在团队内创建服务和应用、订阅API，成员只能看到所属团队内的服务和应用。")}
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
                addNewBtnTitle={$t('添加团队')}
                addNewBtnAccess = "system.organization.team.add"
                searchPlaceholder={$t("输入名称、ID、负责人查找团队")}
                onAddNewBtnClick={()=>{openModal('add')}}
                onSearchWordChange={(e)=>{setSearchWord(e.target.value)}}
                onRowClick={(row:TeamTableListItem)=>(navigate(`../inside/${row.id}/setting`))}
            />
            <Modal
                title={modalType === 'add' ? $t("添加团队") : $t("配置团队")}
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
                okText={$t("确认")}
                okButtonProps={{disabled : !checkAccess( `system.organization.team.edit`, accessData)}}
                cancelText={$t('取消')}
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