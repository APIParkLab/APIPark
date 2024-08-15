import TreeWithMore from "@common/components/aoplatform/TreeWithMore";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { BasicResponse, STATUS_CODE } from "@common/const/const";
import { PERMISSION_DEFINITION } from "@common/const/permissions";
import { useFetch } from "@common/hooks/http";
import { checkAccess } from "@common/utils/permission";
import { CategorizesType, ServiceHubCategoryConfigHandle } from "@market/const/serviceHub/type";
import { App, Button, Spin, Tree, TreeDataNode, TreeProps } from "antd";
import { DataNode } from "antd/es/tree";
import { Key, useEffect, useMemo, useRef, useState } from "react";
import { ServiceHubCategoryConfig } from "./ServiceHubCategoryConfig";
import { useGlobalContext } from "@common/contexts/GlobalStateContext";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext";
import { LoadingOutlined } from "@ant-design/icons";
import { cloneDeep } from "lodash-es";
import { Icon } from "@iconify/react/dist/iconify.js";
import InsidePage from "@common/components/aoplatform/InsidePage";
import { EntityItem } from "@common/const/type";

export default function ServiceCategory(){
   const [gData, setGData] = useState<CategorizesType[]>([]);
   const [cateData, setCateData] = useState<CategorizesType[]>([]);
   const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
   const {message,modal} = App.useApp()
   const {fetchData} = useFetch()
   const addRef = useRef<ServiceHubCategoryConfigHandle>(null)
   const addChildRef = useRef<ServiceHubCategoryConfigHandle>(null)
   const renameRef = useRef<ServiceHubCategoryConfigHandle>(null)
   const {accessData} = useGlobalContext()
   const { setBreadcrumb } = useBreadcrumb()
   const [loading, setLoading] = useState<boolean>(false)
  
    const onDrop: TreeProps['onDrop'] = (info) => {
      const dropKey = info.node.key;
      const dragKey = info.dragNode.key;
      const dropPos = info.node.pos.split('-');
      const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]); // the drop position relative to the drop node, inside 0, top -1, bottom 1

      const loop = (
        data: TreeDataNode[],
        key: React.Key,
        callback: (node: TreeDataNode, i: number, data: TreeDataNode[]) => void,
      ) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].id === key) {
            return callback(data[i], i, data);
          }
          if (data[i].children) {
            loop(data[i].children!, key, callback);
          }
        }
      };
      const data = cloneDeep(gData);
  
      // Find dragObject
      let dragObj: TreeDataNode;
      loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });
  
      if (!info.dropToGap) {
        // Drop on the content
        loop(data, dropKey, (item) => {
          item.children = item.children || [];
          // where to insert. New item was inserted to the start of the array in this example, but can be anywhere
          item.children.unshift(dragObj);
        });
      } else {
        let ar: TreeDataNode[] = [];
        let i: number;
        loop(data, dropKey, (_item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          // Drop on the top of the drop node
          ar.splice(i!, 0, dragObj!);
        } else {
          // Drop on the bottom of the drop node
          ar.splice(i! + 1, 0, dragObj!);
        }
      }

      setGData(data);
      sortCategories(data)
    };

    
    const dropdownMenu = (entity:CategorizesType) => [
        {
            key: 'addChildCate',
            label: (
                <WithPermission access="system.api_market.service_classification.add"><Button className="border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('addChildCate',entity)}>
                    添加子分类
                </Button></WithPermission>
            ),
        },
        {
            key: 'renameCate',
            label: (
                <WithPermission access="system.api_market.service_classification.edit"><Button className=" border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('renameCate',entity)}>
                    修改分类名称
                </Button></WithPermission>
            ),
        },
        {
            key: 'delete',
            label: (
                <WithPermission access="system.api_market.service_classification.delete"><Button className=" border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('delete',entity)}>
                    删除
                </Button></WithPermission>
            ),
        },
    ];

    const treeData = useMemo(() => {
        setExpandedKeys([])
        const loop = (data: CategorizesType[]): DataNode[] =>
            data?.map((item) => {
                if (item.children) {
                    setExpandedKeys(prev=>[...prev,item.id])
                    return {
                        title: <TreeWithMore
                            stopClick={false}
                            dropdownMenu={dropdownMenu(item as CategorizesType)}>{item.name}</TreeWithMore> ,
                        key: item.id, children: loop(item.children)
                    };
                }

                return {
                    title: <TreeWithMore
                        stopClick={false}
                        dropdownMenu={dropdownMenu(item as CategorizesType)}>{item.name}</TreeWithMore>,
                    key: item.id,
                };
            });
        return  loop(gData ?? [])
    }, [gData]);

    const isActionAllowed = (type:'addCate'|'addChildCate'|'renameCate'|'delete') => {
        const actionToPermissionMap = {
            'addCate': 'add',
            'addChildCate': 'add',
            'renameCate': 'edit',
            'delete': 'delete'
        };
        
        const action = actionToPermissionMap[type];
        const permission :keyof typeof PERMISSION_DEFINITION[0]= `system.api_market.service_classification.${action}`;
        
        return !checkAccess(permission, accessData);
    };

    const openModal = (type:'addCate'|'addChildCate'|'renameCate'|'delete',entity?:CategorizesType)=>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'addCate':
                title='添加分类'
                content=<ServiceHubCategoryConfig WithPermission={WithPermission} ref={addRef} type={type} />
                break;
            case 'addChildCate':
                title='添加子分类'
                content=<ServiceHubCategoryConfig WithPermission={WithPermission} ref={addChildRef} type={type} entity={entity}  />
                break;
            case 'renameCate':
                title='重命名分类'
                content=<ServiceHubCategoryConfig WithPermission={WithPermission} ref={renameRef} type={type} entity={entity}  />
                break;
            case 'delete':
                title='删除'
                content='该数据删除后将无法找回，请确认是否删除？'
                break;
        }
        modal.confirm({
            title,
            content,
            onOk:()=>{
                switch (type){
                    case 'addCate':
                        return addRef.current?.save().then((res)=>{if(res === true) getCategoryList()})
                    case 'addChildCate':
                        return addChildRef.current?.save().then((res)=>{if(res === true) getCategoryList()})
                    case 'renameCate':
                        return renameRef.current?.save().then((res)=>{if(res === true) getCategoryList()})
                    case 'delete':
                        return deleteCate(entity!).then((res)=>{if(res === true) getCategoryList()})
                }
            },
            width:600,
            okText:'确认',
            okButtonProps:{
                disabled : isActionAllowed(type)
            },
            cancelText:'取消',
            closable:true,
            icon:<></>,
        })
    }

    const deleteCate = (entity:CategorizesType)=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>('catalogue',{method:'DELETE',eoParams:{catalogue:entity.id},}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || '操作成功，即将刷新页面')
                    resolve(true)
                }else{
                    message.error(msg || '操作失败')
                    reject(msg || '操作失败')
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    const sortCategories = (newData:CategorizesType[])=>{
        setLoading(true)
        fetchData<BasicResponse<null>>('catalogue/sort',{method:'PUT',eoBody:newData}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                getCategoryList()
            }else{
                setGData(cateData)
                message.error(msg || '操作失败')
            }
        }).catch(()=>{setGData(cateData)}).finally(()=>{setLoading(false)})
    }

    const getCategoryList = ()=>{
        setLoading(true)
        fetchData<BasicResponse<{ catalogues:CategorizesType[],tags:EntityItem[]}>>('catalogues',{method:'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setGData(data.catalogues)
                setCateData(data.catalogues)
            }else{
                message.error(msg || '操作失败')
            }
        }).finally(()=>{setLoading(false)})
    }

    useEffect(()=>{
        setBreadcrumb([
            {
                title: '服务分类管理'}])
        getCategoryList()
    },[])

    return (
        <InsidePage 
                pageTitle='服务分类管理' 
                description="设置服务可选择的分类，方便团队成员快速找到API。"
                showBorder={false}
                >
            <div className="max-h-[calc(100%-75px)] border border-solid border-BORDER p-[20px] rounded-[10px]">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading} className=''>
                    <Tree
                        showIcon
                        draggable
                        blockNode
                        expandedKeys={expandedKeys}
                        onExpand={(expandedKeys:Key[])=>{setExpandedKeys(expandedKeys as string[])}}
                        onDrop={onDrop}
                        treeData={treeData}
                        />
                        <WithPermission access="system.api_market.service_classification.add">
                            <Button type="link" className="mt-[12px] pl-[0px]" onClick={()=>openModal('addCate')}><Icon icon="ic:baseline-add" width="18" height="18" className='mr-[2px]'/>添加分类</Button>
                        </WithPermission>
                    </Spin>
                </div>
        </InsidePage>
    )
}