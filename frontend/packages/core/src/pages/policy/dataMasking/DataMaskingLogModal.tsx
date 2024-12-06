import React, { useMemo, useRef, useState } from 'react';
import { DataMaskLogItem } from "@common/const/policy/type";
import PageList, { PageProColumns } from "@common/components/aoplatform/PageList";
import { $t } from "@common/locales";
import { Button, message } from 'antd'

import { DATA_MASKING_TABLE_LOG_COLUMNS } from './DataMaskingColumn';
import { useGlobalContext } from '@common/contexts/GlobalStateContext';
import { ActionType } from '@ant-design/pro-components';
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const';
import { useParams } from 'react-router-dom';
import { RouterParams } from '@common/const/type';
import { useFetch } from '@common/hooks/http';
import TimeRangeSelector, { TimeRange } from '@common/components/aoplatform/TimeRangeSelector';
import { SearchBody } from '@dashboard/const/type';
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission';
const DataMaskingLogModal = (props: any) => {
  const { strategy } = props;
  const { state, accessData } = useGlobalContext()
  const { serviceId, teamId } = useParams<RouterParams>()
  const [datePickerValue, setDatePickerValue] = useState<any>();
  const currentSecond = Math.floor(Date.now() / 1000); // 当前秒级时间戳
  const [queryData, setQueryData] = useState<SearchBody>({
    start: currentSecond - 24 * 60 * 60,
    end: currentSecond
  })
  /**
   * 请求数据
   */
  const { fetchData } = useFetch()
  /**
  * 列表ref
  */
  const pageListRef = useRef<ActionType>(null);
  /**
   * 搜索关键字
   */
  const [searchWord, setSearchWord] = useState<string>('')
  /**
   * 重置时间范围
   */
  let resetTimeRange = () => {}
  /**
   * 时间按钮
   */
  const [timeButton, setTimeButton] = useState<'' | 'hour' | 'day' | 'threeDays' | 'sevenDays'>('day');
  /**
   * 绑定时间范围组件
   * @param instance
   */
  const bindRef = (instance: any) => {
    resetTimeRange = instance.reset
  };
  /**
   * 操作列
   */
  const operation: PageProColumns<any>[] = [
    {
      title: '',
      key: 'option',
      btnNums: 1,
      fixed: 'right',
      valueType: 'option',
      render: (_: React.ReactNode, entity: any) => {
        let url = `/dataMaskCompare/${entity.id}`
        if (serviceId) {
          url += `/${serviceId}`
        }
        if (teamId) {
          url += `/${teamId}`
        }
        return [
          <TableBtnWithPermission access={`${serviceId === undefined ? 'system.devops' : 'team.service'}.policy.view`} key="view" btnType="view" onClick={() => { window.open(url, '_blank') }} btnTitle="查看" />
        ]
      }
    }
  ]
  /**
 * 手动刷新表格数据
 */
  const manualReloadTable = () => {
    pageListRef.current?.reload()
  };
  const columns = useMemo(() => {
    const res = DATA_MASKING_TABLE_LOG_COLUMNS.map(x => {
      if (x.dataIndex === 'url') {
        x.render = (text: any, record: any) => <><div className='w-full'><span className='text-green-500'>{record.method}</span>&nbsp;<span className='w-[calc(100%-25px)] text-ellipsis overflow-hidden whitespace-nowrap inline-block align-top'>{text}</span></div></>
      }
      return {
        ...x,
        title: (<span title={$t(x.title as string)}>{$t(x.title as string)}</span>)
      }
    })
    return res
  }, [state.language])

  /**
 * 获取列表数据
 * @param dataType 
 * @returns 
 */
  const getPolicyList = (params: DataMaskLogItem & {
    pageSize: number;
    current: number;
  }) => {
    return fetchData<BasicResponse<{ logs: DataMaskLogItem[], total: number }>>(
      `strategy/${serviceId === undefined ? 'global' : 'service'}/data-masking/logs`,
      {
        method: 'GET',
        eoParams: {
          keyword: searchWord,
          begin: queryData?.start,
          end: queryData?.end,
          page: params.current,
          page_size: params.pageSize,
          strategy: strategy,
          service: serviceId,
          team: teamId,
        },
        eoTransformKeys: ['is_stop', 'is_delete', 'update_time', 'publish_status', 'processed_total']
      }
    ).then(response => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        // 保存数据
        return {
          data: data.logs || [],
          total: data.total,
          success: true
        }
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
        return { data: [], success: false }
      }
    }).catch(() => {
      return { data: [], success: false }
    })


  }
  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setQueryData(pre => ({ ...pre, ...timeRange } as SearchBody))
    manualReloadTable()

  };

  const resetQuery = () => {
    resetTimeRange()
  };

  return (
    <>
      <div className="w-full h-full p-[20px]">
        <PageList<DataMaskLogItem>
          id="data_masking_log_list"
          ref={pageListRef}
          minVirtualHeight={400}
          columns={[...columns, ...operation]}
          afterNewBtn={
            [<div className="flex items-center flex-wrap p-[10px] px-btnbase content-before bg-MAIN_BG ">
              <TimeRangeSelector
                labelSize="small"
                bindRef={bindRef}
                hideBtns={['hour']}
                defaultTimeButton="day"
                initialTimeButton={timeButton}
                onTimeButtonChange={setTimeButton}
                initialDatePickerValue={datePickerValue}
                onTimeRangeChange={handleTimeRangeChange} />
              <div className="flex flex-nowrap items-center  pt-btnybase">
                <Button onClick={resetQuery}>{$t('重置')}</Button>
              </div>
            </div>]
          }
          request={async (params: DataMaskLogItem & {
            pageSize: number;
            current: number;
          }) => getPolicyList(params)}
          searchPlaceholder={$t("输入调用地址、消费者IP和消费者条件查找")}
          onSearchWordChange={(e) => {
            setSearchWord(e.target.value)
          }}
          manualReloadTable={manualReloadTable}
        ></PageList>
      </div>
    </>
  )
};
export default DataMaskingLogModal;