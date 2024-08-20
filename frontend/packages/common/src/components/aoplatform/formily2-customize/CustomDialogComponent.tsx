
import {forwardRef,useImperativeHandle} from 'react'
import { createSchemaField } from '@formily/react'
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
import { CustomCodeboxComponent } from './CustomCodeboxComponent.tsx'
import { SimpleMapComponent } from './SimpleMapComponent.tsx'
import { $t } from '@common/locales/index.ts'

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
    FormDialog,
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
    SimpleMapComponent
  }
})

export const CustomDialogComponent = forwardRef(
  (props: { [k: string]: unknown }, ref) => {
    const { onChange, title, value, render } = props
    useImperativeHandle(ref, () => ({}))
    let editPage: boolean = false
    try {
      editPage = Object.keys(JSON.parse(JSON.stringify(value))).length > 0
    } catch {}

    return (
      <FormDialog.Portal>
        <span
          className="ant-formily-array-base-config"
          onClick={() => {
            const dialog = FormDialog(
              editPage ? $t('编辑(0)',[title||'']) : $t('添加(0)',[title||'']),
              () => {
                return (
                  <FormLayout
                  //  labelCol={6} 
                  layout={'vertical'}
                  scrollToFirstError
                  name="CustomDialogComponent"
                  // wrapperCol={10} 
                  form={value}>
                    <SchemaField schema={JSON.parse(render)} />
                  </FormLayout>
                )
              }
            )
            dialog
              .forOpen((payload, next) => {
                next({
                  initialValues: value
                })
              })
              .forConfirm((payload, next) => {
                next(payload)
              })
              .forCancel((payload, next) => {
                next(payload)
              })
              .open()
              .then(onChange)
          }}
        >
          <svg style={{ width: '16px', height: '16px' }}>
            <use href="#tool"></use>
          </svg>
        </span>
      </FormDialog.Portal>
    )
  }
)
