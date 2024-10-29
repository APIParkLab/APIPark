import {App, Form, Input, TreeSelect} from "antd";
import {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { MemberDropdownModalHandle, MemberDropdownModalProps, DepartmentListItem, MemberDropdownModalFieldType, MemberTableListItem } from "../../const/member/type.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { $t } from "@common/locales/index.ts";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";

export const MemberDropdownModal = forwardRef<MemberDropdownModalHandle,MemberDropdownModalProps>((props,ref)=>{
    const { message} = App.useApp()
    const [form] = Form.useForm();
    const {type,entity,selectedMemberGroupId} = props
    const {fetchData} = useFetch()
    const [departmentList, setDepartmentList] = useState<DepartmentListItem[]>([])
    const { state } = useGlobalContext()

    const save:()=>Promise<boolean | string> =  ()=>{
        let url:string
        let method:string
        switch (type){
            case 'addDep':
            case 'addChild':
                url = 'user/department'
                method = 'POST'
                break;
            case 'rename':
                url = 'user/department'
                method = 'PUT'
                break
            case 'addMember':
                url = 'user/account'
                method = 'POST'
                break
            case 'editMember':
                url = 'user/account'
                method = 'PUT'
                break
        }
        return new Promise((resolve, reject)=>{
            if(!url || !method){
                reject($t(RESPONSE_TIPS.error))
                return
            }
            form.validateFields().then((value)=>{
                fetchData<BasicResponse<null>>(url,
                    {method,
                    ...(type !== 'addDep' && type !== 'addMember' && {eoParams: {id:entity!.id}}),
                    eoBody:({
                        ...value,
                        ...(value?.departmentIds ?{ departmentIds:Array.isArray(value?.departmentIds)? value?.departmentIds : [value?.departmentIds]}:{}),
                    }),eoTransformKeys:['departmentIds']}).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || $t(RESPONSE_TIPS.success))
                        resolve(true)
                    }else{
                        message.error(msg || $t(RESPONSE_TIPS.error))
                        reject(msg || $t(RESPONSE_TIPS.error))
                    }
                }).catch((errorInfo)=> reject(errorInfo))
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    useImperativeHandle(ref, ()=>({
            save
        })
    )

    const getDepartmentList = ()=>{
        fetchData<BasicResponse<{departments:DepartmentListItem[]}>>('user/departments',{method:'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setDepartmentList([{...data.departments,disabled:true}])
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                return {data:[], success:false}
            }
        })
    }

    useEffect(() => {
        switch(type){
            case 'addChild':
                form.setFieldsValue({parent:entity!.id})
                break
            case 'rename':
                form.setFieldsValue({id:entity!.id,name:entity!.name})
                break
            case 'addMember':
                form.setFieldsValue('-1' === selectedMemberGroupId ? {} : {departmentIds:selectedMemberGroupId})
                break
            case 'editMember':
                form.setFieldsValue({...entity,departmentIds:(entity as MemberTableListItem )?.department?.map(x=>x.id)})
                break
        }
        getDepartmentList()

    }, []);

    
    const treeData = useMemo(() => {
        const loop = (data: DepartmentListItem[]): unknown[] =>
            data?.map((item) => {
                const title = ['unknown','disable'].indexOf(item.id) === -1 ?item.name :  $t(item.name) as string;
                if (item.children) {
                    return {...item,name:title, children:loop(item.children)}
                }

                return {
                    ...item,
                    name: title
                };
            });
        return loop(departmentList);
    }, [departmentList,state.language]);


    return (<WithPermission access="">
        <Form
            layout='vertical'
            scrollToFirstError
            labelAlign='left'
            form={form}
            className="mx-auto "
            name="MemberDropdownModal"
            autoComplete="off"
        >

            {type === 'rename' &&
                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("ID")}
                    name="id"
                    hidden
                    rules={[{ required: true,whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                </Form.Item>
            }
            {(type === 'addDep' || type === 'rename') &&
                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("部门名称")}
                    name="name"
                    rules={[{ required: true,whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                </Form.Item>}

            {type === 'addChild' &&<>
                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("父部门 ID")}
                    name="parent"
                    hidden
                    rules={[{ required: true,whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                </Form.Item>

                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("子部门名称")}
                    name="name"
                    rules={[{ required: true,whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                </Form.Item>
            </>
            }

            {(type === 'addMember'|| type ==='editMember') && <>
                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("用户名")}
                    name="name"
                    rules={[{required: true,whitespace:true }]}
                >
                    <Input className="w-INPUT_NORMAL" disabled={type ==='editMember'} placeholder={$t(PLACEHOLDER.input)}/>
                </Form.Item>
                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("邮箱")}
                    name="email"
                    rules={[{required: true,whitespace:true },{type:"email",message: $t(VALIDATE_MESSAGE.email)}]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                </Form.Item>
                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("部门")}
                    name="departmentIds"
                >
                    <TreeSelect
                            className="w-INPUT_NORMAL"
                            fieldNames={{label:'name',value:'id',children:'children'}}
                            showSearch
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            placeholder={$t(PLACEHOLDER.select)}
                            allowClear
                            treeDefaultExpandAll
                            treeData={treeData}
                            multiple
                        />
                </Form.Item>
            </>
            }
        </Form>
    </WithPermission>)
})