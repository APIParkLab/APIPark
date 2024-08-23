import { ActionType, ParamsType } from "@ant-design/pro-components";
import { App, Button, Divider } from "antd";
import { useState, useRef, useEffect, useMemo, FC } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import PageList, { PageProColumns } from "@common/components/aoplatform/PageList";
import { PublishApprovalModalContent } from "@common/components/aoplatform/PublishApprovalModalContent";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes";
import { PUBLISH_APPROVAL_RECORD_INNER_TABLE_COLUMN, PUBLISH_APPROVAL_VERSION_INNER_TABLE_COLUMN } from "@common/const/approval/const";
import { BasicResponse, COLUMNS_TITLE, DELETE_TIPS, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { SimpleMemberItem } from "@common/const/type.ts";
import { MemberTableListItem } from "../../../const/member/type";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext";
import { useFetch } from "@common/hooks/http";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { SystemPublishReleaseItem } from "../../../const/system/type";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission";
import { useGlobalContext } from "@common/contexts/GlobalStateContext";
import { PERMISSION_DEFINITION } from "@common/const/permissions";
import { checkAccess } from "@common/utils/permission";
import SystemInsidePublishOnline from "./SystemInsidePublishOnline";
import { PublishVersionTableListItem, PublishTableListItem, PublishApprovalInfoType, PublishApprovalModalHandle } from "@common/const/approval/type";
import { DrawerWithFooter } from "@common/components/aoplatform/DrawerWithFooter";
import { $t } from "@common/locales";

const SystemInsidePublicList:FC = ()=>{
    const { setBreadcrumb } = useBreadcrumb()
    const { modal,message } = App.useApp()
    const pageListRef = useRef<ActionType>(null);
    const [tableHttpReload, setTableHttpReload] = useState(true);
    const [init, setInit] = useState<boolean>(true)
    const {fetchData} = useFetch()
    const [tableListDataSource, setTableListDataSource] = useState<MemberTableListItem[]>([]);
    const {serviceId, teamId} = useParams<RouterParams>();
    const drawerRef = useRef<PublishApprovalModalHandle>(null)
    const [extraModalBtnLoading,setExtraModalBtnLoading] = useState<boolean>(false)
    const [pageStatus,setPageStatus] = useState<0|1>(0 as 0|1)
    const [pageType, setPageType] = useState<'insideSystem'|'global'>('insideSystem')
    const query =new URLSearchParams(useLocation().search)
    const currLocation = useLocation().pathname
    const [memberValueEnum, setMemberValueEnum] = useState<{[k:string]:{text:string}}>({})
    const {accessData,state} = useGlobalContext()
    const [drawerTitle, setDrawerTitle] = useState<string>('')
    const [drawerType, setDrawerType] = useState<'approval'|'view'|'add'|'publish'|'online'>('view')
    const [drawerVisible, setDrawerVisible] = useState<boolean>(false)
    const [drawerData, setDrawerData] = useState<PublishTableListItem|PublishVersionTableListItem >({} as PublishTableListItem)
    const [drawerOkTitle, setDrawerOkTitle] = useState<string>('确认')
    const [isOkToPublish, setIsOkToPublish] = useState<boolean>(false)
    const getSystemPublishList = (params?: ParamsType & {
        pageSize?: number | undefined;
        current?: number | undefined;
        keyword?: string | undefined;
    })=>{
        if(!(pageType !== 'insideSystem' && pageStatus !== 0 ) && !tableHttpReload){
            setTableHttpReload(true)
            return Promise.resolve({
                data: tableListDataSource,
                success: true,
            });
        }
        return fetchData<BasicResponse<{releases?:PublishVersionTableListItem[],publishs?:PublishTableListItem[]}>>(
            pageStatus === 0 ? 'service/releases':'service/publishs',
            {method:'GET',eoParams:(pageType !== 'insideSystem' && pageStatus !== 0 )  ? {service:serviceId,team:teamId,page:params?.current,page_size:params?.pageSize}:{service:serviceId,team:teamId},eoTransformKeys:['pageSize','apply_time','approve_time','release_status','is_valid','fail_msg','create_time','can_rollback','flow_id','can_delete']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                const finalRes = pageStatus === 0 ? data.releases.map((x:PublishVersionTableListItem)=>{if(!x.status|| x.status === 'close'){x.status = 'none'} return x}):data.publishs
                setTableListDataSource(finalRes)
                setInit((prev)=>prev ? false : prev)
                return  {data:finalRes, success: true}
            }else{
                message.error(msg || RESPONSE_TIPS.error)
                setInit((prev)=>prev ? false : prev)
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    const handlePublishAction = (type:'rollback'|'delete'|'stop',entity:PublishTableListItem | PublishVersionTableListItem)=>{
        let url:string  ='service/release'
        let method:string
        let params:{[k:string]:unknown} = {}
        switch(type){
            case 'rollback':
                method = 'POST'
                params = {service:serviceId,team:teamId, id:entity.id}
                break;
            case 'delete':
                method = 'DELETE'
                params = {service:serviceId,team:teamId,id:entity.id}
                break;
            case 'stop':
                url = 'service/publish/stop'
                method = 'DELETE'
                params = {service:serviceId,team:teamId,id:(entity as PublishVersionTableListItem).flowId}
                break;
        }

        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>(url,{method,eoParams:params}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || RESPONSE_TIPS.success)
                    resolve(true)
                }else{
                    message.error(msg || RESPONSE_TIPS.error)
                    reject(msg || RESPONSE_TIPS.error)
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })}

        
    const isActionAllowed = (type:'view' | 'delete' | 'add' |'stop'|'online'|'cancel'|'approval' | 'rollback'|'publish') => {
        const permission :keyof typeof PERMISSION_DEFINITION[0]= `team.service.release.${type === 'publish'? 'add' : type}`;
        return !checkAccess(permission, accessData);
        };

    const handleOnline = (entity:PublishTableListItem | PublishVersionTableListItem)=>{
        modal.confirm({
            title:$t('发布结果'),
            content:<SystemInsidePublishOnline serviceId={serviceId!} teamId={teamId!} id={(entity as PublishVersionTableListItem).id}/>,
            width: 600,
            closable: true,
            wrapClassName:'ant-modal-without-footer',
            icon: <></>,
            footer:null,
            onCancel:()=>{
                manualReloadTable()
            }
        });
    }
    
    const openDrawer = async(type: 'view' | 'add'|'online'|'approval'|'publish', entity?: PublishTableListItem|PublishVersionTableListItem)=>{
        setIsOkToPublish(false)
        switch (type) {
            case 'view':{
                message.loading(RESPONSE_TIPS.loading);
                const viewPublish:boolean =  pageStatus !== 0 || ((entity as PublishVersionTableListItem)?.status && (entity as PublishVersionTableListItem)?.status !== 'none') 
                const { code, data, msg } = await fetchData<BasicResponse<{ publish: PublishApprovalInfoType } | { release:SystemPublishReleaseItem}>>(
                    viewPublish ? 'service/publish':'service/release',
                    { method: 'GET', eoParams:{id: (entity as PublishVersionTableListItem)?.[viewPublish && pageStatus === 0  ? 'flowId':'id'],service:serviceId,team:teamId },eoTransformKeys:['cluster_publish_status','upstream_status','doc_status','proxy_status','version_remark'] }
                );
                message.destroy();
                if (code === STATUS_CODE.SUCCESS) {
                    setDrawerTitle($t('查看详情'))
                    setDrawerType(type)
                    setDrawerData(viewPublish ? data.publish : data.release)} else {
                    message.error(msg || RESPONSE_TIPS.error);
                    return
                }
                break;
            }
            case 'online':{
                message.loading(RESPONSE_TIPS.loading);
                const { code, data, msg } = await fetchData<BasicResponse<{ publish: PublishApprovalInfoType }>>(
                    'service/publish',
                    { method: 'GET', eoParams:{ id: (entity as PublishVersionTableListItem)?.flowId,service:serviceId,team:teamId },eoTransformKeys:['version_remark'] }
                );
                message.destroy();
                if (code === STATUS_CODE.SUCCESS) {
                    setDrawerTitle($t('上线'))
                    setDrawerType(type)
                    setDrawerOkTitle($t('上线'))
                    setDrawerData({...data.publish, flowId:(entity as PublishVersionTableListItem)?.flowId})
                } else {
                    message.error(msg || RESPONSE_TIPS.error);
                    return
                }
                break;
            }
            case 'approval':{
                message.loading(RESPONSE_TIPS.loading);
                const { code, data, msg } = await fetchData<BasicResponse<{ publish: PublishApprovalInfoType }>>(
                    'service/publish',
                    { method: 'GET', eoParams:{ id: (entity as PublishVersionTableListItem)?.flowId,service:serviceId,team:teamId },eoTransformKeys:['version_remark'] }
                );
                message.destroy();
                if (code === STATUS_CODE.SUCCESS) {
                    setDrawerTitle($t('审批'))
                    setDrawerType(type)
                    setDrawerData(data.publish)
                    setDrawerOkTitle($t('通过'))
                } else {
                    message.error(msg || RESPONSE_TIPS.error);
                    return
                }
                break;
            }
            case 'publish':
            case 'add':{
                    message.loading(RESPONSE_TIPS.loading);
                    const { code, data, msg } = await fetchData<BasicResponse<{ diffs: PublishApprovalInfoType }>>(
                        'service/publish/check',
                        { method: 'GET', eoParams:{service:serviceId,team:teamId, ...(type === 'publish' ?{ release:entity?.id }:{})},eoTransformKeys:['version_remark'] }
                    );
                    message.destroy();
                    if (code === STATUS_CODE.SUCCESS) {
                        setDrawerTitle($t('申请发布'))
                        setDrawerType(type)
                        setDrawerData({...data, ...(type === 'publish'&& {version:entity?.version, id:entity?.id})})
                        setDrawerOkTitle($t('确认'))
                        setIsOkToPublish(data.isOk??true)
                    } else {
                        message.error(msg || RESPONSE_TIPS.error);
                        return
                    }
                    break;
                }
        }
        setDrawerVisible(true)
    }


    const openModal = async (type:  'delete' |'stop'|'cancel' | 'rollback', entity?: PublishTableListItem|PublishVersionTableListItem) => {
        let title: string = '';
        let content: string | React.ReactNode = '';
        switch (type) {
            case 'delete':
                title = $t('删除');
                content = DELETE_TIPS.default;
                break;
            case 'rollback':
                title = $t('回滚');
                content = $t('请确认是否回滚？');
                break;
            case 'cancel':
                title = $t('撤销申请');
                content = $t('请确认是否撤销申请？');
                break;
            case 'stop':
                title = $t('终止发布');
                content = $t('请确认是否终止发布？');
                break;
        }

        modal.confirm({
            title,
            content,
            onOk: () => {
                switch (type){
                    case 'rollback':
                        return handlePublishAction('rollback',entity!).then((res)=>{if(res === true)manualReloadTable()})
                    case 'delete':
                        return handlePublishAction('delete',entity!).then((res)=>{if(res === true)manualReloadTable()})
                    case 'cancel':
                    case 'stop':
                        return handlePublishAction('stop',entity!).then((res)=>{if(res === true)manualReloadTable()})
                }
            },
            width: 600,
            okText: $t('确认'),
            cancelText: $t('取消'),
            onCancel:()=>{setExtraModalBtnLoading(false)},
            closable: true,
            icon: <></>,
            okButtonProps:{
                disabled: isActionAllowed(type) || false
            },
            footer: (_, { OkBtn, CancelBtn }) => (
                <> 
                      <CancelBtn />
                      <WithPermission>
                        <OkBtn />
                      </WithPermission>
                </>
            ),
        });
    };

    const tableOperation = (entity:PublishTableListItem | PublishVersionTableListItem)=>{
        const viewBtn = <TableBtnWithPermission  access="team.service.release.view" key="view" btnType="view"  onClick={()=>{openDrawer('view',entity)}} btnTitle="查看详情"/>
        let btnArr:React.ReactNode[] = []
        if(pageType !== 'insideSystem' && pageStatus !== 0){
            btnArr =  [
                    viewBtn
                ]
            return btnArr
        }

        if((entity as PublishVersionTableListItem).status === 'accept'){
            btnArr =  [
                    <TableBtnWithPermission  access="team.service.release.online" key="online"  btnType="online"  onClick={()=>{openDrawer('online',entity)}} btnTitle="上线"/>,
                    <Divider type="vertical" className="mx-0"  key="div1"/>,
                    viewBtn,
                    <Divider type="vertical" className="mx-0"  key="div2"/>,
                    <TableBtnWithPermission  access="team.service.release.stop" key="stop"  btnType="stop"  onClick={()=>{openModal('stop',entity)}} btnTitle="终止发布"/>
                ]
        }

        
        if((entity as PublishVersionTableListItem).status === 'publishing'){
            btnArr =  [
                    viewBtn,
                    <Divider type="vertical" className="mx-0"  key="div2"/>,
                    <TableBtnWithPermission  access="team.service.release.stop" key="stop" btnType="stop"   onClick={()=>{openModal('stop',entity)}} btnTitle="终止发布"/>
                ]
        }

        if((entity as PublishVersionTableListItem).status === 'apply'){
            btnArr =  [
                    <TableBtnWithPermission  access="team.service.release.approval" key="approval" btnType="approval" onClick={()=>{openDrawer('approval',entity)}} btnTitle="审批"/>,
                    <Divider type="vertical" className="mx-0"  key="div1"/>,
                    viewBtn,
                    <Divider type="vertical" className="mx-0"  key="div2"/>,
                    <TableBtnWithPermission  access="team.service.release.cancel" key="cancel" btnType="cancel" onClick={()=>{openModal('cancel',entity)}} btnTitle="撤回申请"/>
                ]
        }

        // 第一期不做回滚
        // if( (entity as PublishVersionTableListItem).status === 'online' && (entity as PublishVersionTableListItem).canRollback){
        //     btnArr =  [...btnArr,
        //             ...(btnArr.length > 0  ?  [<Divider type="vertical" className="mx-0" />]:
        //             [viewBtn,
        //             <Divider type="vertical" className="mx-0" />]),
        //             <WithPermission access="team.service.release.rollback"><Button  className="h-[22px] border-none p-0 flex items-center bg-transparent " key="rollback" onClick={()=>openModal('rollback',entity)}>回滚版本</Button></WithPermission>
        //         ]
        // }

        if( ['close','refuse','none'].indexOf((entity as PublishVersionTableListItem).status as string) !== -1 || !(entity as PublishVersionTableListItem).flowId){
            btnArr =  [...btnArr,
                    ...(btnArr.length > 0  ? [<Divider type="vertical" className="mx-0"  key="div1" />]:
                    [viewBtn,
                    // <Divider type="vertical" className="mx-0"  key="div1"/>
                ]),
                    // <TableBtnWithPermission  access="team.service.release.add" key="publish"  onClick={()=>{openDrawer('publish',entity)}} btnTitle="申请发布"/>
                ]
        }

        if( ['running','error'].indexOf((entity as PublishVersionTableListItem).status as string) !== -1 && (entity as PublishVersionTableListItem).flowId){
            btnArr = [viewBtn]
        }

        if((entity as PublishVersionTableListItem).canDelete){
            btnArr = [...btnArr, btnArr.length > 0 && <Divider type="vertical" className="mx-0"  key="div5"/>,<TableBtnWithPermission  access="team.service.release.delete" key="delete" btnType="delete" onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/> ]
        }

        return btnArr

    }

    const operation:PageProColumns<PublishTableListItem>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            btnNums:pageStatus === 0 ? 2 : 1,
            valueType: 'option',
            fixed:'right',
            render: (_: React.ReactNode, entity: PublishTableListItem|PublishVersionTableListItem) => tableOperation(entity)
        }
    ]

    useEffect(() => {
        setBreadcrumb([
            {
                title:<Link to={`/service/list`}>{$t('服务')}</Link>
            },
            {
                title:$t('发布')
            }
        ])
        getMemberList()
        manualReloadTable()
    }, [serviceId]);

    
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

    const columns = useMemo(()=>{
        return ((pageType === 'insideSystem' || pageStatus === 0 ) ? PUBLISH_APPROVAL_VERSION_INNER_TABLE_COLUMN:PUBLISH_APPROVAL_RECORD_INNER_TABLE_COLUMN).map(x=>{if(x.filters &&(x.dataIndex as string[])?.indexOf('creator') !== -1){x.valueEnum = memberValueEnum} return {...x,title:typeof x.title  === 'string' ? $t(x.title as string) : x.title}})
    },[pageType, pageStatus, memberValueEnum,state.language])

    useEffect(() => {
        !init && pageListRef.current?.reload()
    }, [pageStatus]);

    
    useEffect(() => {
        setPageStatus(Number(query.get('status') ||0) as 0|1)
    }, [query]);

    useEffect(()=>{
        setPageType(currLocation.split('/')[0] === 'service' ? 'insideSystem' : 'global')
    },[currLocation])

    const manualReloadTable = () => {
        setTableHttpReload(true); // 表格数据需要从后端接口获取
        pageListRef.current?.reload()
    };

    const drawerActions = {
        approval: () => drawerRef.current?.save('pass'),
        add: () => drawerRef.current?.publish(),
        publish: () => drawerRef.current?.publish(true),
        online: () => drawerRef.current?.online(),
      };

      
    const onSubmit = () => {
        const action = drawerActions[drawerType as keyof typeof drawerActions];
        if (action) {
            return action()?.then((res) => {
                if(drawerType === 'add' && res){
                    handleOnline((res as unknown as Record<string, unknown>)?.data?.publish)
                }
                if (res === true && (drawerType === 'online' || drawerType === 'add')) {
                    handleOnline(drawerData)
                }else if(res === true){
                    manualReloadTable();
                }
                return res;
            });
        } else {
        return Promise.resolve(true);
        }
    };
    return (
        <>
            <PageList
                id="global_system_publish"
                ref={pageListRef}
                columns = {[...columns,...operation]}
                request = {(params: ParamsType & {
                    pageSize?: number | undefined;
                    current?: number | undefined;
                    keyword?: string | undefined;
                })=>getSystemPublishList(params)}
                addNewBtnTitle={pageStatus === 0 ? $t("新建版本"):''}
                onAddNewBtnClick={()=>{openDrawer('add')}}
                addNewBtnAccess="team.service.release.add"
                onChange={() => {
                    setTableHttpReload(false)
                }}
                onRowClick={(row:PublishTableListItem|PublishVersionTableListItem)=>openDrawer('view',row)}
                tableClickAccess="team.service.release.view"
                tableClass="pr-PAGE_INSIDE_X"
            />
            <DrawerWithFooter 
              destroyOnClose={true} 
              title={drawerTitle}
              width={'60%'}
              onClose={()=>{setDrawerVisible(false)}}
              open={drawerVisible}
              okBtnTitle={drawerOkTitle}
              submitDisabled={drawerType === 'add' ? !isOkToPublish : false}
              submitAccess={`team.service.release.${drawerType === 'publish'? 'add' : drawerType}`}
              cancelBtnTitle={drawerType === 'online' ? $t('关闭') : undefined}
              showOkBtn={drawerType !== 'view'}
              onSubmit={onSubmit}
              extraBtn={(drawerType === 'approval'||drawerType === 'online')  ? <WithPermission access={`team.service.release.${drawerType === 'approval'? 'approval' : 'stop'}`}>
                    <Button
                        type={drawerType === 'approval'? "primary" : 'default'}
                        danger={drawerType === 'approval'}
                        loading={extraModalBtnLoading}
                        className={`${drawerType === 'online'? 'text-theme border-theme':''}`}
                        onClick={() => {
                            setExtraModalBtnLoading(true);
                            if(drawerType === 'approval'){
                                drawerRef.current?.save('refuse').then((res) => {
                                    if (res === true) {
                                        setDrawerVisible(false);manualReloadTable();
                                    }
                                }).finally(() => {
                                    setExtraModalBtnLoading(false);
                                });
                            }else{
                                handlePublishAction('stop', drawerData!).then((res) => {
                                    if (res === true) {
                                        setDrawerVisible(false);manualReloadTable();
                                    }
                                }).finally(() => {
                                setExtraModalBtnLoading(false);
                                });
                                }
                        }}
                    >
                        {drawerType === 'approval'? $t("拒绝") : $t('终止发布')}
                    </Button>
                    </WithPermission> :undefined}
              >
                <PublishApprovalModalContent insideSystem ref={drawerRef}
                                                        data={drawerData as PublishVersionTableListItem } type={drawerType} serviceId={serviceId!} teamId={teamId!} />
            </DrawerWithFooter>
        </>
    )
}
export default SystemInsidePublicList