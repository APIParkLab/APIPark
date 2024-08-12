
import DirectoryTree from "antd/es/tree/DirectoryTree";
import { DataNode, DirectoryTreeProps } from "antd/lib/tree";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import TreeWithMore from "@common/components/aoplatform/TreeWithMore";
import { SearchOutlined } from "@ant-design/icons";
import { Input, Button, MenuProps } from "antd";
import { debounce } from "lodash-es";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { v4 as uuidv4 } from 'uuid'

type T = unknown

export interface GroupTreeProps extends DirectoryTreeProps{
    groupData?:(DataNode & T )[]
    addBtnName?:React.ReactNode
    addBtnAccess?:string
    treeNameSuffixKey?:string
    dropdownMenu?:(data:(DataNode & T )) => MenuProps['items']
    withMore?:boolean
    onEditGroup:(type:'rename'|'addChild'|'addPeer', entity:DataNode & T, val:string) => Promise<boolean>|undefined
    placeholder?:string
}

export interface GroupTreeHandle {
    startEdit:(id:string)=>void;
    startAdd:(type:'peer',entity?:DataNode & T)=>void
}

const GroupTree = forwardRef<GroupTreeHandle,GroupTreeProps>((props, ref)=>{
    const {groupData,selectedKeys,onSelect,addBtnName,addBtnAccess,treeNameSuffixKey,dropdownMenu,onEditGroup,placeholder="输入以搜索"} = props
    const [treeData, setTreeData] = useState<DataNode[]>([])
    const [searchWord, setSearchWord] = useState<string>('')
    const [editingId, setEditingId] = useState<string>('')
    const [addStatus, setAddStatus] = useState<boolean>(false)

    useImperativeHandle(ref, ()=>({
        startEdit:setEditingId,
        startAdd:handlerAction
    }))

    const handlerAction = (type:'peer')=>{
        if(type === 'peer'){
            setAddStatus(true)
            setEditingId(uuidv4())
        }
    }

    const getTreeData = (rawData?:DataNode[])=>{
        const loop = (data: DataNode[]): DataNode[] =>{
            const newData = [...data,...(addStatus? [{title:'',key:editingId,id:editingId}]:[])]
            return newData.map((item) => {
                const strTitle = item.title as string;
                const index = strTitle.indexOf(searchWord);
                const beforeStr = strTitle.substring(0, index);
                const afterStr = strTitle.slice(index + searchWord.length);
                const title =
                    index > -1 ? (
                        <span >
              {beforeStr}
                            <span className="text-theme">{searchWord}</span>
                            {afterStr} {treeNameSuffixKey && <span>({item?.[treeNameSuffixKey as keyof DataNode] as string ?? 0})</span>}
                </span>) : (
                        <span className='w-[100%] truncate'>{strTitle}{treeNameSuffixKey && <span>({item?.[treeNameSuffixKey as keyof DataNode] as string?? 0})</span>}</span>
                    )
                return {
                    title:<TreeWithMore dropdownMenu={dropdownMenu?.(item)} onBlur={()=>{setAddStatus(false);setEditingId('')}} editable editingId={editingId} entity={item} afterEdit={(val)=>onEditGroup?.(addStatus && editingId === item.key ? 'addPeer':'rename',item, val)?.then((res)=>{res && setEditingId('') ;res && setAddStatus(false) ; return res})}>{title}</TreeWithMore>,
                    key: item.key,
                    id:item.key
                };
            })
        };
        return rawData ? loop(rawData) :[];
    }

    
    const onSearchWordChange = (e:string)=>{
        setSearchWord(e || '')
    }

    useEffect(()=>{
        const n = getTreeData(groupData)
        setTreeData(n)
    },[groupData,editingId,searchWord])

    return (
        <>
            <Input className="w-[calc(100%-24px)] mx-btnbase my-btnybase" onChange={(e) => debounce(onSearchWordChange, 100)(e.target.value)}
            allowClear placeholder={placeholder}
            prefix={ <SearchOutlined className="cursor-pointer" />}/>
            <div className="max-h-[calc(100%-140px)] overflow-y-auto">
                <DirectoryTree
                    icon={<></>}
                    blockNode={true}
                    treeData={treeData}
                    selectedKeys={selectedKeys}
                    onSelect={onSelect}
                />  
            </div>
            {addBtnName && <WithPermission access={addBtnAccess}><Button className="h-[22px] mt-[20px] mb-[16px] bottom-[0px] sticky border-none p-0 flex items-center bg-transparent text-theme ml-[10px] hover:text-A_HOVER"  key='add' onClick={()=>handlerAction('peer')} >{addBtnName}</Button></WithPermission>}
        </>
    )
})

export default GroupTree