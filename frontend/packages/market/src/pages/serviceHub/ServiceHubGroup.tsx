import {debounce} from "lodash-es";
import {SearchOutlined} from "@ant-design/icons";
import {App, Divider, Input, TreeDataNode} from "antd";
import  {useCallback, useEffect, useState} from "react";
import Tree, {DataNode} from "antd/es/tree";
import {BasicResponse, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { CategorizesType } from "../../const/serviceHub/type.ts";
import { filterServiceList, initialServiceHubListState, SERVICE_HUB_LIST_ACTIONS, ServiceHubListActionType } from "./ServiceHubList.tsx";
import { EntityItem } from "@common/const/type.ts";
import { $t } from "@common/locales/index.ts";

type ServiceHubGroup = {
    children:JSX.Element
    filterOption:typeof initialServiceHubListState
    dispatch:React.Dispatch<ServiceHubListActionType>
}

export const ServiceHubGroup = ({children,filterOption,dispatch}:ServiceHubGroup)=>{
    const {message} = App.useApp()
    const {fetchData} = useFetch()
    
    useEffect(() => {
        getTagAndServiceClassifyList()
    }, []);

    const onSearchWordChange = (e:string)=>{
        dispatch({type:SERVICE_HUB_LIST_ACTIONS.SET_KEYWORD,payload:e})
        dispatch({type:SERVICE_HUB_LIST_ACTIONS.LIST_LOADING,payload:true})
        dispatch({type:SERVICE_HUB_LIST_ACTIONS.SET_SERVICES,payload: filterServiceList({...filterOption,keyword:e})})
        dispatch({type:SERVICE_HUB_LIST_ACTIONS.LIST_LOADING,payload:false})
    }

    const getTagAndServiceClassifyList = ()=>{
        fetchData<BasicResponse<{ catalogues:CategorizesType[],tags:EntityItem[]}>>('catalogues',{method:'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                dispatch({type:SERVICE_HUB_LIST_ACTIONS.GET_CATEGORIES,payload:data.catalogues})
                dispatch({type:SERVICE_HUB_LIST_ACTIONS.GET_TAGS,payload:[...data.tags,{id:'empty',name:$t('无标签')}]})
                dispatch({type:SERVICE_HUB_LIST_ACTIONS.SET_SELECTED_CATE,payload:[...data.catalogues.map((x:CategorizesType)=>x.id)]})
                dispatch({type:SERVICE_HUB_LIST_ACTIONS.SET_SELECTED_TAG,payload:[...data.tags.map((x:EntityItem)=>x.id),'empty']})
            }else{
                message.error(msg || RESPONSE_TIPS.error)
            }
        })
    }
    
    const transferToTreeData = useCallback((data:CategorizesType[] | EntityItem[] ):TreeDataNode[]=>{
        const loop = (data: CategorizesType[] | EntityItem[] ): DataNode[] =>
            data?.map((item) => {
                if ((item as CategorizesType).children) {
                    return {
                        title:item.name,
                        key: item.id, children: loop((item as CategorizesType).children)
                    };
                }
                return {
                    title:item.name,
                    key: item.id,
                };
            });
        return loop(data || [])
    },[])

    const onCheckHandler = (type: 'SET_SELECTED_CATE' | 'SET_SELECTED_TAG' | 'SET_SELECTED_PARTITION') => (checkedKeys:string[]) => {
        dispatch({ type: SERVICE_HUB_LIST_ACTIONS[type], payload: checkedKeys });
        dispatch({type:SERVICE_HUB_LIST_ACTIONS.LIST_LOADING,payload:true})
        
        dispatch({type:SERVICE_HUB_LIST_ACTIONS.SET_SERVICES,payload: filterServiceList({...filterOption,[(type === 'SET_SELECTED_CATE' ? 'selectedCate' : type === 'SET_SELECTED_TAG' ? 'selectedTag' : 'selectedPartition' ) as keyof typeof filterOption]: checkedKeys })})
        dispatch({type:SERVICE_HUB_LIST_ACTIONS.LIST_LOADING,payload:false})
    };


    return (
        <div className="flex flex-1 h-full">
            <div className="w-[220px] border-0 border-solid border-r-[1px] border-r-BORDER">
            <div className=" h-full">
                <Input className="rounded-SEARCH_RADIUS m-[10px] h-[40px] bg-[#f8f8f8] w-[200px]" onChange={(e) => debounce(onSearchWordChange, 500)(e.target.value)}
                    allowClear placeholder={$t("搜索服务")}
                    prefix={<SearchOutlined className="cursor-pointer"/>}/>
                    <div className="h-[calc(100%-60px)] overflow-auto">
                        <div className="mt-[20px] ml-[20px] pr-[10px] ">
                            <p className="text-[18px] h-[25px] leading-[25px] font-bold mb-[15px]">{$t('分类')}</p>
                            <Tree
                                className={`no-selected-tree ${transferToTreeData(filterOption.categoriesList).filter(x=>x.children && x.children.length > 0).length > 0 ? '' : 'no-first-switch-tree'}`}
                                checkable
                                blockNode={true}
                                checkedKeys={filterOption.selectedCate}
                                onCheck={onCheckHandler('SET_SELECTED_CATE')}
                                treeData={transferToTreeData(filterOption.categoriesList)}
                                showIcon={false}
                                selectable={false}
                                />
                        </div>
                        <Divider  className="my-[20px]" />
                        <div className="ml-[20px] pr-[10px]">
                        <p className="text-[18px] h-[25px] leading-[25px] font-bold mb-[15px]">{$t('标签')}</p>
                            <Tree
                                className="no-first-switch-tree no-selected-tree"
                                checkable
                                blockNode={true}
                                checkedKeys={filterOption.selectedTag}
                                onCheck={onCheckHandler('SET_SELECTED_TAG')}
                                treeData={transferToTreeData(filterOption.tagsList)}
                                showLine={false}
                                showIcon={false}
                                selectable={false}
                                />
                        </div>
                </div>
            </div>
        </div>
        <div className="w-[calc(100%-220px)]">
          {children}
        </div>
    </div>);
}

export default ServiceHubGroup
