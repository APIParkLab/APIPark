import { useMemo, useRef, useEffect } from 'react'
import PageList from '@common/components/aoplatform/PageList'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { $t } from '@common/locales/index.ts'
import { Card } from 'antd'
import { AI_SERVICE_TOP_RANKING_LIST, REST_SERVICE_TOP_RANKING_LIST } from '@core/const/system/const'

interface RankingListData {
  [key: string]: Array<{
    id: string;
    name: string;
    request: number;
    token?: number;
    traffic?: number;
  }>;
}

interface PageListRef {
  reload: () => void;
  [key: string]: any;
}

/**
 * 排名列表
 * @returns 
 */
const RankingList = ({ topRankingList, serviceType }: { topRankingList: RankingListData; serviceType: 'aiService' | 'restService' }) => {
  /** 全局状态 */
  const { state } = useGlobalContext()
  /** 表格 ref */
  const tableRefs = useRef<{ [key: string]: PageListRef | null }>({});
  /** 列 */
  const columns = useMemo(() => {
    return [...(serviceType === 'aiService' ? AI_SERVICE_TOP_RANKING_LIST : REST_SERVICE_TOP_RANKING_LIST)].map((x) => {
      return {
        ...x,
        title: typeof x.title === 'string' ? $t(x.title as string) : x.title
      }
    })
  }, [serviceType, state.language])

  /** 监听 serviceType 变化，刷新所有表格 */
  useEffect(() => {
    // 重新加载所有表格数据
    if (Object.keys(tableRefs.current).length > 0) {
      Object.values(tableRefs.current).forEach(ref => {
        // 如果组件实例存在并且有reload方法
        if (ref && typeof ref.reload === 'function') {
          ref.reload();
        }
      });
    }
  }, [serviceType, topRankingList])

  /**
   * 获取表格数据
   * @param item
   * @returns
   */
  const getTableData = (item: string) => {
    return new Promise((resolve, reject) => {
      resolve({ data: topRankingList[item], success: true })
    })
  }
  return (
    <div className="flex w-full pb-[10px]">
      {Object.keys(topRankingList)?.map((item: any, index: number) => (
        <Card
          key={index}
          className={`flex-1 min-w-[430px] h-fit rounded-[10px] ${index > 0 ? 'ml-[10px]' : ''}`}
          classNames={{
            body: 'p-[15px]'
          }}
        >
          <div className="mb-[10px]">
            <span className="text-[14px] text-[#999999]" style={{ fontFamily: 'Microsoft YaHei' }}>{item === 'TOP API' ? $t('API 使用排名') : $t('消费者使用排名')}</span>
          </div>
          <PageList
            id={item}
            columns={[...columns]}
            minVirtualHeight={430}
            noScroll
            request={() => getTableData(item)}
            showPagination={false}
            tableClass="ranking-list"
            ref={ref => {
              if (ref) tableRefs.current[item] = ref;
            }}
          />
        </Card>
      ))}
    </div>
  )
}

export default RankingList
