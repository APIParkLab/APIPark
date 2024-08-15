import  { FC, useEffect,  useRef, useState} from "react";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {App, Button, Col, Collapse, Empty, Row, Spin, Tag} from "antd";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import {  NodeModalHandle, PartitionClusterNodeTableListItem } from "../../const/partitions/types.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import  { ClusterNodeModal } from "./PartitionInsideClusterNode.tsx";
import { DownOutlined, LoadingOutlined, UpOutlined } from "@ant-design/icons";
import { checkAccess } from "@common/utils/permission.ts";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";

const PartitionInsideCluster:FC = ()=> {
    const {setBreadcrumb} = useBreadcrumb()
    const {modal, message} = App.useApp()
    const {fetchData} = useFetch()
    const [nodesList, setNodesList] = useState<PartitionClusterNodeTableListItem[]>()
    const [loading, setLoading] = useState<boolean>(false)
    const {accessData} = useGlobalContext()
    const [activeKey, setActiveKey] = useState<string[]>([])
    const editNodeRef = useRef<NodeModalHandle>(null)

    const getPartitionClusterInfo = () => {
        setNodesList([])
        setLoading(true)
        return fetchData<BasicResponse<{ nodes:PartitionClusterNodeTableListItem[] }>>('cluster/nodes', {method: 'GET',eoTransformKeys:['manager_address','service_address','peer_address']}).then(response => {
            const {code, data, msg} = response
            if (code === STATUS_CODE.SUCCESS) {
                setNodesList(data.nodes)
                setActiveKey(data.nodes.map((x:PartitionClusterNodeTableListItem)=>x.id))
            } else {
                message.error(msg || '操作失败')
            }
        }).catch(() => {
            return {data: [], success: false}
        }).finally(()=>{
            setLoading(false)
        })
    }

    const openModal = async (type:'editNode')=>{
        let title:string = ''
        let content:string|React.ReactNode = ''

        switch(type){
            case 'editNode': {
                title = '重置配置'
                content = <ClusterNodeModal ref={editNodeRef} />
                }
                break;
        }

        modal.confirm({
            title,
            content,
            onOk:()=> {
                switch (type){
                    case 'editNode':
                        return editNodeRef.current?.save().then((res:boolean)=>{if(res === true) getPartitionClusterInfo(); return false})
                }
            },
            width:type === 'editNode' ? 900 : 600,
            okText:'确认',
            okButtonProps:{
                disabled:!checkAccess('system.devops.cluster.edit', accessData)
            },
            cancelText:'取消',
            closable:true,
            icon:<></>,
        })
    }

    useEffect(() => {
        setBreadcrumb([
            {title: '集群'}
        ])
        getPartitionClusterInfo()
    }, []);

    return (
        <>
            <InsidePage 
                pageTitle='集群' 
                description="设置访问 API 的集群，让 API 在分布式环境中稳定运行，并且能够根据业务需求进行灵活扩展和优化。"
                showBorder={false}
                scrollPage={true}
                >
                <div className="flex flex-col h-full overflow-auto pb-PAGE_INSIDE_B">
                    <div className="pb-btnbase"> <WithPermission access="system.devops.cluster.edit" key="changeClusterConfig"><Button type="primary" onClick={() => openModal('editNode')}>修改集群配置</Button></WithPermission></div>
                    <Spin wrapperClassName=" flex-1" indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>} spinning={loading}>
                        <div className="h-full  overflow-auto">
                        {nodesList && nodesList.length > 0  ? 
                        <Collapse className={``} 
                                            expandIcon={({isActive})=>(isActive?  <UpOutlined className="w-[23px] text-MAIN_TEXT hover:text-MAIN_HOVER_TEXT"/>:<DownOutlined className="w-[23px] text-MAIN_TEXT hover:text-MAIN_HOVER_TEXT"/> )}
                                            items={nodesList?.map(x=>{
                                                return {
                                                    label:<div ><Tag color={x.status === 1 ? '#87d068' : '#f50'}>{x.status === 1 ? '正常' : '异常'}</Tag><span className="text-MAIN_TEXT my-btnybase mr-btnbase" id={`${x.id}`}>{x.managerAddress.join(',')}</span></div>,
                                                    key:x.id,
                                                    children:<div className="p-btnbase">
                                                        <Row className="mb-[4px]"><Col className="font-bold text-right pr-[4px]" span="3">管理地址：</Col><Col>{x.managerAddress.map(m=>(<p className="leading-[22px]">{m}</p>))}</Col></Row>
                                                        <Row className="mb-[4px]"><Col className="font-bold text-right pr-[4px]" span="3">服务地址：</Col><Col>{x.serviceAddress.map(m=>(<p className="leading-[22px]">{m}</p>))}</Col></Row>
                                                        <Row className="mb-[4px]"><Col className="font-bold text-right pr-[4px]" span="3">同步地址：</Col><Col><p className="leading-[22px]">{x.peerAddress}</p></Col></Row>
                                                    </div>
                                                }
                                            })}
                                            activeKey={activeKey}
                                            onChange={(val)=>{setActiveKey(val as string[])}}
                                />:<Empty className="mt-[10%]" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                                        }
                    </div>
                    </Spin>
                </div>
            </InsidePage>
            </>
    )
}

export default PartitionInsideCluster