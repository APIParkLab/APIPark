
import { useRef, useState, useEffect, useCallback } from "react";
import { useFetch } from "@common/hooks/http.ts";
import { useParams } from "react-router-dom";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes.tsx";
import { App, Button, Spin, Tooltip } from "antd";
import { debounce } from "lodash-es";
import { LoadingOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import G6, { Graph, registerEdge, Item } from "@antv/g6";
import { PictureTypeEnum, NodeClickItem, GraphData } from "@core/const/system-running/type.ts";
import { UnionFind, edgesFormatter, getNodeSpacing, nodesFormatter } from "@common/utils/systemRunning.ts";
import { EDGE_STYLE, END_ARROW_STYLE, OUT_SPACE_CONTENT_EDGE_COLOR, RELATIVE_PICTURE_NODE_FONTSIZE, SELF_SPACE_CONTENT_EDGE_COLOR, SYSTEM_TUNNING_CONFIG } from "@core/const/system-running/const.ts";
import ReactDOM from "react-dom";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import SystemRunningInstruction from "./SystemRunningInstruction.tsx";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext.tsx";

export type TopologyItem = {
    projects:TopologyProjectItem[]
    services:TopologyServiceItem[]
}

export type TopologyProjectItem = {
  id:string,
  name:string,
  invokeServices:string[],
  clusters?:string
  isApp?:boolean
  isServer?:boolean
}

export type TopologyServiceItem = {
  id:string,
  name:string,
  project:string
}

enum EdgeEvent {
  Mouseenter = 'mouseenter',
  Mouseleave = 'mouseleave'
}

type nodeAny = unknown
const subjectColors = [
  '#5F95FF', // blue
  '#61DDAA',
  '#65789B',
  '#F6BD16',
  '#7262FD',
  '#78D3F8',
  '#9661BC',
  '#F6903D',
  '#008685',
  '#F08BB4',
];
const backColor = '#fff';
const theme = 'default';
const disableColor = '#777';
const colorSets = G6.Util.getColorSetsBySubjectColors(
  subjectColors,
  backColor,
  theme,
  disableColor,
);


// cache the initial node and combo info
const itemMap :Record<string,unknown>= {};

export default function SystemRunning(){
    const {message} = App.useApp()
    const graphRef = useRef<Graph>(null);
    const graphContainerRef = useRef<HTMLDivElement>(null);
    const {topologyId} = useParams<RouterParams>()
    const [graph, setGraph] = useState<Graph | null>(null);
    const [graphData, setGraphData] = useState<GraphData>();
    const [currentNode, setCurrentNode] = useState<string>()
    const [showEdgeTooltip, setShowEdgeTooltip] = useState<boolean>(false)
    const [edgeTooltipX, setEdgeTooltipX] = useState(0)
    const [edgeTooltipY, setEdgeTooltipY] = useState(0)
    const [edgeTooltipContent, setEdgeTooltipContent] = useState<TopologyProjectItem>()
    const [pictureType, setPictureType] = useState<PictureTypeEnum>(PictureTypeEnum.Global)
    const { fetchData } = useFetch()
    const textColor:string = '#666'
    const [showGraph, setShowGraph] = useState<boolean>(false)
    const { setBreadcrumb } = useBreadcrumb()
    const [zoomNum, setZoomNum] = useState<number>(1)
    const [loading, setLoading ] = useState<boolean>(true)
    const [categories, setCategories] = useState<unknown>(undefined)
    
  /**
   * @description 关联关系转化器,将接口数据转为 g6 渲染需要的格式
   */
   const  relativeFormatter = (data: TopologyItem) => {
    const { projects, services } = data
    const serviceMap:Map<string,TopologyServiceItem> = new Map()
    services.forEach((s:TopologyServiceItem)=>{
      serviceMap.set(s.id,s)
    })
    // Map<projectId, Map<invokeProject, invokeService[]>>
    const tmpProjectConnectMap:Map<string,Map<string, TopologyServiceItem[]>> = new Map()
    projects.forEach((p:TopologyProjectItem) => {
      const invokedMap = new Map<string,TopologyServiceItem[]>()
      p.invokeServices?.forEach((s:string) => {
        const invokedProject = serviceMap.get(s)
        if(invokedProject){
          invokedMap.has(invokedProject.project) ? invokedMap.get(invokedProject.project)?.push(invokedProject) : invokedMap.set(invokedProject.project, [invokedProject])
        }else{
        console.warn('存在无所属系统的服务：', s)
      }
      })
      tmpProjectConnectMap.set(p.id, invokedMap)
    })
    const newNodes = nodesFormatter(projects)
    const newEdges = edgesFormatter(tmpProjectConnectMap)

    // 从 edges 中提取所有唯一的节点
    // const allNodeIds = tmpProjectConnectMap.map(({ source, target }) => source || []).concat(tmpProjectConnectMap.map(({ source, target }) => target || [])).filter(Boolean);
    // const nodes: Node[] = allNodeIds.map(id => ({ id }));
   // 从 edges 中提取所有唯一的节点，并将 Set 转换为数组
    const allNodeIds:string[] = Array.from(new Set(newEdges.flatMap(edge => [edge.source, edge.target]))) as string[];

    // 初始化 UnionFind，并处理所有的边
    const unionFind = new UnionFind(allNodeIds);
    newEdges.forEach(({ source, target }) => {
      unionFind.union(source, target);
    });

    // 预设的颜色数组
    const colors: string[] = [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
      // ... 根据需要添加更多颜色
    ];


    // 使用 Union-Find 算法处理所有的边
    tmpProjectConnectMap.forEach(({ source, target }) => {
      unionFind.union(source, target);
    });

    // 为每个连通分量分配颜色，并更新 nodes 数组
    const clusterToColor: Record<string, string> = {};
    const categories: Record<string, string[]> = {};
    const newCom = []


    newNodes.forEach(node => {
      const root = unionFind.find(node.id);
      categories[root] = categories[root] || [];
      categories[root].push(node.id);
      if (!clusterToColor[root]) {
        // 分配颜色，确保同一连通分量的节点颜色相同
        clusterToColor[root] = colors[Math.max(0, Object.keys(clusterToColor).length) % colors.length];
      }
      node.cluster = root || 'none';
      node.comboId = `${root || 'none'}-combo`;
      // node.color = clusterToColor[root];
    });

    
    let i:number = 0
    
    for(const c in categories){
      const color = colorSets[i % colorSets.length];
      const comboStyle = {
        stroke: color.mainStroke,
        fill: color.mainFill,
        opacity: 0.8}
      const comboId = `${c === 'undefined' ? 'none' : (c||'none') }-combo`
         newCom.push(comboId === 'none-combo' ?{id:comboId,style:{
          fill:'transparent',
          stroke:'transparent',
          fillOpacity: 0,
          strokeOpacity: 0,
          active: {
            // 设置激活状态下的透明度
            fill: 'transparent',
            stroke: 'transparent',
            fillOpacity: 0,
            strokeOpacity: 0,
          },
          inactive: {
            fill: 'transparent',
            stroke: 'transparent',
            // 设置非激活状态下的透明度
            fillOpacity: 0,
            strokeOpacity: 0,
          },
          highlight: {
            fill: 'transparent',
            stroke: 'transparent',
            // 设置高亮状态下的透明度
            fillOpacity: 0,
            strokeOpacity: 0,
          }
         }}:{
        id:comboId,
        style:comboStyle
      })
        itemMap[comboId] = {style : { ...comboStyle }}
        i++
    }


    
    newNodes.forEach(node => {
      const parentCombo = itemMap[node.comboId];
      if(node.isApp){
        node.style = {
          stroke: '#ffa940',
          fill: '#ffa94033',
        }
      }else if (parentCombo) {
        node.style = {
          stroke: parentCombo.style.stroke,
          fill: parentCombo.style.fill
        }
      } 
      // node.color = clusterToColor[root];
    });


    return {
      nodes: newNodes,
      edges: newEdges,
      combos:newCom
    }
  }

  
    
    const getNodeData = ()=>{
      setLoading(true)
        fetchData<BasicResponse<TopologyItem>>('topology',{method:'GET',eoTransformKeys:['invoke_services','is_app','is_server']},).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
              const newGraphData = relativeFormatter(data)
                setGraphData(newGraphData)
                setShowGraph(newGraphData?.nodes?.length > 0)

            }else{
                message.error(msg || '操作失败')
            }
        }).finally(()=>setLoading(false))
    }

    const handleWindowResize = useCallback(debounce(() => {
        if (graphContainerRef.current && graphRef.current && !graphRef.current?.get('destroyed')) {
          graphRef.current.changeSize(
            graphContainerRef.current.offsetWidth,
            graphContainerRef.current.offsetHeight,
          );
          graphRef.current?.fitCenter()
          // graphRef.current?.fitView()
        }
      }, 400), []);


    /**
     * @description 点击节点的回调
     */
    const clickNode = (item: NodeClickItem) => {
        // console.log(item)
        // router.navigate(['/', 'home', 'api-relative', item.id])
    }

    const updateSelected = ()=> {
        if (!currentNode) return
        // 设置节点状态
        graph?.setItemState(currentNode, 'selected', true)
      }
      
    /**
     * @description 更新缩放比例
     */
    const updateZoomTo = (increase:boolean) =>{
      const zoom:number = graph?.getZoom() || zoomNum
      if((increase && zoom*10 >= 20 )||(!increase && zoom*10 <= 2)) return
      setZoomNum(increase ?( zoom*10 + 2)/10 : (zoom*10 - 2)/10)
      graph?.zoomTo(increase ? ( zoom*10 + 2)/10 : (zoom*10 - 2)/10)
    }

    const  initGraph = () => {
      return new G6.Graph({
        container: ReactDOM.findDOMNode(graphContainerRef.current) as HTMLDivElement,
        groupByTypes: false,
        // plugins: [tooltip],
        fitCenter:true,
        // fitView:true,
        layout: {
          type: 'comboForce',
          // 稳定系数,初始动画的加载时长（稳定性）=节点数量/稳定系数
          alphaDecay: 0.08,
          // // 因为有分组的存在，整体布局需要往左偏移一点
          // // center: [(graphContainerRef.current?.scrollWidth || 300) / 2 - 150,( graphContainerRef.current?.scrollHeight || 0) / 2],
          preventOverlap: true,
          preventNodeOverlap:true,
          preventComboOverlap:true,
          // nodeCollideStrength:1,
          // collideStrength:1,
          comboCollideStrength:0.9,
          nodeSize:24,
          padding:[20,20,20,20],
          // linkDistance: 30,
          nodeStrength: -10,
          edgeStrength: 0.1,
          // nodeSpacing:40,
          // comboSpacing:10,
          comboPadding:30,
          clustering:true,
          clusterNodeStrength: 1000,
          clusterEdgeDistance: 50,
          clusterNodeSize: 100,
          // clusterFociStrength: 1,
          // charge: (d: nodeAny) => {
          //   return 100
          // },
          // linkStrength:()=>{
          //   return 100
          // },
          // nodeSpacing: (d: nodeAny,v:nodeAny) => {
          //   console.log(d, v)
          //   if (d.comboId=== 'none-combo' || d.cluster==="none") {
          //     return 40
          //   }
          //   return 50
          // },
          // onTick:()=>{console.log('ticking')},
          // onLayoutEnd:()=>{console.log('layout end')}
        },
        modes: {
          default: ['drag-combo','drag-canvas', 'drag-node', 'zoom-canvas','activate-relations'
        ]
        },
        defaultNode: {
          size: [24, 24],
          style: {
            radius: 5,
            stroke: '#69c0ff',
            lineWidth: 1,
            fillOpacity: 1
          },
          labelCfg: {
            style: {
              fontSize: RELATIVE_PICTURE_NODE_FONTSIZE,
              fill: textColor
            },
            position: 'bottom',
            offset: 12
          }
        },
        defaultEdge: {
          // type: 'quadratic',
          label: '调用服务',
          labelCfg: {
            style: {
              fill: '5B8FF9',
              opacity: 0 // 将透明度设置为0,隐藏提示信息,hover 才出现
            }
          }
        },
        defaultCombo: {
          labelCfg: {
            style: {
              fill: '#666', // combo 的文本颜色
            },
          },
        },
      })
    }

    const updateEdgeLabel = (type: EdgeEvent, edge: Item) => {

      if (type === EdgeEvent.Mouseenter) {
        // hover 边的时候出提示
        edge.update({
          labelCfg: {
            style: {
              opacity: 1,
              fill: '#5B8FF9',
              // @ts-expect-error g6 内部没定义好类型
              cursor: 'pointer',
            }
          }
        })
        return
      }
      // 移出边时需要隐藏提示
      edge.update({
        labelCfg: {
          style: {
            opacity: 0,
            // @ts-ignore  g6 内部没定义好类型
            cursor: 'pointer'
          }
        }
      })
    }

    const  refreshDragNodePosition = (e: unknown)=> {
      const model = e.item.get('model')
      model.fx = e.x
      model.fy = e.y
    }

    const initGraphEvent = (graph:Graph, opts: {
      onClickEdge?: (model: { target: string; source: string }) => void
      onClickNode?: (item: NodeClickItem) => void
    }) => {

      graph.on('node:mouseenter', (e) => {
        const node = e.item
        if (!node) return
        // hover 出文本
        const element = node.getKeyShape()
        element.attr('cursor', 'pointer')
      })
  
      graph.on('node:mouseleave', (e) => {
        const node = e.item
        if (!node) return
        const element = node.getKeyShape()
        element.attr('cursor', 'default')
      })
  
      // 目前只找到这种性能较低的方法
      graph.edge((edge) => {
        const sourceNode = graph.findById(edge.source as string)
        const theme = sourceNode?._cfg?.model?.isSelfSpace ? SELF_SPACE_CONTENT_EDGE_COLOR : OUT_SPACE_CONTENT_EDGE_COLOR
        return {
          id: edge.id,
          ...EDGE_STYLE,
          style: {
            stroke: theme,
            endArrow: {
              ...END_ARROW_STYLE,
              fill: theme
            }
          }
        }
      })
  
      graph.on('edge:mouseenter', (evt) => {
        if(evt.item){
          graph.setItemState(evt.item, 'running', true)
        }
        const edge = evt.item
        if (edge) {
          updateEdgeLabel(EdgeEvent.Mouseenter, edge)
          const model = edge.getModel()
          const { endPoint,startPoint } = model
          // y=endPoint.y - height / 2，在同一水平线上，x值=endPoint.x - width - 10
          const y = (endPoint.y + startPoint.y) /2
          const x = (endPoint.x  + startPoint.x )/2
          const point = graph.getCanvasByPoint(x, y)
          setEdgeTooltipX(point.x + 194) //  加上页面左侧导航菜单宽度
          setEdgeTooltipY(point.y + 50) // 加上页面顶部导航与按钮高度
          setShowEdgeTooltip(true)
          setEdgeTooltipContent(model?._projectInfo)
        }
      })
  
      graph.on('edge:mouseleave', (evt) => {
        const { item } = evt
        if (item) {
          graph.clearItemStates(item, ['running'])
          updateEdgeLabel(EdgeEvent.Mouseleave, item)
        }
          setEdgeTooltipContent(undefined)
          setShowEdgeTooltip(false)
      })
    }

    const getGraph = (
      opts: {
        onClickEdge?: (model: { target: string; source: string }) => void
        onClickNode?: (item: NodeClickItem) => void
      }
    ) => {
      const graph = initGraph()
      graph.setMaxZoom(3)
      graph.setMinZoom(0.2)
      initGraphEvent(graph, opts)
      return graph
    } 
    
    useEffect(()=>{
        if(topologyId !== undefined){
            setPictureType(PictureTypeEnum.Part)
            setCurrentNode(topologyId)
            return
        }
        setPictureType(PictureTypeEnum.Global)
    },[topologyId])

      useEffect(() => {
        if (graphContainerRef.current) {
            registerEdge('line-running',SYSTEM_TUNNING_CONFIG,'quadratic')
            const graph = getGraph({
            onClickNode: (item: NodeClickItem) => {
                clickNode(item)
            }})

            graph.on('beforelayout', async () => {
                updateSelected()
            })

            setGraph(graph)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            graphRef.current = graph;
        
            // 添加窗口大小变化的监听器
            window.addEventListener('resize', handleWindowResize);
        
            // 组件卸载时清理资源
            return () => {
                window.removeEventListener('resize', handleWindowResize);
                if (graphRef.current) {
                graphRef.current.destroy();
                }
            };
        }
      }, [handleWindowResize,showGraph,loading]);

    useEffect(()=>{
      if (!graph || !graphData || !showGraph || loading) return;
        graph.clear()
        graph.data(graphData)

        setTimeout(()=>{
          const { nodes } = graphData as GraphData
      
          if (nodes?.length) {
            graph.updateLayout({
              nodeSpacing: getNodeSpacing(nodes.length,nodes),
              comboSpacing: getNodeSpacing(nodes.length)
            })
          }
      
          graph.render()
        },200)
    },[graph,graphData,showGraph,loading])


    useEffect(() => {
      setBreadcrumb([{title:'系统拓扑图'}])
        getNodeData()
      }, []);

      return (<>
        {
        showGraph ?
          <div className="h-full overflow-hidden w-full">
          <div className="mt-[10px] ml-[10px] absolute top-navbar-height right-0">
            <div className="flex justify-between">
              <div>
              </div>
              <div className="border border-solid border-color-base rounded mr-[20px] z-[999] h-8 bg-[#fff]">
                <Button id="zoom-in-button" type="text" title="放大" icon={<ZoomInOutlined />} onClick={()=>updateZoomTo(true)}/>
                <Button id="zoom-out-button" type="text" title="缩小" icon={<ZoomOutOutlined />} onClick={()=>updateZoomTo(false)} />
              </div>
            </div>
          </div>
            <div className="h-full w-full"  ref={graphContainerRef} >

            
            </div>
        </div>
        :<Spin wrapperClassName="h-calc-100vh-minus-navbar" indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>} spinning={loading}>{!loading && <SystemRunningInstruction />}</Spin>
              }</>)
    }

    const EdgeToolTips = ({ x, y, content}) => {
      return (
        // <div
        //   className="absolute"
        //   style={{
        //     left: x,
        //     top: y
        //   }}
        // >
        //   <div className="edge-tooltip-arrow"></div>
        //   <div className="edge-tooltip-inner">
        //     <div className="edge-tooltip-title">Edge</div>
        //   </div>
        // </div>
        <Tooltip 
          open={true} 
          title={<div className="max-w-[200px] break-words flex flex-col">{
            content.map((x:TopologyServiceItem)=><span className="text-MAIN_TEXT">{x?.name || ''}</span>)
          }</div>}
          placement='bottomLeft'
          color="#fff"
          key="edge-tooltip"
        >
        <div  className="absolute"
          style={{
            left: x,
            top: y
          }}></div>
      </Tooltip>
      )
    }
    