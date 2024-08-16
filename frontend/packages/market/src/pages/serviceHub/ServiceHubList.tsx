import {ActionType } from "@ant-design/pro-components";
import  {FC, forwardRef, useEffect, useReducer, useRef} from "react";
import { useNavigate, useParams} from "react-router-dom";
import {App,Card, Avatar, Tag, Empty, Spin, Tooltip} from "antd";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import {  CategorizesType, ServiceHubTableListItem } from "../../const/serviceHub/type.ts";
import { VirtuosoGrid } from 'react-virtuoso';
import { ApiOutlined,LoadingOutlined } from "@ant-design/icons";
import ServiceHubGroup from "./ServiceHubGroup.tsx";
import { EntityItem } from "@common/const/type.ts";

export enum SERVICE_HUB_LIST_ACTIONS {
    GET_CATEGORIES = 'GET_CATEGORIES',
    GET_TAGS ='GET_TAGS',
    GET_SERVICES = 'GET_SERVICES',
    SET_SERVICES='SET_SERVICES',
    SET_SELECTED_CATE = 'SET_SELECTED_CATE',
    SET_SELECTED_TAG = 'SET_SELECTED_TAG',
    SET_KEYWORD = 'SET_KEYWORD',
    LIST_LOADING = 'LIST_LOADING'
  }

export type ServiceHubListActionType = 
| { type: SERVICE_HUB_LIST_ACTIONS.GET_CATEGORIES, payload: CategorizesType[] }
| { type: SERVICE_HUB_LIST_ACTIONS.GET_TAGS, payload: EntityItem[] }
| { type: SERVICE_HUB_LIST_ACTIONS.GET_SERVICES, payload: ServiceHubTableListItem[] }
| { type: SERVICE_HUB_LIST_ACTIONS.SET_SERVICES, payload: ServiceHubTableListItem[] }
| { type: SERVICE_HUB_LIST_ACTIONS.SET_SELECTED_CATE, payload: string[] }
| { type: SERVICE_HUB_LIST_ACTIONS.SET_SELECTED_TAG, payload: string[] }
| { type: SERVICE_HUB_LIST_ACTIONS.SET_KEYWORD, payload: string }
| { type: SERVICE_HUB_LIST_ACTIONS.LIST_LOADING, payload: boolean }

export const initialServiceHubListState = {
    categoriesList: [] as CategorizesType[],
    tagsList: [] as EntityItem[],
    servicesList: [] as ServiceHubTableListItem[],
    showServicesList: [] as ServiceHubTableListItem[],
    selectedCate: [] as string[],
    selectedTag: [] as string[],
    keyword: '',
    getCateAndTagData:false,
    listLoading:false,
  };
  
  function reducer(state: typeof initialServiceHubListState, action: ServiceHubListActionType) {
    switch (action.type) {
        case SERVICE_HUB_LIST_ACTIONS.GET_CATEGORIES: 
            return { ...state, categoriesList: action.payload , getCateAndTagData:true};
        case SERVICE_HUB_LIST_ACTIONS.GET_TAGS: 
            return { ...state, tagsList: action.payload , getCateAndTagData:true};
        case SERVICE_HUB_LIST_ACTIONS.GET_SERVICES: 
            return { ...state, servicesList: action.payload };
        case SERVICE_HUB_LIST_ACTIONS.SET_SERVICES: 
            return { ...state, showServicesList: action.payload };
        case SERVICE_HUB_LIST_ACTIONS.SET_SELECTED_CATE: 
            return { ...state, selectedCate: action.payload };
        case SERVICE_HUB_LIST_ACTIONS.SET_SELECTED_TAG: 
            return { ...state, selectedTag: action.payload };
        case SERVICE_HUB_LIST_ACTIONS.SET_KEYWORD: 
            return { ...state, keyword: action.payload };
        case SERVICE_HUB_LIST_ACTIONS.LIST_LOADING: 
            return { ...state, listLoading: action.payload };
        default:
            return state;
    }
  }

  export const filterServiceList = (dataSet: typeof initialServiceHubListState)=>{
    if(!dataSet.getCateAndTagData ){
        return dataSet.servicesList
    }else{
        return dataSet.servicesList.filter((x)=>{
            if(!dataSet.selectedCate || dataSet.selectedCate.length === 0 || dataSet.selectedCate.indexOf(x.catalogue.id) === -1) return false
            if(!dataSet.selectedTag || dataSet.selectedTag.length === 0) return false
            if((!x.tags || !x.tags.length )&& dataSet.selectedTag.indexOf('empty') === -1) return false
            if(x.tags && x.tags.length && !x.tags.some(tag => dataSet.selectedTag.includes(tag.id))) return false;
            if( dataSet.keyword && !x.name.includes(dataSet.keyword)) return false
            return true
        })
    }
}

