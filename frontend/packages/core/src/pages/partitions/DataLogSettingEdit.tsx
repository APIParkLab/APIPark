import EditableTable from "@common/components/aoplatform/EditableTable"
import WithPermission from "@common/components/aoplatform/WithPermission"
import { BasicResponse, PLACEHOLDER, STATUS_CODE } from "@common/const/const"
import { useFetch } from "@common/hooks/http"
import { $t } from "@common/locales"
import { PARTITION_DATA_LOG_CONFIG_TABLE_COLUMNS, PartitionDataLogConfigFieldType, PartitionDataLogHeaderListFieldType } from "@core/const/partitions/types"
import { Button, Form, Input, message } from "antd"
import { useEffect } from "react"

export type DashboardPageShowStatus = 'view' | 'edit'
export type DashboardSettingEditProps = {
  changeStatus: (status: DashboardPageShowStatus) => void
  refreshData: () => void
  data?: PartitionDataLogConfigFieldType
}
const DataLogSettingEdit = (props: DashboardSettingEditProps) => {
  const { changeStatus, refreshData, data } = props
  const [form] = Form.useForm();
  const { fetchData } = useFetch()

  const onFinish = () => {
    form.validateFields().then((value) => {
      const formData = {
        config: {
          url: value.url,
          headers: value.headers.filter((item: PartitionDataLogHeaderListFieldType) => item.key).map((item: PartitionDataLogHeaderListFieldType) => ({key:item.key, value:item.value || ''}))
        }
      }
      fetchData<BasicResponse<{ info: PartitionDataLogConfigFieldType }>>('log/loki', { method: 'POST', body: JSON.stringify(formData), eoParams: {} }).then(response => {
        const { code, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          message.success(msg || $t('操作成功，即将刷新页面'))
          refreshData?.()
        } else {
          message.error(msg || $t('操作失败'))
        }
      })
    })
  }

  useEffect(() => { form.setFieldsValue(data) }, [data])

  useEffect(() => {
    return (form.setFieldsValue({}))
  }, []);
  return (
    <>
      <div className="overflow-auto h-full">
        <WithPermission access={''} >
          <Form
            form={form}
            className="mx-auto flex flex-col justify-between h-full"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item<PartitionDataLogConfigFieldType>
              label={$t("请求前缀")}
              name="url"
              rules={[{ required: true }]}
            >
              <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
            </Form.Item>

            <Form.Item<PartitionDataLogConfigFieldType>
              label={$t("HTTP 头部")}
              name="headers"
            >
              <EditableTable<PartitionDataLogConfigFieldType & { _id: string }>
                configFields={PARTITION_DATA_LOG_CONFIG_TABLE_COLUMNS}
              />
            </Form.Item>
            <div className="flex gap-btnbase">
              <WithPermission access='system.devops.data_source.edit'>
                <Button type="primary" htmlType="submit">
                  {$t('保存')}
                </Button>
              </WithPermission>
              <Button type="default" onClick={() => changeStatus('view')}>
                {$t('取消')}
              </Button>
            </div>
          </Form>
        </WithPermission>
      </div>
    </>
  );
}

export default DataLogSettingEdit;