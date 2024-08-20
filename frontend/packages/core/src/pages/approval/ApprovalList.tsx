import {ActionType} from "@ant-design/pro-components";
import {App, Button} from "antd";
import  {useEffect, useMemo, useRef, useState} from "react";
import PageList, { PageProColumns } from "@common/components/aoplatform/PageList.tsx";
import {
    PUBLISH_APPROVAL_TABLE_COLUMN,
    SUBSCRIBE_APPROVAL_TABLE_COLUMN,
    TODO_LIST_COLUMN_NOT_INCLUDE_KEY
} from "@common/const/approval/const.tsx";
import {
    ApprovalTableListItem,
    PublishApprovalInfoType,
    PublishApprovalModalHandle,
    SubscribeApprovalInfoType,
} from "@common/const/approval/type.tsx";
import {BasicResponse, COLUMNS_TITLE, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {
    SubscribeApprovalModalContent,
    SubscribeApprovalModalHandle
} from "@common/components/aoplatform/SubscribeApprovalModalContent.tsx";
import {
    PublishApprovalModalContent,
    
} from "@common/components/aoplatform/PublishApprovalModalContent.tsx";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { SimpleMemberItem } from "@common/const/type.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { $t } from "@common/locales";

export default function ApprovalList({pageType,pageStatus}:{pageType:'subscribe'|'release',pageStatus:0|1}){
    const { modal,message } = App.useApp()
    const [searchWord, setSearchWord] = useState<string>('')
    // const [confirmLoading, setConfirmLoading] = useState(false);
    const pageListRef = useRef<ActionType>(null);
    const [init, setInit] = useState<boolean>(true)
    const {fetchData} = useFetch()
    const [tableHttpReload, setTableHttpReload] = useState(true);
    const [tableListDataSource, setTableListDataSource] = useState<ApprovalTableListItem[]>([]);
    const subscribeRef = useRef<SubscribeApprovalModalHandle>(null)
    const publishRef = useRef<PublishApprovalModalHandle>(null)
    const [approvalBtnLoading,setApprovalBtnLoading] = useState<boolean>(false)
    const [memberValueEnum, setMemberValueEnum] = useState<{[k:string]:{text:string}}>({})

    const getApprovalList = ()=>{
        if(!tableHttpReload){
            setTableHttpReload(true)
            return Promise.resolve({
                data: tableListDataSource,
                success: true,
            });
        }
        return fetchData<BasicResponse<{approvals:ApprovalTableListItem,}>>( `approval/${pageType}s`,{method:'GET',eoParams:{keyword:searchWord,status:pageStatus},eoTransformKeys:['apply_time','apply_project','approval_time']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setTableListDataSource(data.approvals)
                !init && message.success(msg || RESPONSE_TIPS.success)
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

    useEffect(()=>{
        getMemberList()
    },[])

    useEffect(() => {
        getApprovalList();
    }, [pageType,pageStatus]);

    const openModal = async(type:'approval'|'view',entity:ApprovalTableListItem)=>{
        message.loading(RESPONSE_TIPS.loading)
        const {code,data,msg} = await fetchData<BasicResponse<{approval:PublishApprovalInfoType|SubscribeApprovalInfoType}>>(`approval/${pageType}`,{method:'GET',eoParams:{id:entity!.id},eoTransformKeys:['apply_project','apply_team','apply_time','approval_time']})
        message.destroy()
        if(code === STATUS_CODE.SUCCESS){
            const modalInst = modal.confirm({
                title:type === 'approval' ? $t('审批') : $t('查看'),
                content:pageType === 'subscribe' ?
                    <SubscribeApprovalModalContent ref={subscribeRef} data={data.approval  as SubscribeApprovalInfoType} type={type}/>
                    :<PublishApprovalModalContent ref={publishRef} data={data.approval  as PublishApprovalInfoType} type={type} systemId={''}/>,
                onOk:()=>{
                    if(type === 'approval'){
                        return (pageType === 'subscribe'? subscribeRef.current?.save('pass') : publishRef.current?.save('pass'))?.then((res)=> {
                            res === true && manualReloadTable
                        })
                    }
                },
                width:600,
                okText:type === 'approval' ? $t('通过') :$t('确认'),
                cancelText:$t('取消'),
                closable:true,
                onCancel:()=>{setApprovalBtnLoading(false)},
                icon:<></>,
                footer:(_, { OkBtn, CancelBtn }) =>{
                    return (
                        <>
                            {type === 'approval' ? <>
                                    <CancelBtn/>
                                    <WithPermission access=""><Button type="primary" danger loading={approvalBtnLoading} onClick={()=>{setApprovalBtnLoading(true); (pageType === 'subscribe' ? subscribeRef : publishRef)?.current?.save('refuse').then((res)=>{if(res === true){manualReloadTable();modalInst?.destroy()}}).finally(()=>{setApprovalBtnLoading(false); })}}>拒绝</Button></WithPermission>
                                    <WithPermission access=""><OkBtn/></WithPermission>
                                </> :
                                <>
                                    <CancelBtn/>
                                    <WithPermission access=""><OkBtn/></WithPermission></>
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

    const operation:PageProColumns<ApprovalTableListItem>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            btnNums:1,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: ApprovalTableListItem) => [
                pageStatus === 0 ?
                <TableBtnWithPermission  access="" key="approval"  btnType="approval" onClick={()=>{openModal('approval',entity)}} btnTitle="审批"/>
                :<TableBtnWithPermission  access="" key="view"  btnType="publish" onClick={()=>{openModal('view',entity)}} btnTitle="查看"/>,
            ]
        }
    ]

    const columns = useMemo(()=>{
        const newCol = [...(pageType === 'subscribe'? SUBSCRIBE_APPROVAL_TABLE_COLUMN:PUBLISH_APPROVAL_TABLE_COLUMN)]
        const res = pageStatus === 0 ? newCol.filter((x)=>TODO_LIST_COLUMN_NOT_INCLUDE_KEY.indexOf(x.dataIndex as string) === -1): newCol
        return res
    },[pageType,pageStatus])


    const manualReloadTable = () => {
        setTableHttpReload(true); // 表格数据需要从后端接口获取
        pageListRef.current?.reload()
    };

    return (
        <div className="h-full">
            <PageList
                id="global_approval"
                ref={pageListRef}
                request={(_,sorter)=>getApprovalList(sorter as { [k: string]: string; } | undefined)}
                dataSource={tableListDataSource}
                columns = {[...columns,...operation]}
                searchPlaceholder="输入申请人、服务、团队查找"
                onSearchWordChange={(e) => {
                    setSearchWord(e.target.value)
                }}
                onChange={() => {
                    setTableHttpReload(false)
                }}
                onRowClick={(row:ApprovalTableListItem)=>openModal(pageStatus === 0 ? 'approval': 'view',row)}
            />
        </div>
    )
}