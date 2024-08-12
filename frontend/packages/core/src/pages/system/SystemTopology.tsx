
import G6, { EdgeConfig, Graph, NodeConfig } from "@antv/g6";
import  { useCallback, useEffect, useRef, useState } from "react";
import { RELATIVE_PICTURE_NODE_FONTSIZE } from "../../const/system-running/const";
import { EntityItem } from "@common/const/type";
import { GraphData } from "../../const/system-running/type";
import { getNodeSpacing } from "@common/utils/systemRunning";
import { Link, useParams } from "react-router-dom";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes";
import { useFetch } from "@common/hooks/http";
import { App, Button } from "antd";
import { BasicResponse, STATUS_CODE } from "@common/const/const";
import { useSystemContext } from "../../contexts/SystemContext";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext";
import { debounce } from "lodash-es";
import { SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP } from "../../const/system/const";
import { SystemTopologyResponse } from "../../const/system/type";


export default function SystemTopology() {
    const {message} = App.useApp()
    const {serviceId, teamId}  = useParams<RouterParams>()
    const graphContainerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph>(null);
    const [graphData, setGraphData] = useState<GraphData>();
    const [graph, setGraph] = useState<Graph | null>(null);
    const {fetchData} = useFetch()
    const { systemInfo } = useSystemContext()
    const {setBreadcrumb} = useBreadcrumb()
    const [zoomNum, setZoomNum] = useState<number>(1)

    const getNodeData = ()=>{
        fetchData<BasicResponse<SystemTopologyResponse>>('service/topology',{method:'GET',eoParams:{service:serviceId,team:teamId}},).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setGraphData(transformData({...data,currentSystem:{id:serviceId,name:systemInfo?.name || ''}}))
            }else{
                message.error(msg || '操作失败')
            }
        })
    }
      
   
    const initGraph = ()=>{
      return new G6.Graph({
        container: graphContainerRef.current!,
        layout: {
          type: 'dagre',
          ranksep: 20,
          controlPoints: true,
          preventOverlap: true,
          padding:[20,20,20,20],
          nodeStrength: (d: unknown) => {
            if (d.isLeaf) {
              return -50
            }
            return -10
          },
          fitCenter:true
        },
        defaultNode: {
          size: [20, 20],
          style: {
            radius: 5,
            lineWidth: 1,
            fillOpacity: 1
          },
          labelCfg: {
            style: {
              fontSize: RELATIVE_PICTURE_NODE_FONTSIZE,
              fill: '#666'
            },
            position: 'bottom',
            offset: 12
          }
        },
        defaultEdge: {
          type: 'cubic-vertical',
          style: {
            radius: 20,
            offset: 45,
            endArrow: true,
            lineWidth: 2,
          },
        },
        modes: {
          default: [
            'drag-canvas',
            'zoom-canvas',
            'drag-node',
          ],
        }
      });
    }

    
    const handleWindowResize = useCallback(debounce(() => {
        if (graphContainerRef.current && graphRef.current && !graphRef.current?.get('destroyed')) {
          graphRef.current.changeSize(
            graphContainerRef.current.offsetWidth,
            graphContainerRef.current.offsetHeight,
          );
          graphRef.current?.fitCenter()
        }
      }, 400), []);

    useEffect(()=>{
      getNodeData()
      setBreadcrumb([
        {
            title: <Link to={`/service/list`}>内部数据服务</Link>
        },
        {
            title: '调用拓扑图'
        }])
    },[serviceId])

    useEffect(() => {
        // 初始化 G6 图
      const graph = initGraph()
      graph.setMaxZoom(3)
      graph.setMinZoom(0.2)
      setGraph(graph)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      graphRef.current = graph;
  
      graph.fitCenter();
      handleWindowResize()
      // 添加窗口大小变化的监听器
      window.addEventListener('resize', handleWindowResize);
  
      // 组件卸载时清理资源
      return () => {
          window.removeEventListener('resize', handleWindowResize);
          if (graphRef.current) {
          graphRef.current.destroy();
          }
      };
    }, []);

    
    useEffect(()=>{
        if(!graph) return
        graph.clear()
        graph.data(graphData)
        const { nodes } = graphData as GraphData
    
        if (nodes?.length) {
          graph.updateLayout({
            nodeSpacing: getNodeSpacing(nodes.length)
          })
        }
    
        graph.render()
        setTimeout(()=>{
          graph.fitCenter();})
      },[graphData])

    
    /**
     * @description 更新缩放比例
     */
    const updateZoomTo = (increase:boolean) =>{
      if((increase && zoomNum*10 >= 20 )||(!increase && zoomNum*10 <= 2)) return
      setZoomNum(increase ?( zoomNum*10 + 2)/10 : (zoomNum*10 - 2)/10)
      graph?.zoomTo(increase ? ( zoomNum*10 + 2)/10 : (zoomNum*10 - 2)/10)
    }

    return (
    <div className="h-full w-full   bg-MAIN_BG" >
      <div className="mt-[10px] ml-[10px] w-[100%-192px] absolute top-[143px] right-0">
            <div className="flex justify-between">
              <div>
              </div>
              <div className="border border-solid border-color-base rounded mr-[20px] z-[999] h-8">
                <Button id="zoom-in-button" type="text" title="放大" icon={<ZoomInOutlined />} onClick={()=>updateZoomTo(true)}/>
                <Button id="zoom-out-button" type="text" title="缩小" icon={<ZoomOutOutlined />} onClick={()=>updateZoomTo(false)} />
              </div>
            </div>
          </div>
      <div className="h-full w-full" ref={graphContainerRef}></div>
      {/* <div className="px-[10px] py-[20px] pb-[30px] flex flex-wrap items-center justify-center ">
        {Object.entries(SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP).map(([_, config]) => (
          <div key={config.name} className="flex items-center mr-[10px]">
            <span
              className="inline-block w-[20px] h-[20px] rounded-full mr-2"
              style={
                {border:`1px solid ${config.stroke}`,
                backgroundColor: config.fill}
              }></span>
              <span className="white-space-nowrap">{config.name}</span></div>))}
      </div> */}
    </div>
    )
}

