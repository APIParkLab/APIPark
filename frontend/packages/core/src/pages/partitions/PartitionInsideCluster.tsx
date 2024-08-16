import  { FC, useEffect,  useRef, useState} from "react";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {App, Button, Card, Col, Row, Spin, Tag} from "antd";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import {  ClusterPageShowStatus, NodeModalHandle, PartitionClusterNodeTableListItem } from "../../const/partitions/types.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import  { ClusterNodeModal } from "./PartitionInsideClusterNode.tsx";
import { LoadingOutlined } from "@ant-design/icons";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";

const PartitionInsideCluster:FC = ()=> {
    const {setBreadcrumb} = useBreadcrumb()
    const {modal, message} = App.useApp()
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
                message.error(msg || '操作失败')
            }
        }).catch(() => {
            return {data: [], success: false}
        }).finally(()=>{
            setLoading(false)
        })
    }


    useEffect(() => {
        setBreadcrumb([
            {title: '集群'}
        ])
        getPartitionClusterInfo()
    }, []);

    const setClusterBtn = ()=>{
            return (<>
                    {showStatus === 'view' && <WithPermission access="system.devops.cluster.edit" key="changeClusterConfig">
                        <Button type="primary" onClick={() => setShowStatus('edit')}>修改配置</Button>
                    </WithPermission> }</>
            )
    }

    return (
        <>
            <InsidePage 
                pageTitle='集群' 
                description="设置访问 API 的集群，让 API 在分布式环境中稳定运行，并且能够根据业务需求进行灵活扩展和优化。"
                showBorder={false}
                scrollPage={true}
                >
                <div className="flex flex-col h-full overflow-auto pb-PAGE_INSIDE_B pr-PAGE_INSIDE_X">
                    <Spin wrapperClassName=" h-full flex-1" indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>} spinning={loading}>
                        <div className="h-full  overflow-auto">
                                <Card 
                                    classNames={{
                                        body: 'overflow-auto',
                                    }}
                                    className="overflow-hidden w-full max-h-full flex flex-col justify-between"
                                    title={<div><span className="text-MAIN_TEXT my-btnybase mr-btnbase" > APIPark Node</span>
                                               {!loading &&  <Tag color={nodeData && nodeData.status === 1 ?'#87d068' : '#f50'}>
                                                    { !nodeData && '未配置'}
                                                    { nodeData?.status === 1 && '正常' }
                                                    { nodeData?.status === 0 && '异常'}
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

export function ClusterConfigPreview (x:PartitionClusterNodeTableListItem){
    return <div className="flex flex-col gap-[4px] ">
        <Row className=""><Col className="font-bold text-right pr-[4px]">管理地址：</Col><Col>{x.managerAddress.map(m=>(<p className="leading-[22px]">{m}</p>))}</Col></Row>
        <Row className=""><Col className="font-bold text-right pr-[4px]">服务地址：</Col><Col>{x.serviceAddress.map(m=>(<p className="leading-[22px]">{m}</p>))}</Col></Row>
        <Row className=""><Col className="font-bold text-right pr-[4px]">同步地址：</Col><Col><p className="leading-[22px]">{x.peerAddress}</p></Col></Row>
</div>}

export default PartitionInsideCluster