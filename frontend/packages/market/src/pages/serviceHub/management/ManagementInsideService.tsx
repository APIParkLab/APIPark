import { MoreOutlined, SearchOutlined } from "@ant-design/icons"
import { Card, Input,Button ,Dropdown,App, Tag, Empty } from "antd"
import { debounce } from "lodash-es"
import { forwardRef, useEffect, useState } from "react"
import { VirtuosoGrid } from "react-virtuoso"
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const"
import { useFetch } from "@common/hooks/http"
import { SubscribeApprovalInfoType } from "@common/const/approval/type"
import { useOutletContext, useParams } from "react-router-dom"
import { RouterParams } from "@core/components/aoplatform/RenderRoutes"
import { TenantManagementServiceListItem } from "../../../const/serviceHub/type"
import { ApprovalModalContent } from "./ApprovalModalContent"
import { checkAccess } from "@common/utils/permission"
import { useGlobalContext } from "@common/contexts/GlobalStateContext"
import { $t } from "@common/locales"

export default function ManagementInsideService(){
    const {message, modal} = App.useApp()
    const [serviceList, setServiceList] = useState<TenantManagementServiceListItem[]>([])
    const {fetchData} = useFetch()
    const {teamId,appId} = useParams<RouterParams>()
    const [keyword, setKeyword] = useState<string>('')
    const { refreshGroup} = useOutletContext<{refreshGroup:()=>void}>()
    const {accessData} = useGlobalContext()

    const onSearchWordChange = (e)=>{
        setKeyword(e.target.value)
    }
  
    const cancelSubscribeApply = (entity:TenantManagementServiceListItem) => {
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>('application/subscription/cancel_apply',{method:'POST',eoParams:{subscription:entity.id!,application:appId!,team:teamId}}).then(response=>{
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

    const cancelSubscribe = (entity:TenantManagementServiceListItem) => {
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>('application/subscription/cancel',{method:'POST',eoParams:{subscription:entity.id!,application:appId!,team:teamId}}).then(response=>{
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
    
    const openModal =async (type:'view'|'cancelSub'|'cancelSubApply',entity?:TenantManagementServiceListItem)=>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'view':{
                message.loading(RESPONSE_TIPS.loading)
                const {code,data,msg} = await fetchData<BasicResponse<{approval:SubscribeApprovalInfoType}>>('app/subscription/approval',{method:'GET',eoParams:{subscription:entity!.id, app:appId,team:teamId},eoTransformKeys:['apply_project','apply_team','apply_time','approval_time']})
                message.destroy()
                if(code === STATUS_CODE.SUCCESS){
                    title=$t('审批详情')
                        content = <ApprovalModalContent data={data.approval} type={type} systemId={appId}/>;
                }else{
                    message.error(msg || RESPONSE_TIPS.error)
                    return
                }
                break;
            }
            case 'cancelSub':
                title=$t('取消订阅')
                content=$t('请确认是否取消订阅？')
                break;
            case 'cancelSubApply':
                title=$t('取消订阅申请')
                content=$t('请确认是否取消订阅申请？')
                break;
        }

        modal.confirm({
            title,
            content,
            onOk:()=>{
                switch (type){
                    case 'view':
                        return true
                    case 'cancelSubApply':
                        return cancelSubscribeApply(entity!).then(res=>{if(res){getServiceList(); refreshGroup?.()}} )
                    case 'cancelSub':
                        return cancelSubscribe(entity!).then(res=>{if(res){getServiceList(); refreshGroup?.()}} )
                }
            },
            width:600,
            okText:$t('确认'),
            okButtonProps:{
                disabled : !checkAccess( `team.application.authorization.${type}`, accessData)
            },
            cancelText:$t('取消'),
            closable:true,
            icon:<></>,
        })
    }


    const dropdownMenu = (entity:TenantManagementServiceListItem) => [
        // {
        //     key: 'edit',
        //     label: (
        //         // <WithPermission access="system.organization.member.department.add" key="addChildPermission">
        //             <Button key="edit" type="text" className="h-[32px] border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('view',entity)}>
        //             审批记录
        //         </Button>
        //         // </WithPermission>
        //     ),
        // },
        entity.applyStatus === 1 ? {
            key: 'cancelSubApply',
            label: (
                // <WithPermission access="system.organization.member.department.delete"  key="deletePermission">
                    <Button key="cancelSubApply" type="text" className="h-[32px] border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('cancelSubApply',entity)}>
                    {$t('取消订阅申请')}
                </Button>
                // </WithPermission>
            ),
        }:{
            key: 'cancelSub',
            label: (
                // <WithPermission access="system.organization.member.department.delete"  key="deletePermission">
                    <Button key="cancelSub" type="text" className="h-[32px] border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('cancelSub',entity)}>
                    {$t('取消订阅')}
                </Button>
                // </WithPermission>
            ),
        },
    ]

    const getServiceList = ()=>{
        fetchData<BasicResponse<{subscriptions:TenantManagementServiceListItem}>>('application/subscriptions',{method:'GET', eoParams:{application:appId,team:teamId},eoTransformKeys:['apply_status']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setServiceList(data.subscriptions && data.subscriptions.length > 0 ? [...data.subscriptions] : [])
                // return  {data:data.services, success: true,total:data.total}
            }else{
                message.error(msg || RESPONSE_TIPS.error)
                // return {data:[], success:false}
            }
        })
    }


    useEffect(() => {
        getServiceList()
    }, []);

    return (<div className=" mx-auto h-full pt-[32px]">
        <div className="flex items-center justify-between w-full ml-[10px] text-[18px] leading-[25px] pb-[18px]" >
            <span className="font-bold">{$t('服务')}</span>
            <Input className="w-[200px] mr-[20px] rounded-[20px]" onChange={ onSearchWordChange ?  (e) => debounce(onSearchWordChange, 100)(e) : undefined  } onPressEnter={()=>getServiceList()} allowClear placeholder={$t('搜索服务')}  prefix={<SearchOutlined className="cursor-pointer" onClick={()=>{getServiceList()}}/>}/>
        </div>
        { (keyword ? serviceList.filter(x=>x.service.name.includes(keyword)) :serviceList)?.length > 0 ? 
        <VirtuosoGrid
                style={{ height: 'calc(100% - 75px)'}}
                data={keyword ? serviceList.filter(x=>x.service.name.includes(keyword)) :serviceList}
                totalCount={(keyword ? serviceList.filter(x=>x.service.name.includes(keyword)) :serviceList).length}
                itemContent={(index) => {
                    const item = (keyword ? serviceList.filter(x=>x.service.name.includes(keyword)) :serviceList)[index];
                return (<Card className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] m-[10px]" classNames={{body:' flex items-center justify-center'}} >
                        <div className="flex items-center justify-between w-full"><span><span>{item.service.name}</span>{ item.applyStatus === 1 && 
                            <Tag className="ml-[8px]" bordered={false} color="orange">{$t('审批中')}</Tag>
                        }</span>
                        <div>
                            <Button  type="text" className="bg-[#7371fc20] hover:bg-[#7371fc19] text-theme" onClick={()=>window.open(`/serviceHub/detail/${item.service.id}`,'_blank')}>{$t('API 文档')}</Button>
                            <Dropdown className="ml-btnbase" menu={{items:dropdownMenu(item)}}  trigger={['hover']} >
                            <Button type="text" className="px-[7px]" onClick={(e)=>{ e.stopPropagation();}}><MoreOutlined  rotate={90} className="tree-title-more" onClick={(e)=>{ e.stopPropagation();}} /></Button></Dropdown></div></div>
                  </Card>
                );
                }}
                components={{
                    List: forwardRef(({ style, children, ...props }, ref) => (
                    <div
                        ref={ref}
                        {...props}
                        style={{
                            display: 'grid',
                        ...style,
                        }}
                    >
                        {children}
                    </div>
                    )),
                    Item: ({ children, ...props }) => (
                    <>
                        {children}</>
                    )
                }}
            />:<div className="bg-[#fafafa] overflow-hidden rounded-[10px]" ><Empty className="m-[50px] "image={Empty.PRESENTED_IMAGE_SIMPLE}/></div>}
    </div>)
}