import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import { action } from '@formily/reactive'
import {
    FormItem,
    Space,
    ArrayItems,
    DatePicker,
    Editable,
    FormButtonGroup,
    Input,
    Radio,
    Select,
    Submit,
    Cascader,
    Form,
    FormGrid,
    FormLayout,
    Upload,
    ArrayCollapse,
    ArrayTable,
    ArrayTabs,
    Checkbox,
    FormCollapse,
    FormDialog,
    FormDrawer,
    FormStep,
    FormTab,
    NumberPicker,
    Password,
    PreviewText,
    Reset,
    SelectTable,
    Switch,
    TimePicker,
    Transfer,
    TreeSelect,
    ArrayCards
} from '@formily/antd-v5'
import { createForm } from '@formily/core'
import {CustomCodeboxComponent} from "@common/components/aoplatform/formily2-customize/CustomCodeboxComponent.tsx";
import {SimpleMapComponent} from "@common/components/aoplatform/formily2-customize/SimpleMapComponent.tsx";
import {CustomDialogComponent} from "@common/components/aoplatform/formily2-customize/CustomDialogComponent.tsx";
import {ArrayItemBlankComponent} from "@common/components/aoplatform/formily2-customize/ArrayItemBlankComponent.tsx";
import {DefaultOptionType} from "antd/es/cascader";
import {createSchemaField, FormProvider, RecursionField, useField, useForm} from "@formily/react";
import {BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {App} from "antd";
import { $t } from "@common/locales";

export const DynamicRender = (props) => {
    const {schema} = props
    const field = useField()
    const form = useForm()
    const [renderSchema, setRenderSchema] = useState({})
   
    useEffect(() => {
        form.clearFormGraph(`${field.address}.*`)
        try{
            const parsedSchema = JSON.parse(schema)
            setRenderSchema(parsedSchema[form?.values?.driver])
        }catch(e){
            console.error('渲染出错',e?.message)
        }
    }, [form.values.driver])

    return (
        <RecursionField
            basePath={field.address}
            schema={renderSchema}
            onlyRenderProperties
        />
    )
}



export type IntelligentPluginConfigProps = {
    type:'add'|'edit'
    renderSchema:unknown
    tabData:DefaultOptionType[]
    moduleId:string
    driverSelectionOptions:DefaultOptionType[]
    entityId?:string
    initFormValue:{[k:string]:unknown}
}

export type IntelligentPluginConfigHandle = {
    save:()=>Promise<boolean | string>
}

const SchemaField = createSchemaField({
    components: {
        ArrayCards,
        ArrayCollapse,
        ArrayItems,
        ArrayTable,
        ArrayTabs,
        Cascader,
        Checkbox,
        DatePicker,
        Editable,
        Form,
        FormButtonGroup,
        FormCollapse,
        // @ts-ignore
        FormDialog,
        // @ts-ignore
        FormDrawer,
        FormGrid,
        FormItem,
        FormLayout,
        FormStep,
        FormTab,
        Input,
        NumberPicker,
        Password,
        PreviewText,
        Radio,
        Reset,
        Select,
        SelectTable,
        Space,
        Submit,
        Switch,
        TimePicker,
        Transfer,
        TreeSelect,
        Upload,
        CustomCodeboxComponent,
        SimpleMapComponent,
        CustomDialogComponent,
        ArrayItemBlankComponent,
        DynamicRender
    }
})

export const IntelligentPluginConfig =  forwardRef<IntelligentPluginConfigHandle,IntelligentPluginConfigProps>((props,ref)=>{
    const { type,renderSchema,moduleId,driverSelectionOptions,initFormValue}  = props
    const { message } = App.useApp()
    const {fetchData} = useFetch()
    const form = createForm({ validateFirst: type === 'edit' })
    form.setInitialValues(initFormValue || {})

    const pluginEditSchema = {
        type: 'object',
        properties: {
            layout: {
              type: 'void',
              'x-component': 'FormLayout',
              'x-component-props': {
                labelCol: 6,
                wrapperCol: 10,
                layout: 'vertical',
              },
              properties: {
                id: {
                    type: 'string',
                    title: $t('ID'),
                    required: true,
                    pattern: /^[a-zA-Z][a-zA-Z0-9-_]*$/,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                        labelCol:4,
                        wrapperCol: 20,
                        labelAlign:'left'
                    },
                    'x-component': 'Input',
                    'x-component-props': {
                        placeholder: PLACEHOLDER.specialStartWithAlphabet,
                    },
                    'x-disabled': type === 'edit'
                },
                title: {
                    type: 'string',
                    title: $t('名称'),
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                        labelCol:4,
                        wrapperCol: 20,
                        labelAlign:'left'
                    },
                    'x-component': 'Input',
                    'x-component-props': {
                        placeholder: PLACEHOLDER.input,
                    }
                },
                driver: {
                    type: 'string',
                    title: $t('Driver'),
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                        labelCol:4,
                        wrapperCol: 20,
                        labelAlign:'left'
                    },
                    'x-component': 'Select',
                    'x-component-props': {
                        disabled: type === 'edit'
                    },
                    'x-display': driverSelectionOptions.length > 1 ? 'visible' : 'hidden',
                    enum: [...driverSelectionOptions]
                },
                description: {
                    type: 'string',
                    title: $t('描述'),
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                        labelCol:4,
                        wrapperCol: 20,
                        labelAlign:'left'
                    },
                    'x-component': 'Input.TextArea',
                    'x-component-props': {
                        placeholder: PLACEHOLDER.input,
                    }
                },
                config: {
                    type: 'object',
                    'x-component': 'DynamicRender',
                    'x-component-props': {
                        schema: JSON.stringify(renderSchema),
                    }
                }
            }
        }
    }
}


    const save :()=>Promise<boolean | string> = ()=>{
        return new Promise((resolve, reject)=>{
            form.validate().then(()=>{
                fetchData<BasicResponse<null>>(type === 'add'?`dynamic/${moduleId}`:`dynamic/${moduleId}/config`,{method:type === 'add'? 'POST' : 'PUT',eoBody:form.values, eoParams:{...(type !== 'add' && {id:initFormValue.id})}}).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || RESPONSE_TIPS.success)
                        resolve(true)
                    }else{
                        message.error(msg || RESPONSE_TIPS.error)
                        reject(msg || RESPONSE_TIPS.error)
                    }
                }).catch((errorInfo)=> reject(errorInfo))
            }).catch((errorInfo:unknown)=> reject(errorInfo))
        })
    }

    useImperativeHandle(ref, ()=>({
        save
    })
    )


    const getSkillData = async (skill: string) => {
        return new Promise((resolve,reject) => {
            fetchData<BasicResponse<{[k:string]:Array<{name:string,title:string}>}>>(`api/common/provider/${skill}`,{method:'GET'}).then(response=>{
                const {code,data,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    resolve(data[skill]?.map((x:{name:string,title:string})=>{return{label:x.title, value:x.name}}) || [])
                }else{
                    message.error(msg || RESPONSE_TIPS.error)
                    reject(msg || RESPONSE_TIPS.error)
                }
            })
        })
    }

    const useAsyncDataSource =
        (service: unknown, skill: string) => (field: unknown) => {
            field.loading = true
            service(skill).then(
                action.bound &&
                action.bound((data: unknown) => {
                    field.dataSource = data
                    field.loading = false
                })
            )
        }
    return (
        <div  className="pl-[12px]">
            <FormProvider form={form}>
                <SchemaField
                    schema={pluginEditSchema}
                    scope={{ useAsyncDataSource, getSkillData, form }}
                />
            </FormProvider>
        </div>)
})