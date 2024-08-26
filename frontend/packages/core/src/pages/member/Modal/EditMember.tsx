
import { App, Form, Input, TreeSelect } from "antd";
import { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE } from "@common/const/const";
import { MemberDropdownModalHandle, MemberDropdownModalProps, DepartmentListItem, MemberTableListItem, MemberDropdownModalFieldType } from "../../../const/member/type";
import { useFetch } from "@common/hooks/http";
import { $t } from "@common/locales";

export const EditMemberModal = forwardRef<MemberDropdownModalHandle,MemberDropdownModalProps>((props,ref)=>{
    const { message} = App.useApp()
    const [form] = Form.useForm();
    const {type,entity,selectedMemberGroupId} = props
    const {fetchData} = useFetch()
    const [departmentList, setDepartmentList] = useState<DepartmentListItem[]>([])

    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
            fetchData<BasicResponse<null>>('user/account',
                    {method:type === 'addMember' ? 'POST' : 'PUT',
                    eoBody:({
                        ...value,
                        ...(value?.departmentIds ?{ departmentIds:Array.isArray(value?.departmentIds)? value?.departmentIds : [value?.departmentIds]}:{}),
                        ...(type !== 'addDep' && type !== 'addMember' && {eoParams: {id:entity!.id}})
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
                setDepartmentList([{...data.departments,children:data.departments.children?.filter((x)=>['unknown','disable'].indexOf(x.id) === -1),disabled:true}])
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                return {data:[], success:false}
            }
        })
    }

    useEffect(() => {
        switch(type){
            case 'addMember':
                form.setFieldsValue( (!selectedMemberGroupId || ['-1','disable','unknown'].indexOf(selectedMemberGroupId.toString()) !== -1 )? {} : {departmentIds:[selectedMemberGroupId]})
                break
            case 'editMember':
                form.setFieldsValue({...entity,departmentIds:(entity as MemberTableListItem )?.department?.map(x=>x.id)})
                break
        }
        getDepartmentList()

    }, []);


    return (<WithPermission access="">
        <Form
            layout='vertical'
            scrollToFirstError
            labelAlign='left'
            form={form}
            className="mx-auto "
            name="EditMember"
            autoComplete="off"
        >
                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("用户名")}
                    name="name"
                    rules={[{required: true,whitespace:true }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                </Form.Item>
                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("邮箱")}
                    name="email"
                    rules={[{required: true,whitespace:true },{type:"email",message: $t(VALIDATE_MESSAGE.email)}]}
                >
                    <Input className="w-INPUT_NORMAL" disabled={type ==='editMember'} placeholder={$t(PLACEHOLDER.input)}/>
                </Form.Item>
                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("部门")}
                    name="departmentIds"
                >
                    <TreeSelect
                            className="w-INPUT_NORMAL"
                            disabled={type ==='editMember'}
                            fieldNames={{label:'name',value:'id',children:'children'}}
                            showSearch
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            placeholder={$t(PLACEHOLDER.input)}
                            allowClear
                            treeDefaultExpandAll
                            treeData={departmentList}
                            multiple
                        />
                </Form.Item>
        </Form>
    </WithPermission>)
})