const ServiceHubList:FC = ()=>{
    const { setBreadcrumb} = useBreadcrumb()
    const { message } = App.useApp()
    const {fetchData} = useFetch()
    const { categoryId, tagId} = useParams<RouterParams>()
    const pageListRef = useRef<ActionType>(null);
    // const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');
    const navigate = useNavigate()
    const [filterOption, dispatch] = useReducer(reducer, initialServiceHubListState)

    const getServiceList = ()=>{
        dispatch({type:SERVICE_HUB_LIST_ACTIONS.LIST_LOADING,payload:true})
        fetchData<BasicResponse<{services:ServiceHubTableListItem}>>('catalogue/services',{method:'GET',eoTransformKeys:['api_num','subscriber_num']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                dispatch({type:SERVICE_HUB_LIST_ACTIONS.GET_SERVICES,payload:data.services})
                dispatch({type:SERVICE_HUB_LIST_ACTIONS.SET_SERVICES,payload: filterServiceList({...filterOption, servicesList:data.services})})
               
            }else{
                message.error(msg || '操作失败')
            }
        }).finally(()=>{ dispatch({type:SERVICE_HUB_LIST_ACTIONS.LIST_LOADING,payload:false})})
    }

    const showDocumentDetail = (entity:ServiceHubTableListItem)=>{
        navigate(`../detail/${entity.id}`)
    }

    useEffect(() => {
        pageListRef.current?.reload()
    }, [categoryId,tagId]);
    useEffect(() => {
        setBreadcrumb(
            [
                {title:'服务市场'}
            ]
        )
        getServiceList()
    }, []);

    return (
        <ServiceHubGroup filterOption={filterOption} dispatch={dispatch}>
            <div className="h-full  padding-top-40"> 
        <Spin className="h-full" wrapperClassName="h-full"  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={filterOption.listLoading}>
            {filterOption.showServicesList && filterOption.showServicesList.length > 0 ? <VirtuosoGrid
            style={{ height: '100%'}} 
            data={filterOption.showServicesList}
            totalCount={filterOption.showServicesList.length}
            itemContent={(index) => {
                const item = filterOption.showServicesList[index];
            return (
                <div className="pt-[20px]">
                <Card title={CardTitle(item)} className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible cursor-pointer h-[180px] m-0 transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]"  classNames={{header:'border-b-[0px] p-[20px] ', body:"pt-0"}} onClick={()=>showDocumentDetail(item)}>
                   <span className="line-clamp-3  text-[12px] text-[#666] " 
                    style={{'word-break':'auto-phrase'}}>{item.description || '暂无服务描述'}</span> 
                </Card>
                </div>
            );
            }}
            components={{
                List: forwardRef(({ style, children, ...props }, ref) => (
                <div
                    ref={ref}
                    {...props}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        columnGap: '20px',
                        padding:'40px',
                        ...style,
                        paddingBottom:'40px'
                    }}
                >
                    {children}
                </div>
                )),
                Item: ({ children, ...props }) => (
                <>
                    {children}</>
                )
            }}
        />:<Empty  image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
        </Spin>
        </div>
      </ServiceHubGroup>
    )

}
export default ServiceHubList

const CardTitle = (service:ServiceHubTableListItem)=>{
    return(
        <div className="flex">
            <Avatar shape="square" size={50} className=" border-none bg-[linear-gradient(135deg,white,#f0f0f0)] text-[#333] rounded-[12px]" src={service.logo ?  <img src={service.logo} alt="Logo" style={{  maxWidth: '200px', width:'45px',height:'45px',objectFit:'unset'}} /> : undefined}> {service.logo ? '' : service.name.substring(0,1)}</Avatar>
            <div className="pl-[20px] w-[calc(100%-50px)]">
                <p className="text-[14px] h-[20px] leading-[20px] truncate w-full">{service.name}</p>
                <div className="mt-[10px] h-[20px] flex items-center font-normal">
                    <Tag color="#7371fc1b" className="text-theme font-normal border-0 mr-[12px] max-w-[150px] truncate" key={service.id} bordered={false} title={service.catalogue?.name || '-'}>{service.catalogue?.name || '-'}</Tag>
                   
                    <Tooltip  title='API 数量'>
                        <span className="mr-[12px]"><ApiOutlined className="mr-[1px] text-[14px] h-[14px] w-[14px]"/><span className="font-normal text-[14px]">{service.apiNum ?? '-'}</span></span>
                    </Tooltip>
                    <Tooltip  title='接入应用数量'>
                        <span className="mr-[12px] flex items-center"><span className="h-[14px] mr-[4px] flex items-center"><iconpark-icon  className="max-h-[14px]  h-[14px] w-[14px]"  name="auto-generate-api"></iconpark-icon></span><span className="font-normal text-[14px]">{service.subscriberNum ?? '-'}</span></span>
                    </Tooltip>
                </div>
            </div>
        </div>
    )
}