
import {ActionType} from "@ant-design/pro-components";
import  {FC, useEffect, useMemo, useRef, useState} from "react";
import {Link, useLocation, useParams} from "react-router-dom";
import PageList, { PageProColumns } from "@common/components/aoplatform/PageList.tsx";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {App, Button} from "antd";
import {
    SUBSCRIBE_APPROVAL_INNER_DONE_TABLE_COLUMN,
    SUBSCRIBE_APPROVAL_INNER_TODO_TABLE_COLUMN,
    SubscribeApprovalTableListItem, TODO_LIST_COLUMN_NOT_INCLUDE_KEY
} from "@common/const/approval/const.tsx";
import {BasicResponse, COLUMNS_TITLE, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import {
    SubscribeApprovalModalContent,
    SubscribeApprovalModalHandle
} from "@common/components/aoplatform/SubscribeApprovalModalContent.tsx";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { SimpleMemberItem } from "@common/const/type.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { SubscribeApprovalInfoType } from "@common/const/approval/type.tsx";
import { $t } from "@common/locales";

const SystemInsideApprovalList:FC = ()=>{
    const { setBreadcrumb } = useBreadcrumb()
    const { modal,message } = App.useApp()
    const {serviceId, teamId} = useParams<RouterParams>();
    const [init, setInit] = useState<boolean>(true)
    const {fetchData} = useFetch()
    const [tableHttpReload, setTableHttpReload] = useState(true);
    const [tableListDataSource, setTableListDataSource] = useState<SubscribeApprovalTableListItem[]>([]);
    const pageListRef = useRef<ActionType>(null);
    const query =new URLSearchParams(useLocation().search)
    const [pageStatus,setPageStatus] = useState<0|1>(Number(query.get('status') ||0) as 0|1)
    const subscribeRef = useRef<SubscribeApprovalModalHandle>(null)
    const [approvalBtnLoading,setApprovalBtnLoading] = useState<boolean>(false)
    const [memberValueEnum, setMemberValueEnum] = useState<{[k:string]:{text:string}}>({})
    const {accessData} = useGlobalContext()

    const openModal = async (type:'approval'|'view',entity:SubscribeApprovalTableListItem)=>{
        message.loading(RESPONSE_TIPS.loading)
        const {code,data,msg} = await fetchData<BasicResponse<{approval:SubscribeApprovalInfoType}>>('service/approval/subscribe',{method:'GET',eoParams:{apply:entity!.id, service:serviceId,team:teamId},eoTransformKeys:['apply_project','apply_team','apply_time','approval_time']})
        message.destroy()
        if(code === STATUS_CODE.SUCCESS){
            const modalIns = modal.confirm({
                title:type === 'approval' ? $t('审批') : $t('查看'),
                content:<SubscribeApprovalModalContent ref={subscribeRef} data={{...data.approval}  as SubscribeApprovalInfoType} type={type} serviceId={serviceId!} teamId={teamId!} inSystem/>,
                onOk:()=>{
                    return subscribeRef.current?.save('pass').then((res)=>res === true && manualReloadTable())
                },
                width:600,
                okText:type === 'approval' ? $t('通过') : $t('确认'),
                cancelText:type === 'approval' ?$t('取消'):$t('关闭'),
                okButtonProps:{
                    disabled : type === 'approval' ? !checkAccess('team.service.release.approval', accessData): false
                },
                closable:true,
                onCancel:()=>{setApprovalBtnLoading(false)},
                icon:<></>,
                footer:(_, { OkBtn, CancelBtn }) =>{
                    return (
                        <>
                            {type === 'approval' ? <>
                                    <CancelBtn/>
                                    <WithPermission access="team.service.release.approval"><Button type="primary" danger loading={approvalBtnLoading} onClick={()=>{setApprovalBtnLoading(true);subscribeRef.current?.save('refuse').then((res)=>{if(res === true ){manualReloadTable();modalIns?.destroy()}}).finally(()=>{setApprovalBtnLoading(false)})}}>{$t('拒绝')}</Button></WithPermission>
                                    <OkBtn/>
                                </> :
                                <>
                                    <CancelBtn/>
                                    </>
                            }
                        </>
                    )
                },
            })
        }else{
            message.error(msg || RESPONSE_TIPS.error)
            return
        }
    }

    const operation:PageProColumns<SubscribeApprovalTableListItem>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            btnNums:1,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: SubscribeApprovalTableListItem) => [
                pageStatus === 0 ? 
                <TableBtnWithPermission  access="team.service.subscription.approval" key="approval"  btnType="approval" onClick={()=>{openModal('approval',entity)}} btnTitle="审批"/>
                :<TableBtnWithPermission  access="team.service.subscription.view" key="view"  btnType="view" onClick={()=>{openModal('view',entity)}} btnTitle="查看"/>,
            ],
        }
    ]

    const getApprovalList = ()=>{
        if(!tableHttpReload){
            setTableHttpReload(true)
            return Promise.resolve({
                data: tableListDataSource,
                success: true,
            });
        }
        return fetchData<BasicResponse<{approvals:SubscribeApprovalTableListItem[]}>>('service/approval/subscribes',{method:'GET',eoParams:{service:serviceId,team:teamId, status:(query.get('status') || 0)},eoTransformKeys:['apply_time','apply_project','approval_time']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setTableListDataSource(data.approvals)
                setInit((prev)=>prev ? false : prev)
                return  {data:data.approvals, success: true}
            }else{
                message.error(msg || RESPONSE_TIPS.error)
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
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

    useEffect(() => {
        !init && pageListRef.current?.reload()
    }, [pageStatus]);


    useEffect(() => {
        setPageStatus(Number(query.get('status') ||0) as 0|1)
    }, [query]);

    useEffect(() => {
        setBreadcrumb([
            {
                title:<Link to={`/service/list`}>{$t('服务')}</Link>
            },
            {
                title:$t('订阅审批')
            }
        ])
        getMemberList()
        manualReloadTable()
    }, [serviceId]);

    const manualReloadTable = () => {
        setTableHttpReload(true); // 表格数据需要从后端接口获取
        pageListRef.current?.reload()
    };


    const columns = useMemo(()=>{
        const newCol = [...(!(query.get('status'))? SUBSCRIBE_APPROVAL_INNER_TODO_TABLE_COLUMN:SUBSCRIBE_APPROVAL_INNER_DONE_TABLE_COLUMN)]
        const filteredCol = pageStatus === 0 ? newCol.filter((x)=>TODO_LIST_COLUMN_NOT_INCLUDE_KEY.indexOf(x.dataIndex as string) === -1): newCol
        return filteredCol.map(x=>{if(x.filters &&((x.dataIndex as string[])?.indexOf('applier') !== -1 || (x.dataIndex as string[])?.indexOf('approver') !== -1) ){x.valueEnum = memberValueEnum} return x})
    },[pageStatus,memberValueEnum])

    return (
        <div className="h-full not-top-padding-table">
            <PageList
                id="global_system_approval"
                ref={pageListRef}
                columns = {[...columns,...operation]}
                request={()=>getApprovalList()}
                onChange={() => {
                    setTableHttpReload(false)
                }}
                onRowClick={(row:SubscribeApprovalTableListItem)=>openModal(pageStatus === 0 ? 'approval': 'view',row)}
                tableClickAccess={pageStatus === 0 ?'team.service.subscription.approval':'team.service.subscription.view'}
                tableClass="pr-PAGE_INSIDE_X"
            />
        </div>
    )
}
export default SystemInsideApprovalList