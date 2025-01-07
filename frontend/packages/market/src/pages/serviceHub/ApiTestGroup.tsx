import { SearchOutlined } from '@ant-design/icons'
import ApiTest from '@common/components/postcat/ApiTest.tsx'
import { ApiDetail } from '@common/const/api-detail'
import { $t } from '@common/locales'
import { Empty, Input } from 'antd'
import { DataNode } from 'antd/es/tree'
import DirectoryTree from 'antd/es/tree/DirectoryTree'
import { debounce } from 'lodash-es'
import { useEffect, useMemo, useState } from 'react'

type ApiTestGroupType = {
  apiInfoList: ApiDetail[]
  selectedApiId: string
}
export default function ApiTestGroup({ apiInfoList, selectedApiId }: ApiTestGroupType) {
  const [searchWord, setSearchWord] = useState<string>('')
  const [selectedApi, setSelectedApi] = useState<string[]>([selectedApiId])
  const [selectedApiInfo, setSelectedApiInfo] = useState<ApiDetail>()
  const onSearchWordChange = (e: unknown) => {}

  useEffect(() => {
    setSelectedApi([selectedApiId])
  }, [selectedApiId])
  const treeData = useMemo(() => {
    const loop = (data: ApiDetail[]): DataNode[] =>
      data?.map((item) => {
        const strTitle = item.name as string
        const index = strTitle.indexOf(searchWord)
        const beforeStr = strTitle.substring(0, index)
        const afterStr = strTitle.slice(index + searchWord.length)
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span className="text-theme">{searchWord}</span>
              {afterStr}
            </span>
          ) : (
            <span>{strTitle}</span>
          )

        return {
          title,
          key: item.id
        }
      })
    return loop(apiInfoList)
  }, [searchWord, apiInfoList])

  useEffect(() => {
    apiInfoList && apiInfoList.length > 0 && setSelectedApi([apiInfoList[0].id])
  }, [apiInfoList])

  useEffect(() => {
    setSelectedApiInfo(selectedApi ? apiInfoList.filter((x) => x.id === selectedApi[0])?.[0] || undefined : undefined)
  }, [selectedApi])

  return (
    <div className="flex flex-1 w-full h-full">
      <div className="w-[220px] p-btnbase border-0 border-solid border-r-[1px] border-r-BORDER">
        <Input
          className="my-btnybase"
          onChange={(e) => debounce(onSearchWordChange, 100)(e)}
          allowClear
          placeholder={$t('搜索分类或标签')}
          prefix={
            <SearchOutlined
              className="cursor-pointer"
              onClick={(e) => {
                onSearchWordChange(e)
              }}
            />
          }
        />
        <DirectoryTree
          icon={<></>}
          className="hidden-switcher"
          blockNode={true}
          treeData={treeData}
          selectedKeys={selectedApi}
          onSelect={(selectedKeys) => {
            setSelectedApi([selectedKeys[0] as string])
          }}
        />
      </div>
      {selectedApiInfo ? (
        <ApiTest apiInfo={selectedApiInfo} />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={$t('暂无API数据')} />
      )}
    </div>
  )
}