function transformData(response: SystemTopologyResponse & {currentSystem: EntityItem}): { nodes: NodeConfig[], edges: EdgeConfig[] } {
  const nodes: NodeConfig[] = [];
  const edges: EdgeConfig[] = [];

  // 添加当前服务节点
  nodes.push({
    id: response.currentSystem.id,
    label: `${response.currentSystem.name}`,
    type: 'curProject',
    style: {
      // fill: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.curProject.fill, 
      // stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.curProject.stroke, 
    },
  });

  // response.services.forEach(service =>{
  //   // nodes.push({
  //   //   id: service.id,
  //   //   label: `${service.name}`,
  //   //   type: 'subscriberService',
  //   //   style: {
  //   //     fill: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.subscriberService.fill, 
  //   //     stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.subscriberService.stroke, 
  //   //   },
  //   // });
  //   edges.push({
  //     source: service.id,
  //     // source: service.id,
  //     target: response.currentSystem.id,
  //     type: 'subscribes',
  //     style:{
  //       lineDash:[4,4],
  //       endArrow:false,
  //       stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.subscriberService.stroke, // 订阅服务节点使用蓝色
  //     }
  //   });
  // })

  // 添加订阅者节点和边
  response.subscribers.forEach(subscriber => {
    nodes.push({
      id: subscriber.service.id,
      label: `${subscriber.service.name}`,
      type: 'subscriberProject',
      style: {
        fill: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.subscriberProject.fill, 
        stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.subscriberProject.stroke, 
      },
    });
    subscriber.services.forEach(serviceData => {
      const service = response.services.find(s => s.id === serviceData.id);
      if (service) {
        edges.push({
          source: subscriber.service.id,
          target: response.currentSystem.id,
          type: 'subscribes',
          style:{
            endArrow:true,
            stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.subscriberProject.stroke, // 订阅服务节点使用蓝色
          }
        });
        // edges.push({
        //   source: subscriber.service.id,
        //   target: service.id,
        //   type: 'subscribes',
        //   style:{
        //     stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.subscriberProject.stroke, // 订阅服务节点使用蓝色
        //   }
        // });
        // edges.push({
        //   source: service.id,
        //   target: response.currentSystem.id,
        //   type: 'subscribes',
        //   style:{
        //     stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.subscriberService.stroke, // 订阅服务节点使用蓝色
        //   }
        // });
      }
    });
  });

  // 添加调用者节点和边
  response.invoke?.forEach(invoker => {
    nodes.push({
      id: invoker.service.id,
      label: `${invoker.service.name}`,
      type: 'invokeProject',
      style: {
        fill: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.invokeProject.fill, 
        stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.invokeProject.stroke, 
      },
    });
    
      edges.push({
        source: response.currentSystem.id,
        target: invoker.service.id,
        type: 'subscribes',
        style:{
          endArrow:true,
          stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.invokeProject.stroke, // 订阅服务节点使用蓝色
        }
      });
    // invoker.services.forEach(serviceData => {
    //     nodes.push({
    //       id: serviceData.id,
    //       label: `服务: ${serviceData.name}`,
    //       type: 'invokeService',
    //       style: {
    //         fill: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.invokeService.fill, 
    //         stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.invokeService.stroke, 
    //       },
    //     });
        
    //     edges.push({
    //       source: response.currentSystem.id,
    //       target: serviceData.id,
    //       type: 'subscribes',
    //       style:{
    //         lineDash:[4,4],
    //         endArrow:false,
    //         stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.invokeService.stroke, // 订阅服务节点使用蓝色
    //       }
    //     });
    //     edges.push({
    //       source: serviceData.id,
    //       target: invoker.service.id,
    //       type: 'invokes',
    //       style:{
    //         stroke: SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP.invokeProject.stroke, // 订阅服务节点使用蓝色
    //       }
    //     });
    // });
  });


  return { nodes, edges };
}