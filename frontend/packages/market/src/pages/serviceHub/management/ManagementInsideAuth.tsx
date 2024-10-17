import { MoreOutlined } from "@ant-design/icons"
import { message, Card, Button, Tag, Dropdown, App, Empty } from "antd"
import { useState, useEffect, forwardRef, useRef } from "react"
import { VirtuosoGrid } from "react-virtuoso"
import { BasicResponse, DELETE_TIPS, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const"
import { useFetch } from "@common/hooks/http"
import { EditAuthFieldType, SystemAuthorityTableListItem } from "@core/const/system/type"
import { useParams } from "react-router-dom"
import { RouterParams } from "@core/components/aoplatform/RenderRoutes"
import { useTenantManagementContext } from "../../../contexts/TenantManagementContext"
import { ManagementAuthorityConfig, ManagementAuthorityConfigHandle } from "./ManagementAuthorityConfig"
import { ManagementAuthorityView } from "./ManagementAuthorityView"
import { checkAccess } from "@common/utils/permission"
import { useGlobalContext } from "@common/contexts/GlobalStateContext"
import dayjs from 'dayjs';
import { $t } from "@common/locales"

export default function ManagementInsideAuth(){
    const {modal} = App.useApp()
    const {fetchData} = useFetch()
    const [authList, setAuthList] = useState<SystemAuthorityTableListItem[]>([])
    const {appId,teamId}  = useParams<RouterParams>()
    const addRef = useRef<ManagementAuthorityConfigHandle>(null)
    const editRef = useRef<ManagementAuthorityConfigHandle>(null)
    const {accessData} = useGlobalContext()


    const getSystemAuthority = ()=>{
        return fetchData<BasicResponse<{authorizations:SystemAuthorityTableListItem[]}>>('app/authorizations',{method:'GET',eoParams:{app:appId, team:teamId},eoTransformKeys:['hide_credential','create_time','update_time','expire_time']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setAuthList(data.authorizations)
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    useEffect(() => {
        getSystemAuthority()
    }, []);

    
    const deleteAuthority = (entity:SystemAuthorityTableListItem)=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>('app/authorization',{method:'DELETE',eoParams:{authorization:entity!.id,app:appId, team:teamId}}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    resolve(true)
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    reject(msg || $t(RESPONSE_TIPS.error))
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }
    
    const openModal =async (type:'view'|'delete'|'add'|'edit',entity?:SystemAuthorityTableListItem)=>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'view':{
                title=$t('鉴权详情')
                message.loading($t(RESPONSE_TIPS.loading))
                const {code,data,msg} = await fetchData<BasicResponse<{details:{[k:string]:string}}>>('app/authorization/details',{method:'GET',eoParams:{authorization:entity!.id,app:appId, team:teamId}})
                message.destroy()
                if(code === STATUS_CODE.SUCCESS){
                    content=<ManagementAuthorityView entity={data.details}/>
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    return
                }}
                break;
            case 'add':
                title=$t('添加鉴权')
                content=<ManagementAuthorityConfig ref={addRef} type={type} appId={appId!} teamId={teamId!}/>
                break;
            case 'edit':{
                title=$t('编辑鉴权')
                message.loading($t(RESPONSE_TIPS.loading))
                const {code,data,msg} = await fetchData<BasicResponse<{authorization:EditAuthFieldType}>>('app/authorization',{method:'GET',eoParams:{authorization:entity!.id,app:appId, team:teamId},eoTransformKeys:['hide_credential','token_name','expire_time','user_name','public_key','user_path','claims_to_verify','signature_is_base64']})
                message.destroy()
                if(code === STATUS_CODE.SUCCESS){
                    content=<ManagementAuthorityConfig ref={editRef} type={type} data={data.authorization} appId={appId!} teamId={teamId!}/>
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    return
                }}
                break;
            case 'delete':
                title=$t('删除')
                content=$t(DELETE_TIPS.default)
                break;
        }

        modal.confirm({
            title,
            content,
            onOk:()=>{
                switch (type){
                    case 'add':
                        return addRef.current?.save().then((res)=>{if(res === true) getSystemAuthority()})
                    case 'edit':
                        return editRef.current?.save().then((res)=>{if(res === true) getSystemAuthority()})
                    case 'delete':
                        return deleteAuthority(entity!).then((res)=>{if(res === true) getSystemAuthority()})
                    case 'view':
                        return true
                }
            },
            width:600,
            okText: $t('确认'),
            okButtonProps:{
                disabled : !checkAccess( `team.application.authorization.${type}`, accessData)
            },
            cancelText:type === 'view'? $t('关闭'):$t('取消'),
            closable:true,
            icon:<></>,
            footer:(_, { OkBtn, CancelBtn }) =>{
                return(<>
                    <CancelBtn />
                    {type !== 'view' && <OkBtn />}</>
                )
            }

        })
    }


    const dropdownMenu = (entity:SystemAuthorityTableListItem) => [
        {
            key: 'edit',
            label: (
                    <Button key="edit" type="text" className="h-[32px] border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('edit',entity)}>
                   {$t('修改')}
                </Button>
            ),
        },
        {
            key: 'delete',
            label: (
                    <Button key="delete" type="text" className="h-[32px] border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('delete',entity)}>
                    {$t('删除')}
                </Button>
            ),
        },
    ]

    return (<div className=" h-full pt-[32px]">
        <div className="flex items-center justify-between w-full  ml-[10px] text-[18px] leading-[25px] pb-[16px]" ><span className="font-bold">{$t('访问授权')}</span></div>
        <div><Button className="mb-[20px] ml-[10px]" type="primary" onClick={()=>openModal('add')}>{$t('添加授权')}</Button></div>
        {authList && authList.length > 0 ? <VirtuosoGrid
                style={{ height: 'calc(100% - 93px)'}}
                data={authList}
                totalCount={authList.length}
                itemContent={(index) => {
                    const item = authList[index];
                return (<Card className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] m-[10px]" classNames={{body:' flex items-center justify-center p-[20px]'}} >
                    <div className="w-full">
                        <div className="flex items-start justify-between w-full"><span>{item.name}</span><div><Button  type="text" className="bg-[#7371fc20] hover:bg-[#7371fc19] text-theme" onClick={()=>openModal('view',item)}>{$t('查看')}</Button><Dropdown className="ml-btnbase" menu={{items:dropdownMenu(item)}}  trigger={['hover']} >
                    <Button type="text" className="px-[7px]" onClick={(e)=>{ e.stopPropagation();}}><MoreOutlined  rotate={90} className="tree-title-more" /></Button>
               </Dropdown></div></div>
                        <div> 
                            <Tag bordered={false} color="orange">{`${item.driver.substring(0,1).toLocaleUpperCase()}${item.driver.substring(1)}`}</Tag>
                            <Tag bordered={false}>{item.expireTime === 0 ?$t('永不过期')   : `${$t('到期时间')}：${dayjs(item.expireTime * 1000).format('YYYY-MM-DD hh:mm:ss')}`}</Tag></div>
                    </div>
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
            /> : <div className="bg-[#fafafa] overflow-hidden rounded-[10px]" ><Empty className="m-navbar-height "image={Empty.PRESENTED_IMAGE_SIMPLE}/></div>}
    </div>)
}