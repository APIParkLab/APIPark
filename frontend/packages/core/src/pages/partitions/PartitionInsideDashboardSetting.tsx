import { FC, useEffect, useState } from "react";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext.tsx";
import { App, Button, Card, Col, Row, Spin, Tag } from "antd";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const.tsx";
import { useFetch } from "@common/hooks/http.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { LoadingOutlined } from "@ant-design/icons";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";
import { $t } from "@common/locales/index.ts";
import DashboardSettingEdit, { DashboardPageShowStatus } from "./DashboardSettingEdit.tsx";
import { PARTITION_DATA_LOG_CONFIG_TABLE_COLUMNS, PartitionDashboardConfigFieldType, PartitionDataLogConfigFieldType } from "@core/const/partitions/types.ts";
import PageList from "@common/components/aoplatform/PageList.tsx";
import DataLogSettingEdit from "./DataLogSettingEdit.tsx";

const PartitionInsideDashboardSetting: FC = () => {
  const { setBreadcrumb } = useBreadcrumb()
  const { message } = App.useApp()
  const { fetchData } = useFetch()
  const [data, setData] = useState<PartitionDashboardConfigFieldType>()
  const [dataLogData, setDataLogData] = useState<PartitionDataLogConfigFieldType>()
  const [loading, setLoading] = useState<boolean>(false)
  const [dataLogLoading, setDataLogLoading] = useState<boolean>(false)
  const [showGraphStatus, setShowGraphStatus] = useState<DashboardPageShowStatus>('view')
  const [showDataLogStatus, setShowDataLogStatus] = useState<DashboardPageShowStatus>('view')

  const getDashboardSettingInfo = () => {
    setLoading(true)
    return fetchData<BasicResponse<{ nodes: PartitionDashboardConfigFieldType[] }>>('monitor/config', { method: 'GET', eoTransformKeys: [] }).then(response => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        data?.info?.driver && setData(data.info)
        setShowGraphStatus('view')
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    }).catch(() => {
      return { data: [], success: false }
    }).finally(() => {
      setLoading(false)
    })
  }
  const getDataLogSettingInfo = () => {
    setDataLogLoading(true)
    return fetchData<BasicResponse<{ nodes: PartitionDataLogConfigFieldType[] }>>('log/loki', { method: 'GET', eoTransformKeys: [] }).then(response => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        data?.info && setDataLogData({
          url: data.info?.config?.url || '',
          headers: data.info?.config?.headers  || []
        })
        setShowDataLogStatus('view')
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    }).catch(() => {
      return { data: [], success: false }
    }).finally(() => {
      setDataLogLoading(false)
    })
  }

  useEffect(() => {
    setBreadcrumb([
      { title: $t('数据源') }
    ])
    getDashboardSettingInfo()
    getDataLogSettingInfo()
  }, []);

  const setDashboardSettingBtn = () => {
    return (<>
      {showGraphStatus === 'view' && <WithPermission access="system.devops.data_source.edit" key="changeClusterConfig">
        <Button type="primary" onClick={() => setShowGraphStatus('edit')}>{$t('修改配置')}</Button>
      </WithPermission>}</>
    )
  }
  const setDataLogSettingBtn = () => {
    return (<>
      {showDataLogStatus === 'view' && <WithPermission access="system.devops.data_source.edit" key="changeClusterConfig">
        <Button type="primary" onClick={() => setShowDataLogStatus('edit')}>{$t('修改配置')}</Button>
      </WithPermission>}</>
    )
  }

  return (
    <>
      <InsidePage
        pageTitle={$t('数据源')}
        description={$t("设置监控报表的数据来源，设置完成之后即可获得详细的API调用统计图表。")}
        showBorder={false}
        scrollPage={false}
      >
        <div className="flex flex-col overflow-auto pb-PAGE_INSIDE_B pr-PAGE_INSIDE_X">
          <Spin wrapperClassName="flex-1" indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading}>
            <div className="h-full  overflow-auto">
              <Card
                classNames={{
                  body: `overflow-auto ${(!data || !data?.driver) && showGraphStatus === 'view' ? 'hidden' : ''}`,
                }}
                className="overflow-hidden w-full max-h-full flex flex-col justify-between"
                title={<div><span className="text-MAIN_TEXT my-btnybase mr-btnbase" > {$t('统计图表')}</span>
                  {!loading && !data?.driver && <Tag color='#f50'>{$t('未配置')}
                  </Tag>}</div>}

                extra={setDashboardSettingBtn()}>
                {showGraphStatus === 'view' && data && data.driver && DashboardConfigPreview(data)}
                {showGraphStatus !== 'view' && <DashboardSettingEdit data={data} changeStatus={setShowGraphStatus} refreshData={getDashboardSettingInfo} />}
              </Card>
            </div>
          </Spin>
          <Spin wrapperClassName="flex-1" indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={dataLogLoading}>
            <div className="h-full  overflow-auto">
              <Card
                classNames={{
                  body: `overflow-auto ${(!dataLogData) && showDataLogStatus === 'view' ? 'hidden' : ''}`,
                }}
                className="overflow-hidden mt-[30px] w-full max-h-full flex flex-col justify-between"
                title={<div><span className="text-MAIN_TEXT my-btnybase mr-btnbase" > {$t('数据日志')}</span>
                  {!dataLogLoading && !dataLogData && <Tag color='#f50'>{$t('未配置')}
                  </Tag>}</div>}

                extra={setDataLogSettingBtn()}>
                {showDataLogStatus === 'view' && dataLogData && DataLogConfigPreview(dataLogData)}
                {showDataLogStatus !== 'view' && <DataLogSettingEdit data={dataLogData} changeStatus={setShowDataLogStatus} refreshData={getDataLogSettingInfo} />}
              </Card>
            </div>
          </Spin>
        </div>
      </InsidePage>
    </>
  )
}

export function DashboardConfigPreview(x: PartitionDashboardConfigFieldType) {
  return <div className="flex flex-col gap-[4px] ">
    <Row className=""><Col className="font-bold text-right pr-[4px]">{$t('数据源')}：</Col><Col>{x?.driver}</Col></Row>
    <Row className=""><Col className="font-bold text-right pr-[4px]">{$t('地址（IP:端口）')}：</Col><Col>{x?.config?.addr}</Col></Row>
    <Row className=""><Col className="font-bold text-right pr-[4px]">{$t('组织（Organization）')}：</Col><Col>{x?.config?.org}</Col></Row>
  </div>
}
export function DataLogConfigPreview(x: PartitionDataLogConfigFieldType) {
  const columns = PARTITION_DATA_LOG_CONFIG_TABLE_COLUMNS.map(x => {
    return {
      ...x,
      title: (<span title={$t(x.title as string)}>{$t(x.title as string)}</span>)
    }
  })
  const getTableList = () => {
    return new Promise((resolve, reject) => {
      resolve({
        data: x?.headers || [],
        success: true
      })
    })
  }

  return <div className="flex flex-col gap-[4px] ">
    <Row className=""><Col className="font-bold text-right pr-[4px]">{$t('请求前缀')}：</Col><Col>{x?.url}</Col></Row>
    <Row className=""><Col className="font-bold text-right pr-[4px]">{$t('HTTP 头部')}：</Col><Col className="w-full">
      <div className="w-full h-full p-[20px]">
        <PageList
          id="global_role"
          tableClass="role_table  mb-btnrbase"
          primaryKey="'key'"
          columns={[...columns]}
          request={() => getTableList()}
          showPagination={false}
          noScroll={true}
        />
      </div>
    </Col></Row>
  </div>
}

export default PartitionInsideDashboardSetting