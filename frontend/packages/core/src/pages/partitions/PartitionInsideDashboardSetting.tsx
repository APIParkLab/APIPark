import  { FC, useEffect, useState} from "react";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {App, Button, Card, Col, Row, Spin, Tag} from "antd";
import {BasicResponse, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { LoadingOutlined } from "@ant-design/icons";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";
import { $t } from "@common/locales/index.ts";
import DashboardSettingEdit, { DashboardPageShowStatus } from "./DashboardSettingEdit.tsx";
import { PartitionDashboardConfigFieldType } from "@core/const/partitions/types.ts";

const PartitionInsideDashboardSetting:FC = ()=> {
    const {setBreadcrumb} = useBreadcrumb()
    const {message} = App.useApp()
    const {fetchData} = useFetch()
    const [data, setData] = useState<PartitionDashboardConfigFieldType>()
    const [loading, setLoading] = useState<boolean>(false)
    const [showStatus, setShowStatus] = useState<DashboardPageShowStatus>('view')

    const getDashboardSettingInfo = () => {
        setLoading(true)
        return fetchData<BasicResponse<{ nodes:PartitionDashboardConfigFieldType[] }>>('monitor/config', {method: 'GET',eoTransformKeys:[]}).then(response => {
            const {code, data, msg} = response
            if (code === STATUS_CODE.SUCCESS) {
                data?.info?.driver && setData(data.info)
                setShowStatus('view')
            } else {
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        }).catch(() => {
            return {data: [], success: false}
        }).finally(()=>{
            setLoading(false)
        })
    }


    useEffect(() => {
        setBreadcrumb([
            {title: $t('监控报表')}
        ])
        getDashboardSettingInfo()
    }, []);

    const setDashboardSettingBtn = ()=>{
            return (<>
                    {showStatus === 'view' && <WithPermission access="" key="changeClusterConfig">
                        <Button type="primary" onClick={() => setShowStatus('edit')}>{$t('修改配置')}</Button>
                    </WithPermission> }</>
            )
    }

    return (
        <>
            <InsidePage 
                pageTitle={$t('监控报表')} 
                description={$t("设置监控报表的数据来源，设置完成之后即可获得详细的API调用统计图表。")}
                showBorder={false}
                scrollPage={true}
                >
                <div className="flex flex-col h-full overflow-auto pb-PAGE_INSIDE_B pr-PAGE_INSIDE_X">
                    <Spin wrapperClassName=" h-full flex-1" indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>} spinning={loading}>
                        <div className="h-full  overflow-auto">
                                <Card 
                                    classNames={{
                                        body: `overflow-auto ${(!data || !data?.driver) && showStatus === 'view' ? 'hidden': ''}`,
                                    }}
                                    className="overflow-hidden w-full max-h-full flex flex-col justify-between"
                                    title={<div><span className="text-MAIN_TEXT my-btnybase mr-btnbase" > {$t('统计图表')}</span>
                                        {!loading && !data?.driver &&  <Tag color='#f50'>{ $t('未配置')}
                                         </Tag>}</div>} 
                                    
                                    extra={setDashboardSettingBtn()}>
                                {showStatus === 'view'&& data && data.driver && DashboardConfigPreview(data) }
                                {showStatus !== 'view' && <DashboardSettingEdit data={data} changeStatus={setShowStatus} refreshData={getDashboardSettingInfo} />}
                                    </Card>
                    </div>
                    </Spin>
                </div>
            </InsidePage>
            </>
    )
}

export function DashboardConfigPreview (x:PartitionDashboardConfigFieldType){
    return <div className="flex flex-col gap-[4px] ">
        <Row className=""><Col className="font-bold text-right pr-[4px]">{$t('数据源')}：</Col><Col>{x?.driver}</Col></Row>
        <Row className=""><Col className="font-bold text-right pr-[4px]">{$t('地址（IP:端口）')}：</Col><Col>{x?.config?.addr}</Col></Row>
        <Row className=""><Col className="font-bold text-right pr-[4px]">{$t('组织（Organization）')}：</Col><Col>{x?.config?.org}</Col></Row>
</div>}

export default PartitionInsideDashboardSetting