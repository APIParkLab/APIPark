import  { FC, useEffect,  useRef, useState} from "react";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {App, Button, Card, Col, Row, Spin, Tag} from "antd";
import {BasicResponse, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {  ClusterPageShowStatus, NodeModalHandle, PartitionClusterNodeTableListItem } from "../../const/partitions/types.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import  { ClusterNodeModal } from "./PartitionInsideClusterNode.tsx";
import { LoadingOutlined } from "@ant-design/icons";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";
import { $t } from "@common/locales/index.ts";
import { extractIPFromURL, isPrivateIP} from '@common/utils/ip.ts'

const PartitionInsideCluster:FC = ()=> {
    const {setBreadcrumb} = useBreadcrumb()
    const { message} = App.useApp()
    const {fetchData} = useFetch()
    const [nodeData, setNodeData] = useState<PartitionClusterNodeTableListItem>()
    const [loading, setLoading] = useState<boolean>(false)
    const editNodeRef = useRef<NodeModalHandle>(null)
    const [showStatus, setShowStatus] = useState<ClusterPageShowStatus>('view')

    const getPartitionClusterInfo = () => {
        setLoading(true)
        return fetchData<BasicResponse<{ nodes:PartitionClusterNodeTableListItem[] }>>('cluster/nodes', {method: 'GET',eoTransformKeys:['manager_address','service_address','peer_address']}).then(response => {
            const {code, data, msg} = response
            if (code === STATUS_CODE.SUCCESS) {
                data.nodes && data.nodes.length > 0 && setNodeData(data.nodes[0])
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
            {title: $t('集群')}
        ])
        getPartitionClusterInfo()
    }, []);

    const setClusterBtn = ()=>{
            return (<>
                    {showStatus === 'view' && <WithPermission access="system.devops.cluster.edit" key="changeClusterConfig">
                        <Button type="primary" onClick={() => setShowStatus('edit')}>{$t('修改配置')}</Button>
                    </WithPermission> }</>
            )
    }

    return (
        <>
            <InsidePage 
                pageTitle={$t('集群')} 
                description={$t("设置访问 API 的集群，让 API 在分布式环境中稳定运行，并且能够根据业务需求进行灵活扩展和优化。")}
                showBorder={false}
                scrollPage={true}
                >
                <div className="flex flex-col h-full overflow-auto pb-PAGE_INSIDE_B pr-PAGE_INSIDE_X">
                    <Spin wrapperClassName=" h-full flex-1" indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>} spinning={loading}>
                        <div className="h-full  overflow-auto">
                                <Card 
                                    classNames={{
                                        body: `overflow-auto ${!nodeData && showStatus === 'view' ? 'hidden': ''}`,
                                    }}
                                    className="overflow-hidden w-full max-h-full flex flex-col justify-between"
                                    title={<div><span className="text-MAIN_TEXT my-btnybase mr-btnbase" > APIPark Node</span>
                                               {!loading &&  <Tag color={nodeData && nodeData.status === 1 ?'#87d068' : '#f50'}>
                                                    { !nodeData && $t('未配置')}
                                                    { nodeData?.status === 1 && $t('正常') }
                                                    { nodeData?.status === 0 && $t('异常')}
                                                </Tag>}</div>} 
                                    extra={setClusterBtn()}>
                                {showStatus === 'view'&& nodeData && ClusterConfigPreview(nodeData) }
                                {showStatus !== 'view' && <ClusterNodeModal ref={editNodeRef} status={showStatus} changeStatus={setShowStatus} getClusterInfo={getPartitionClusterInfo} />}
                                    </Card>
                    </div>
                    </Spin>
                </div>
            </InsidePage>
            </>
    )
}


const IpTypeTag = ({ip:url}:{ip:string}) =>{
    const ip = extractIPFromURL(url);
    const isPrivate :boolean= ip ? isPrivateIP(ip) : false
    return (
        <span  className={`px-[4px] py-[2px] text-[#fff] text-[12px] leading-[16px] rounded m-0 ${isPrivate ? 'bg-[#87d068]' : 'bg-[#3d46f2]'}`}>
            {isPrivate ? '私有网络' : '公共网络'}
        </span>
    )
}
export function ClusterConfigPreview (x:PartitionClusterNodeTableListItem){
    return <div className="flex flex-col gap-[4px] ">
        <Row className=""><Col className="font-bold text-right pr-[4px]">{$t('管理地址')}：</Col><Col>{x.managerAddress.map(m=>(
            <p className="leading-[22px] flex items-center gap-[5px]"><IpTypeTag ip={m} />{m}</p>))}</Col></Row>
        <Row className=""><Col className="font-bold text-right pr-[4px]">{$t('服务地址')}：</Col><Col>{x.serviceAddress.map(m=>(
            <p className="leading-[22px] flex items-center gap-[5px]"><IpTypeTag ip={m} />{m}</p>))}</Col></Row>
        <Row className=""><Col className="font-bold text-right pr-[4px]">{$t('同步地址')}：</Col><Col>
            <p className="leading-[22px] flex items-center gap-[5px]"><IpTypeTag ip={x.peerAddress} />{x.peerAddress}</p></Col></Row>
</div>}

export default PartitionInsideCluster