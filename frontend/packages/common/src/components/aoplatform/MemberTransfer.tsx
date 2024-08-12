
import { GetProp, TransferProps, TreeDataNode, theme, Transfer, Tree, Spin } from "antd";
import { DataNode, TreeProps } from "antd/es/tree";
import {  Ref, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { TransferTableHandle, TransferTableProps } from "./TransferTable";
import { ApartmentOutlined, LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { debounce } from "lodash-es";

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];

interface TreeTransferProps {
  dataSource: TreeDataNode[];
  targetKeys: TransferProps['targetKeys'];
  onChange: TransferProps['onChange'];
}
  
// Customize Table Transfer
const isChecked = (selectedKeys: React.Key[], eventKey: React.Key) =>
  selectedKeys.includes(eventKey);

const generateTree = (
  treeNodes: TreeDataNode[] = [],
  checkedKeys: TreeTransferProps['targetKeys'] = [], 
  filterUnchecked: boolean = false,
  disabledData:string[],
  filteredItems?:Set<string>
): TreeDataNode[] => {
  const checkedKeysSet = new Set(checkedKeys);
  return treeNodes
    .map(({ children, ...props }) => {
      const childNodes = generateTree(children, checkedKeys, filterUnchecked, disabledData, filteredItems);
      const isDisabled = (!filterUnchecked && disabledData && disabledData.indexOf(props.id as string) !== -1) 
      ? true 
      : (filterUnchecked ? false : checkedKeysSet.has(props.id as string));
      const hasEnabledChild = childNodes.some(node => !node.disabled);

      return {
        ...props,
        title: <span className="w-full truncate ml-[4px] block">{props.name}</span>,
        key: props.id,
        disabled: isDisabled && !hasEnabledChild,
        children: childNodes,
      };
    })
    .filter(node => {
      let res:boolean= true
      if(filterUnchecked){
        res =(!disabledData || disabledData.indexOf(node.key as string) === -1) && (checkedKeysSet.has(node.key as string) || (node.children && node.children.length > 0) )
      }
    
      if(filterUnchecked && filteredItems &&((filteredItems.size && !filteredItems.has(node.key as string))&& !(node.children && node.children.length > 0) )){
        return false
      }
        return res
      }
    )
};

const TransferTree = (props)=>{
  const { direction, token, tableHeight, dataSource, targetKeys, onItemSelect, onItemSelectAll,checkedKey,selectedKeys, filteredItems ,disabledData} = props;
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const getExpandedKeys = (newData:TreeDataNode[], expandedSet:Set<string> = new Set())=>{
    newData.forEach((item)=>{
      if(item.children && item.children.length > 0){
        expandedSet.add(item.key)
        getExpandedKeys(item.children,expandedSet)
      }
    })
    return expandedSet
  }

  const treeData:TreeDataNode[] = useMemo(()=>{
    const filteredSet = filteredItems && filteredItems.length > 0 ? new Set(filteredItems.map((x)=>x.id))  : new Set()
    const res =  dataSource && dataSource.length > 0 ? generateTree(dataSource, targetKeys,direction === 'right',disabledData,filteredSet) : []
    setExpandedKeys(Array.from(getExpandedKeys(res)))
    return res
  },[
    dataSource, targetKeys,direction ,disabledData,filteredItems
  ])

  const onExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue as string[]);
  };

  return (
    
    <div style={{ padding: token.paddingXS }}>
      <Tree
          className="icon-tree"
          blockNode
          checkable
          showIcon
          checkedKeys={direction === 'left' ? Array.from(new Set([...checkedKey,...disabledData])) : selectedKeys }
          defaultExpandAll
          expandedKeys={expandedKeys}
          onExpand={onExpand}
          height={tableHeight}
          icon={(props)=> { return (props.type === 'member' ? <UserOutlined /> :<ApartmentOutlined /> )} }
          treeData={treeData}
          onCheck={(_checkedKeys, e:{checked: boolean, checkedNodes, node, event, halfCheckedKeys}) => {
              if(e.checked){
                  onItemSelectAll( _checkedKeys, e.checked);
              }else{
                  const checkedKeyArrFromTree = e.checkedNodes.map(node => node.key)
                  onItemSelectAll((checkedKey as string[]).filter(key => checkedKeyArrFromTree.indexOf(key) === -1),e.checked)
              }
          }}
          onSelect={(_, { node: { key } }) => {
              onItemSelect(key as string, !isChecked(checkedKey, key));
          }}
      />
    </div>
  )
}


 const MemberTransfer= forwardRef<TransferTableHandle<{[k:string]:unknown}>, TransferTableProps<{[k:string]:unknown}>>(
  <T extends {[k:string]:unknown}>(props: TransferTableProps<T>, ref:Ref<TransferTableHandle<T>>) => {
    const {request,columns,primaryKey,onSelect,tableType,disabledData = [],searchPlaceholder} = props
    const [tableHeight, setTableHeight] = useState(window.innerHeight * 80 / 100 - 64 - 72 - 56 - 16 -3);
    const [targetKeys, setTargetKeys] = useState<TreeTransferProps['targetKeys']>([]);
    const [dataSource, setDataSource] = useState<DataNode[] >([])
    const parentRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState<boolean>(false)

    
    useEffect(()=>{
      setTargetKeys(disabledData)
    },[disabledData])

    useImperativeHandle(ref, () =>({
      selectedData: () => dataSource,
      selectedRowKeys: () => targetKeys,}))

    const onChange: TreeTransferProps['onChange'] = (keys) => {
      onSelect?.(new Set(keys))
      setTargetKeys(Array.from(new Set(keys)));
    };

  const { token } = theme.useToken();

  const transferDataSource: TransferItem[] = useMemo(()=>{
      function flatten(list: TreeDataNode[] = [], res:TransferItem[]) {
        list.forEach((item) => {
          res.push(item as TransferItem);
          flatten(item.children,res);
        });
      }
      const res:TransferItem[] =[]
      flatten(dataSource,res);
      return res
  },[
    dataSource
  ])

  let memo: Record<string, boolean> = {};

  const handlerFilterOption = (inputValue: string, item: any, parentResult: boolean = false, childrenSet: Set<string> = new Set()): boolean => {
    const cacheKey = `${inputValue}_${item.key}`;
    if (memo[cacheKey]) {
      return memo[cacheKey];
    }

    childrenSet.add(item.key);
    let result = item.title.includes(inputValue) || parentResult
    if (item.children) {
      for (const child of item.children) {
        if (handlerFilterOption(inputValue, child, result,childrenSet)) {
          result = true;
        }
      }
    }
  
    if (result) {
      memo[cacheKey] = result;
      childrenSet.forEach((key) => {
        memo[`${inputValue}_${key}`] = result;
      });
    }
    return result;
  };
  
  const getDataSource = ()=>{
    setLoading(true)
    request && request().then((res)=>{
        const {data,success} = res
        setDataSource(success? data : [])
    }).finally(()=>{setLoading(false)})
}

useEffect(() => {
  getDataSource()
  const handleResize = () => {
      setTableHeight(window.innerHeight * 80 / 100 - 64 - 72 - 56 - 16 -3)
  };

  const debouncedHandleResize = debounce(handleResize, 200);

  // 监听窗口大小变化
  window.addEventListener('resize', debouncedHandleResize);
  handleResize();
  return () => {
    window.removeEventListener('resize', debouncedHandleResize);
  };
}, []);

    return (
        <div ref={parentRef}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading} className=''>
          <Transfer
            showSearch
            onSearch={(dir)=>{
              memo = {}; 
            }}
            listStyle={{width:'408px'}}
            disabledData={disabledData}
            filterOption={(inputValue: string, item: any) => handlerFilterOption(inputValue, item)}
            targetKeys={targetKeys}
            dataSource={transferDataSource}
            className="tree-transfer"
            render={(item) => item.title!}
            showSelectAll={false}
            onChange={onChange}
            titles={['','']}
            >
            {({ direction, onItemSelect, selectedKeys,onItemSelectAll ,filteredItems}) => {
              const treeProps = {
                dataSource, direction, onItemSelect, selectedKeys,onItemSelectAll ,filteredItems,token,tableHeight,targetKeys,disabledData
              }
                if (direction === 'left') {
                    const checkedKey = [...selectedKeys, ...targetKeys as string[]];
                    return (
                      <TransferTree {...treeProps} checkedKey={checkedKey} />
                    );
                }
                if(direction === 'right'){
                  const checkedKey = [...selectedKeys,...targetKeys as string[]];
                  return (
                     <TransferTree {...treeProps} checkedKey={checkedKey} />
                  );
                }
            }}
            </Transfer>
            </Spin>
        </div>
      );
})

export default MemberTransfer;