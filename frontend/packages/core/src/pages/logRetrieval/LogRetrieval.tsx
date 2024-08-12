
import {App, Button, Cascader, Checkbox, Collapse, Empty, Modal, Select, Spin, Table} from "antd";
import  {useEffect, useState} from "react";
import {ColumnsType} from "antd/es/table";
import  moment from 'moment'
import styles from './LogRetrieval.module.css'
import { saveAs } from 'file-saver'
import useWebSocket from "@common/hooks/webSocket.ts";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {EntityItem} from "@common/const/type.ts";
import {DefaultOptionType} from "antd/es/cascader";
import { SimplePartition } from "../../const/partitions/types.ts";
import MonacoEditorWrapper ,{MonacoEditorRefType} from "@common/components/aoplatform/MonacoEditorWrapper.tsx"

 type FileItemType = {
    file:string,
     key:string,
     mod:string,
     size:string
}
 type OutputItemType = {
    files:FileItemType[],
     name:string,
     tail:string
}

type OutputItemExtraInfo = {
    cluster:string
    node:string
}


export default function LogRetrieval(){

    const {/* modal,*/message } = App.useApp()
    // const [confirmLoading, setConfirmLoading] = useState(false);
    const {fetchData} = useFetch()
    const { setBreadcrumb } = useBreadcrumb()
    const [clusterList,setClusterList] = useState<DefaultOptionType[]>([])
    const [nodeList,setNodeList] = useState<DefaultOptionType[]>([])
    const [searchCluster, setSearchCluster] = useState<string[]>([])
    const [searchNode, setSearchNode] = useState<string[]>([])
    const [outputListLoading, setOutputListLoading] = useState<boolean>(true)

    const [outputList, setOutputList] = useState<OutputItemType[]>([])

    const handleSearch = ()=>{}
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLogFile,setCurrentLogFile] = useState<OutputItemType|null>()
    // 打开弹窗并连接WebSocket
    const handleOpenModal = (x: OutputItemType) => {
        setCurrentLogFile(x)
        setIsModalOpen(true);
    };

    const getOutputList = (partition:string , cluster:string, node:string)=>{
        setOutputListLoading(true)
        fetchData<BasicResponse<{output:OutputItemType[]}>>('log/files',{method:'GET', eoParams:{cluster, node, partition}}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setOutputList(data.output?.map((x:OutputItemType)=>{return{...x,partition:partition, cluster:cluster,node:node,
                    files:handlerFileData(x.files)
                }}))
            }else{
                message.error(msg || '操作失败')
            }
            setOutputListLoading(false)
        })
    }

    const handlerFileData = (files:Array<FileItemType>)=>{
        return files.sort((a:FileItemType, b:FileItemType) => ((b.file + '').localeCompare(a.file + '')))?.map((x:FileItemType) => {
                x.mod = moment(x.mod).format('yyyy-MM-DD HH:mm:ss')
                return x
            })
    }

    const getClusterList = ()=>{
        setClusterList([])
        fetchData<BasicResponse<{partitions:SimplePartition[]}>>('simple/partitions/cluster',{method:'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setClusterList(data.partitions?.filter((x:SimplePartition)=>x.clusters?.length > 0).map(
                        (x:SimplePartition)=>{
                            return {
                                label:x.name,
                                value:x.id,
                                children:x.clusters?.map((c)=>{return{
                                    label:c.name,
                                    value:c.id,
                                    isLeaf:true}
                                }) || []
                            }}))
                setSearchCluster([data.partitions[0]?.id, data.partitions[0]?.clusters[0]?.id])
                if(data.partitions.length == 0 || data.partitions[0]?.clusters.length == 0 ) return
                getNodeList(data.partitions[0]?.id,data.partitions[0]?.clusters[0]?.id)
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    const getNodeList = (partition:string, cluster:string)=>{
        setNodeList([])
        fetchData<BasicResponse<{nodes:EntityItem[]}>>(`simple/partition/cluster/nodes`,{method:'GET',eoParams:{cluster}}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setNodeList(data.nodes?.map((node:EntityItem) => {
                    return ({ label: node.name, value: node.id })
                }))
                setSearchNode(data.nodes[0].id)
                getOutputList(partition,cluster,data.nodes[0].id)
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    useEffect(()=>{
        getNodeList(searchCluster[0],searchCluster[1])
    },[searchCluster])

    useEffect(() => {
        setBreadcrumb([{ title: '日志检索'}])
        getClusterList()
    }, []);

    return (<>
        <div className="flex flex-wrap items-center pl-btnbase pr-btnbase">
            <div className="flex flex-nowrap items-center mr-btnbase py-btnybase">
                <label>集群：</label>
                <Cascader value={searchCluster} options={clusterList} onChange={(val)=>setSearchCluster(val as string[])} placeholder="请选择集群" />
            </div>
            <div className="flex flex-nowrap items-center mr-btnbase py-btnybase">
                <label>节点：</label>
                <Select
                    value={searchNode}
                    style={{ width: 120 }}
                    options={nodeList}
                />

            </div>
            <div className="flex flex-nowrap items-center mr-btnbase py-btnybase">
                <Button type="primary" onClick={handleSearch}>查询</Button>
            </div>
        </div>
        <Spin spinning={outputListLoading}>
            {outputList.length > 0 && outputList?.map((x)=>{
                return (
                    <Collapse
                        key={x.name}
                        className={`${styles['collapse-without-padding']} p-[0px] mx-btnbase mb-btnybase`}
                        items={[
                            {   key: '1', 
                                label: 
                                    <p className="flex items-center">
                                        <span className="mr-[20px]">{x.name}</span>
                                        <Button onClick={(e)=>{e.stopPropagation(); handleOpenModal(x)}}>追踪日志</Button>
                                        </p>, 
                                children: <LogFilesList files={x.files} /> }]}
                    />
                )
            })}
            {outputListLoading && <div className="mt-btnbase h-[100vh]"></div>}
            {!outputListLoading && (!outputList || outputList.length === 0 )&& <div className="block h-full align-middle"><Empty className="mt-[20%]" image={Empty.PRESENTED_IMAGE_SIMPLE}/></div> }
        </Spin>
        <LogTailComponent
            isVisible={isModalOpen}
            file={currentLogFile as OutputItemType}
            onClose={() => {setIsModalOpen(false);setCurrentLogFile(null)}}
        />
    </>)
}

export const LogFilesList = ({files,extra}:{files:FileItemType[],extra:OutputItemExtraInfo})=>{

    const download = (entity:FileItemType)=>{
        window.location.href = `log/download?cluster=${extra.cluster}&node=${extra.node}&partition=${extra.partition}&key=${entity.key}`
        }

    const columns: ColumnsType<FileItemType> = [
        {
            title:'file',
            dataIndex: 'file',
            key: 'file',
        },
        {
            title:'size',
            dataIndex: 'size',
            key: 'size',
        },
        {
            dataIndex: 'mod',
            key: 'mod',
            render:(text)=> <span>{moment(text).format('yyyy-MM-DD HH:mm:ss')}</span>
        },
        {
            key: 'option',
            width: 200,
            render: (_: React.ReactNode, entity:FileItemType) => [
                <a key="refreshToken" onClick={()=>download(entity)}>下载</a>
            ],
        },
    ];

     return <Table  virtual pagination={false} scroll={{ x:800, y: 200 }} columns={columns} dataSource={files} size="middle" showHeader={false} />
}


const LogTailComponent = (props:{file:OutputItemType, isVisible:boolean,onClose:()=>void})=>{
    const {
        file,
        isVisible,onClose} = props
    const [logContent, setLogContent] = useState<string>()
    const [connected,setConnected] = useState<boolean>(false)
    const [trackLogs, setTrackLogs] = useState(false);
    const { createWs } = useWebSocket()
    const [wsRef, setWsRef]=useState<WebSocket>()
    const [editorRef, setEditorRef] = useState<MonacoEditorRefType>()
    const closeConnect = () => {
        wsRef?.close()
        setConnected(false)
    }

    const clear =  () => {
        setLogContent('')
    }

    const connectWs = (reConnect?:boolean) => {
        setWsRef(createWsRef(!reConnect))
        setConnected(true)
    }

    const download =  () =>{
        const vDate = new Date()
        const fileName: string = `${file.name}_${vDate.getFullYear() + '-' + (vDate.getMonth() + 1) + '-' + vDate.getDate()}`
        saveAs(new Blob([logContent as string || ''], { type: 'text/plain;charset=utf-8' }), `${fileName}.txt`)
    }

    const updateContent = (newContent:string)=>{
        setLogContent((prevContent)=>prevContent + newContent)
        trackLogs &&  editorRef?.revealLine(editorRef?.getModel()?.getLineCount() || 0 as number);
    }

    // init=true时，为初始化ws，需要清空content；init=false时，为重连，ws连接后显示‘已恢复连接’
    const createWsRef = (init:boolean) =>{
        return createWs(`ws://${window.location.host}/api/v1/log/tail/${file.tail}`,{
            onOpen: () => init ? setLogContent('') : updateContent('\n[...已恢复连接...]\n\n'),
            onClose: () => updateContent('\n[...已中断连接...]\n'),
            onMessage: ( event:MessageEvent<unknown>) => updateContent(event.data + '\n'),
            onError: (error:Event) => console.error('ws连接出现错误：', error)})
    }

    useEffect(() => {
        if(isVisible){
             const newWs = createWsRef(true)
            setWsRef(newWs)
        }else{
            wsRef?.close()
        }
        return (wsRef?.close())
    }, [isVisible]);

    return (
        <Modal
            title={`日志详情：${file?.name || '-'}`}
            width={900}
            visible={isVisible}
            onOk={onClose}
            onCancel={onClose}
            maskClosable={false}
            footer={[
                <div className="flex justify-between ">
                    <div className="flex justify-between items-center">
                        <Checkbox checked={trackLogs} onChange={(e) => setTrackLogs(e.target.checked)}>
                            追踪最新日志
                        </Checkbox>
                        <Button onClick={() => clear()}>清空内容</Button>
                        {connected ? <Button onClick={() => closeConnect()}>停用连接</Button>:
                            <Button onClick={() => connectWs()}>重新连接</Button>}
                    </div>
                    <div>
                        <Button onClick={() => download()}>下载</Button>
                        <Button onClick={onClose}>关闭</Button>
                    </div>
                </div>
            ]}
        >
            <MonacoEditorWrapper
                className="min-h-[300px]"
                defaultLanguage="shell"
                height="300px"
                theme="vs-dark"
                defaultValue={logContent}
                options={{readOnly:true, minimap:{enabled:false}}}
                onMount={(editor) => {
                    setEditorRef(editor)
                }}
            />
        </Modal>)
}