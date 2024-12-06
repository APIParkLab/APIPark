import {ActionType} from "@ant-design/pro-components";
import  {FC, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {App, Form,TreeSelect} from "antd";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes.tsx";
import {BasicResponse, COLUMNS_TITLE, DELETE_TIPS, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE} from "@common/const/const.tsx";
import PageList, { PageProColumns } from "@common/components/aoplatform/PageList.tsx";
import {DefaultOptionType} from "antd/es/cascader";
import { SYSTEM_SUBSCRIBER_TABLE_COLUMNS } from "../../const/system/const.tsx";
import { SystemSubscriberTableListItem, SystemSubscriberConfigFieldType, SystemSubscriberConfigHandle, SystemSubscriberConfigProps, SimpleSystemItem } from "../../const/system/type.ts";
import {  SimpleMemberItem } from "@common/const/type.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { $t } from "@common/locales/index.ts";

const SystemInsideSubscriber:FC = ()=>{
    const { setBreadcrumb } = useBreadcrumb()
    const { modal,message } = App.useApp()
    const {fetchData} = useFetch()
    const {serviceId, teamId} = useParams<RouterParams>()
    const addRef = useRef<SystemSubscriberConfigHandle>(null)
    const pageListRef = useRef<ActionType>(null);
    const [memberValueEnum, setMemberValueEnum] = useState<SimpleMemberItem[]>([])
    const {accessData,state} = useGlobalContext()
    const getSystemSubscriber = ()=>{
        return fetchData<BasicResponse<{subscribers:SystemSubscriberTableListItem[]}>>('service/subscribers',{method:'GET',eoParams:{service:serviceId,team:teamId},eoTransformKeys:['apply_time']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                return  {data:data.subscribers, success: true}
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    const getMemberList = async ()=>{
        setMemberValueEnum([])
        const {code,data,msg}  = await fetchData<BasicResponse<{ members: SimpleMemberItem[] }>>('simple/member',{method:'GET'})
        if(code === STATUS_CODE.SUCCESS){
            setMemberValueEnum(data.members)
        }else{
            message.error(msg || $t(RESPONSE_TIPS.error))
        }
    }

    const manualReloadTable = () => {
        pageListRef.current?.reload()
    };

    const deleteSubscriber = (entity:SystemSubscriberTableListItem)=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>('service/subscriber',{method:'DELETE',eoParams:{application:entity!.id,service:entity!.service.id,team:teamId}}).then(response=>{
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

    const openModal =async (type:'delete'|'add',entity?:SystemSubscriberTableListItem)=>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'add':
                title=$t('新增订阅方')
                content=<SystemSubscriberConfig ref={addRef} serviceId={serviceId!} teamId={teamId!}/>
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
                        return addRef.current?.save().then((res)=>{if(res === true) manualReloadTable()})
                    case 'delete':
                        return deleteSubscriber(entity!).then((res)=>{if(res === true) manualReloadTable()})
                }
            },
            width:600,
            okText:$t('确认'),
            okButtonProps:{
                disabled : !checkAccess( `team.service.subscription.${type}`, accessData)
            },
            cancelText:$t('取消'),
            closable:true,
            icon:<></>,
        })
    }

    const operation:PageProColumns<SystemSubscriberTableListItem>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            btnNums:1,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: SystemSubscriberTableListItem) => [
                <TableBtnWithPermission  access="team.service.subscription.delete" key="delete"  btnType="delete" onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/>,
            ],
        }
    ]

    useEffect(() => {
        setBreadcrumb([
            {
                title:<Link to={`/service/list`}>{$t('服务')}</Link>
            },
            {
                title:$t('订阅方管理')
            }
        ])
        getMemberList()
        manualReloadTable()
    }, [serviceId]);

    const columns = useMemo(()=>{
        return [...SYSTEM_SUBSCRIBER_TABLE_COLUMNS].map(x=>{
            if(x.filters &&((x.dataIndex as string[])?.indexOf('applier') !== -1 || (x.dataIndex as string[])?.indexOf('approver') !== -1) ){
                const tmpValueEnum:{[k:string]:{text:string}} = {}
                memberValueEnum?.forEach((x:SimpleMemberItem)=>{
                    tmpValueEnum[x.name] = {text:x.name}
                })
                x.valueEnum = tmpValueEnum
            }
            if(x.dataIndex === 'from'){
                x.valueEnum = new Map([
                    [0,<span>{$t('手动添加')}</span>],
                    [1,<span>{$t('订阅申请')}</span>],
                ])
            }
            return {
                ...x,title:typeof x.title  === 'string' ? $t(x.title as string) : x.title}
            }
        )
    },[memberValueEnum,state.language])

    return (
        <PageList
            id="global_system_subscriber"
            ref={pageListRef}
            columns = {[...columns,...operation]}
            request={()=>getSystemSubscriber()}
            // dataSource={tableListDataSource}
            showPagination={false}
            addNewBtnTitle={$t("新增订阅方")}
            onAddNewBtnClick={()=>{openModal('add')}}
            addNewBtnAccess="team.service.subscription.add"
            tableClass="pr-PAGE_INSIDE_X"
        />
    )
}

