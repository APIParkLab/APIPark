import { TransferProps, TreeDataNode, Tree, Spin, Input, Empty } from 'antd'
import { DataNode } from 'antd/es/tree'
import { Ref, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { ApartmentOutlined, LoadingOutlined, UserOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/es/table'
import { $t } from '@common/locales'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'

export type TransferTableProps<T> = {
  request?: (k?: string) => Promise<{ data: T[]; success: boolean }>
  columns: ColumnsType<T>
  primaryKey: string
  onSelect: (selectedData: string[]) => void
  tableType?: 'member' | 'api'
  disabledData: string[]
  searchPlaceholder?: string
}

export type TransferTableHandle<T> = {
  selectedRowKeys: () => React.Key[]
}

interface TreeTransferProps {
  dataSource: TreeDataNode[]
  targetKeys: TransferProps['targetKeys']
  onChange: TransferProps['onChange']
}

const generateTree = (
  treeNodes: TreeDataNode[] = [],
  checkedKeys: TreeTransferProps['targetKeys'] = [],
  filterUnchecked: boolean = false,
  disabledData: string[],
  filteredItems?: Set<string>
): TreeDataNode[] => {
  const checkedKeysSet = new Set(checkedKeys)
  return treeNodes
    .map(({ children, ...props }) => {
      const childNodes = generateTree(children, checkedKeys, filterUnchecked, disabledData, filteredItems)
      const isDisabled =
        !filterUnchecked && disabledData && disabledData.indexOf(props.id as string) !== -1
          ? true
          : filterUnchecked
            ? false
            : checkedKeysSet.has(props.id as string)
      const hasEnabledChild = childNodes.some((node) => !node.disabled)

      return {
        ...props,
        title: <span className="w-full truncate ml-[4px] block">{props.name}</span>,
        key: props.id,
        disabled: isDisabled && !hasEnabledChild,
        children: childNodes
      }
    })
    .filter((node) => {
      let res: boolean = true
      if (filterUnchecked) {
        res =
          (!disabledData || disabledData.indexOf(node.key as string) === -1) &&
          (checkedKeysSet.has(node.key as string) || (node.children && node.children.length > 0))
      }

      if (
        filterUnchecked &&
        filteredItems &&
        filteredItems.size &&
        !filteredItems.has(node.key as string) &&
        !(node.children && node.children.length > 0)
      ) {
        return false
      }
      return res
    })
}

const MemberTransfer = forwardRef<
  TransferTableHandle<{ [k: string]: unknown }>,
  TransferTableProps<{ [k: string]: unknown }>
>(<T extends { [k: string]: unknown }>(props: TransferTableProps<T>, ref: Ref<TransferTableHandle<T>>) => {
  const { request, columns, primaryKey, onSelect, tableType, disabledData = [], searchPlaceholder } = props
  const [targetKeys, setTargetKeys] = useState<TreeTransferProps['targetKeys']>([])
  const [dataSource, setDataSource] = useState<DataNode[]>([])
  const parentRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { state } = useGlobalContext()
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [searchWord, setSearchWord] = useState<string>('')
  useEffect(() => {
    setTargetKeys(disabledData)
  }, [disabledData])

  useImperativeHandle(ref, () => ({
    selectedRowKeys: () => targetKeys
  }))

  const translatedDataSource = useMemo(() => {
    const loop = (data: DataNode[]): DataNode[] =>
      data?.map((item) => {
        const strTitle: string = item.name === '所有成员' ? ($t(item.name) as string) : (item.name as string)
        const index = strTitle.indexOf(searchWord)
        const beforeStr = strTitle.substring(0, index)
        const afterStr = strTitle.slice(index + searchWord.length)
        const title =
          index > -1 ? (
            <span className="w-[calc(100%-16px)] truncate" title={strTitle}>
              {beforeStr}
              <span className="text-theme">{searchWord}</span>
              {afterStr}
            </span>
          ) : (
            <span className="w-[calc(100%-16px)] truncate" title={`${strTitle}`}>
              {strTitle}
            </span>
          )
        if (item.children) {
          return {
            ...item,
            title,
            disableCheckbox: disabledData.indexOf(item.key as string) !== -1,
            icon: <ApartmentOutlined />,
            children: loop(item.children as T[])
          }
        }

        return {
          ...item,
          title,
          icon: <UserOutlined />,
          isLeaf: true,
          disableCheckbox: disabledData.indexOf(item.key as string) !== -1
        }
      })
    return loop(dataSource)
  }, [dataSource, state.language, searchWord])

  const getInitExpandKeys = (data: T[], expandKeys: string[] = []) => {
    data.forEach((item) => {
      if (item.children?.length) {
        expandKeys.push(item.key as string)
        getInitExpandKeys(item.children, expandKeys)
      }
    })
    return expandKeys
  }

  const getDataSource = () => {
    setLoading(true)
    request &&
      request()
        .then((res) => {
          const { data, success } = res
          setDataSource(success ? data : [])
          setExpandedKeys(getInitExpandKeys(success ? data : []))
        })
        .finally(() => {
          setLoading(false)
        })
  }

  useEffect(() => {
    getDataSource()
  }, [])

  return (
    <div ref={parentRef}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading} className="">
        <Input
          className="mb-[10px]"
          placeholder={searchPlaceholder}
          onChange={(e) => setSearchWord(e.target.value)}
          value={searchWord}
        />
        <>
          {translatedDataSource && translatedDataSource.length > 0 ? (
            <Tree
              checkable
              expandedKeys={expandedKeys}
              checkedKeys={targetKeys}
              selectable={false}
              onCheck={(e) => {
                setTargetKeys(e)
                onSelect((e as string[])?.filter((x) => disabledData.indexOf(x as string) === -1) || [])
              }}
              onExpand={setExpandedKeys}
              treeData={translatedDataSource}
              blockNode
              showIcon
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </>
      </Spin>
    </div>
  )
})

export default MemberTransfer
