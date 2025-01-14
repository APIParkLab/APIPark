import { LoadingOutlined } from '@ant-design/icons'
import TreeWithMore from '@common/components/aoplatform/TreeWithMore'
import WithPermission from '@common/components/aoplatform/WithPermission'
import { BasicResponse, DELETE_TIPS, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { PERMISSION_DEFINITION } from '@common/const/permissions'
import { EntityItem } from '@common/const/type'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { checkAccess } from '@common/utils/permission'
import { Icon } from '@iconify/react/dist/iconify.js'
import { CategorizesType, ServiceHubCategoryConfigHandle } from '@market/const/serviceHub/type'
import { App, Button, Spin, Tree, TreeDataNode, TreeProps } from 'antd'
import { DataNode } from 'antd/es/tree'
import { cloneDeep } from 'lodash-es'
import { Key, useEffect, useMemo, useRef, useState } from 'react'
import { ServiceHubCategoryConfig } from './ServiceHubCategoryConfig'

export default function ServiceCategory() {
  const [gData, setGData] = useState<CategorizesType[]>([])
  const [cateData, setCateData] = useState<CategorizesType[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const { message, modal } = App.useApp()
  const { fetchData } = useFetch()
  const addRef = useRef<ServiceHubCategoryConfigHandle>(null)
  const addChildRef = useRef<ServiceHubCategoryConfigHandle>(null)
  const renameRef = useRef<ServiceHubCategoryConfigHandle>(null)
  const { accessData } = useGlobalContext()
  const [loading, setLoading] = useState<boolean>(false)

  const onDrop: TreeProps['onDrop'] = (info) => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]) // the drop position relative to the drop node, inside 0, top -1, bottom 1

    const loop = (
      data: TreeDataNode[],
      key: React.Key,
      callback: (node: TreeDataNode, i: number, data: TreeDataNode[]) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === key) {
          return callback(data[i], i, data)
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback)
        }
      }
    }
    const data = cloneDeep(gData)

    // Find dragObject
    let dragObj: TreeDataNode
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item) => {
        item.children = item.children || []
        // where to insert. New item was inserted to the start of the array in this example, but can be anywhere
        item.children.unshift(dragObj)
      })
    } else {
      let ar: TreeDataNode[] = []
      let i: number
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr
        i = index
      })
      if (dropPosition === -1) {
        // Drop on the top of the drop node
        ar.splice(i!, 0, dragObj!)
      } else {
        // Drop on the bottom of the drop node
        ar.splice(i! + 1, 0, dragObj!)
      }
    }

    setGData(data)
    sortCategories(data)
  }

  const dropdownMenu = (entity: CategorizesType) => [
    {
      key: 'addChildCate',
      label: (
        <WithPermission access="system.api_market.service_classification.add">
          <Button
            className="flex items-center p-0 bg-transparent border-none"
            onClick={() => openModal('addChildCate', entity)}
          >
            {$t('添加子分类')}
          </Button>
        </WithPermission>
      )
    },
    {
      key: 'renameCate',
      label: (
        <WithPermission access="system.api_market.service_classification.edit">
          <Button
            className="flex items-center p-0 bg-transparent border-none"
            onClick={() => openModal('renameCate', entity)}
          >
            {$t('修改分类名称')}
          </Button>
        </WithPermission>
      )
    },
    {
      key: 'delete',
      label: (
        <WithPermission access="system.api_market.service_classification.delete">
          <Button
            className="flex items-center p-0 bg-transparent border-none"
            onClick={() => openModal('delete', entity)}
          >
            {$t('删除')}
          </Button>
        </WithPermission>
      )
    }
  ]

  const treeData = useMemo(() => {
    setExpandedKeys([])
    const loop = (data: CategorizesType[]): DataNode[] =>
      data?.map((item) => {
        if (item.children) {
          setExpandedKeys((prev) => [...prev, item.id])
          return {
            title: (
              <TreeWithMore stopClick={false} dropdownMenu={dropdownMenu(item as CategorizesType)}>
                {item.name}
              </TreeWithMore>
            ),
            key: item.id,
            children: loop(item.children)
          }
        }

        return {
          title: (
            <TreeWithMore stopClick={false} dropdownMenu={dropdownMenu(item as CategorizesType)}>
              {item.name}
            </TreeWithMore>
          ),
          key: item.id
        }
      })
    return loop(gData ?? [])
  }, [gData])

  const isActionAllowed = (type: 'addCate' | 'addChildCate' | 'renameCate' | 'delete') => {
    const actionToPermissionMap = {
      addCate: 'add',
      addChildCate: 'add',
      renameCate: 'edit',
      delete: 'delete'
    }

    const action = actionToPermissionMap[type]
    const permission: keyof (typeof PERMISSION_DEFINITION)[0] = `system.api_market.service_classification.${action}`

    return !checkAccess(permission, accessData)
  }

  const openModal = (type: 'addCate' | 'addChildCate' | 'renameCate' | 'delete', entity?: CategorizesType) => {
    let title: string = ''
    let content: string | React.ReactNode = ''
    switch (type) {
      case 'addCate': {
        title = $t('添加分类')
        content = <ServiceHubCategoryConfig ref={addRef} type={type} />
        break
      }
      case 'addChildCate':
        title = $t('添加子分类')
        content = <ServiceHubCategoryConfig ref={addChildRef} type={type} entity={entity} />
        break
      case 'renameCate':
        title = $t('重命名分类')
        content = <ServiceHubCategoryConfig ref={renameRef} type={type} entity={entity} />
        break
      case 'delete':
        title = $t('删除')
        content = $t(DELETE_TIPS.default)
        break
    }
    modal.confirm({
      title,
      content,
      onOk: () => {
        switch (type) {
          case 'addCate':
            return addRef.current?.save().then((res) => {
              if (res === true) getCategoryList()
            })
          case 'addChildCate':
            return addChildRef.current?.save().then((res) => {
              if (res === true) getCategoryList()
            })
          case 'renameCate':
            return renameRef.current?.save().then((res) => {
              if (res === true) getCategoryList()
            })
          case 'delete':
            return deleteCate(entity!).then((res) => {
              if (res === true) getCategoryList()
            })
        }
      },
      width: 600,
      okText: $t('确认'),
      okButtonProps: {
        disabled: isActionAllowed(type)
      },
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  const deleteCate = (entity: CategorizesType) => {
    return new Promise((resolve, reject) => {
      fetchData<BasicResponse<null>>('catalogue', {
        method: 'DELETE',
        eoParams: { catalogue: entity.id }
      })
        .then((response) => {
          const { code, msg } = response
          if (code === STATUS_CODE.SUCCESS) {
            message.success(msg || $t(RESPONSE_TIPS.success))
            resolve(true)
          } else {
            message.error(msg || $t(RESPONSE_TIPS.error))
            reject(msg || $t(RESPONSE_TIPS.error))
          }
        })
        .catch((errorInfo) => reject(errorInfo))
    })
  }

  const sortCategories = (newData: CategorizesType[]) => {
    setLoading(true)
    fetchData<BasicResponse<null>>('catalogue/sort', { method: 'PUT', eoBody: newData })
      .then((response) => {
        const { code, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          getCategoryList()
        } else {
          setGData(cateData)
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .catch(() => {
        setGData(cateData)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const getCategoryList = () => {
    setLoading(true)
    fetchData<BasicResponse<{ catalogues: CategorizesType[]; tags: EntityItem[] }>>('catalogues', {
      method: 'GET'
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setGData(data.catalogues)
          setCateData(data.catalogues)
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    getCategoryList()
  }, [])

  return (
    <div className="border border-solid border-BORDER p-[20px] rounded-[10px] ">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading} className="">
        <Tree
          showIcon
          draggable
          blockNode
          expandedKeys={expandedKeys}
          onExpand={(expandedKeys: Key[]) => {
            setExpandedKeys(expandedKeys as string[])
          }}
          onDrop={onDrop}
          treeData={treeData}
        />
        <WithPermission access="system.api_market.service_classification.add">
          <Button type="link" className="mt-[12px] pl-[0px]" onClick={() => openModal('addCate')}>
            <Icon icon="ic:baseline-add" width="18" height="18" className="mr-[2px]" />
            {$t('添加分类')}
          </Button>
        </WithPermission>
      </Spin>
    </div>
  )
}