export default SystemInsideSubscriber

export const SystemSubscriberConfig = forwardRef<SystemSubscriberConfigHandle,SystemSubscriberConfigProps>((props, ref) => {
    const { message } = App.useApp()
    const { serviceId, teamId} = props
    const [form] = Form.useForm();
    const {fetchData} = useFetch()
    const [systemOptionList, setSystemOptionList] = useState<DefaultOptionType[]>()
    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
                fetchData<BasicResponse<null>>('service/subscriber',{method:'POST',eoBody:({...value}), eoParams:{service:serviceId,team:teamId}}).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || $t(RESPONSE_TIPS.success))
                        resolve(true)
                    }else{
                        message.error(msg || $t(RESPONSE_TIPS.error))
                        reject(msg || $t(RESPONSE_TIPS.error))
                    }
                })
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    useImperativeHandle(ref, ()=>({
            save
        })
    )


    const getSystemList = ()=>{
        setSystemOptionList([])
        fetchData<BasicResponse<{ apps: SimpleSystemItem[] }>>('simple/apps/mine',{method:'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                const teamMap = new Map<string, unknown>();
                data.apps
                    .filter((x:SimpleSystemItem)=>x.id !== serviceId)
                    .forEach((item:SimpleSystemItem) => {
                    if (!teamMap.has(item.team.id)) {
                        teamMap.set(item.team.id, {
                            title: item.team.name,
                            value: item.team.id,
                            key: item.team.id,
                            children: [],
                            selectable: false, // 第一级不可选
                            disabled:true
                                      });
                    }

                    teamMap.get(item.team.id)!.children!.push({
                        title: item.name,
                        value: item.id,
                        key: item.id,
                        selectable: true, // 子级可选
                        // partition:item.partition?.map((x:EntityItem)=>x.id) || []
                    });
                });
                setSystemOptionList(Array.from(teamMap.values()))
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        })
    }


    useEffect(() => {
        getSystemList()
    }, [serviceId]);

    return  (<WithPermission access="">
        <Form
            layout='vertical'
            labelAlign='left'
            scrollToFirstError
            form={form}
            className="mx-auto  "
            name="systemInsideSubscriber"
            autoComplete="off"
        >
            <Form.Item<SystemSubscriberConfigFieldType>
                label={$t("订阅方")}
                name="application"
                rules={[{ required: true }]}
            >
                <TreeSelect
                    className="w-INPUT_NORMAL" 
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={systemOptionList}
                    placeholder={$t(PLACEHOLDER.input)}
                    treeDefaultExpandAll
                />
            </Form.Item>

        </Form>
    </WithPermission>)
})