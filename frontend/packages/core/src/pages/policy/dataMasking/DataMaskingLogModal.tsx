import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataMaskLogItem } from "@common/const/policy/type";
import PageList, { PageProColumns } from "@common/components/aoplatform/PageList";
import { $t } from "@common/locales";
import { App, Button, message, DatePicker, Modal } from 'antd'

import { DATA_MASKING_TABLE_LOG_COLUMNS, DATA_MASKING_TABLE_COLUMNS } from './DataMaskingColumn';
import { useGlobalContext } from '@common/contexts/GlobalStateContext';
import { ActionType } from '@ant-design/pro-components';
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const';
import { useParams } from 'react-router-dom';
import { RouterParams } from '@common/const/type';
import { useFetch } from '@common/hooks/http';
import WithPermission from '@common/components/aoplatform/WithPermission';
import TimeRangeSelector, { TimeRange } from '@common/components/aoplatform/TimeRangeSelector';
import { SearchBody } from '@dashboard/const/type';
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission';
const { RangePicker } = DatePicker;
const DataMaskingLogModal = (props: any) => {
  const { strategy } = props;
  const { state, accessData } = useGlobalContext()
  const { serviceId, teamId } = useParams<RouterParams>()
  const [datePickerValue, setDatePickerValue] = useState<any>();
  const [queryData, setQueryData] = useState<SearchBody>({})

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
   * 操作列
   */
  const operation: PageProColumns<any>[] = [
    {
      title: '操作',
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
          <TableBtnWithPermission access={`${serviceId === undefined ? 'system.devops' : 'team.service'}.policy.view`} key="view" btnType="view" onClick={() => { window.open(url,'_blank') }} btnTitle="查看" />
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
        x.render = (text: any, record: any) => <><span className='text-green-500'>{record.method}</span>&nbsp;<span>{text}</span></>
      }
      return {
        ...x,
        title: typeof x.title === 'string' ? $t(x.title as string) : x.title
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
      `strategy/${serviceId === undefined ? 'global' : 'service'}/data-masking/list`,
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
        const mockData: any = [
          {
            id: '12334',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:12',
          },
          {
            id: 'fff1',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:12',
          },
          {
            id: 'fff2',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:12',
          },
          {
            id: 'fff3',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:12',
          },
          {
            id: 'fff4',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:12',
          },
          {
            id: 'fff5',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:12',
          },
          {
            id: 'fff6',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:12',
          },
          {
            id: 'fff7',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:12',
          },
          {
            id: 'fff8',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:12',
          },
          {
            id: 'fff9',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:12',
          },
          {
            id: 'fff11',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:12',
          },
          {
            id: 'fff22',
            service: {
              id: 'xxx',
              name: 'xxx'
            },
            url: 'url',
            remote_ip: '9234923',
            consumer: {
              id: 'yyy',
              name: 'yyy'
            },
            method: 'GET',
            authorization: 'authorization',
            record_time: '2021-09-09 12:12:11',
          }

        ]
        // 保存数据
        return {
          data: mockData,
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
  const handleDatePickerChange = (dates: any) => {
    if (dates && Array.isArray(dates) && dates.length === 2) {
      const [startDate, endDate] = dates;
      const start = startDate!.startOf('day').unix(); // 开始日期的00:00:00
      const end = endDate!.endOf('day').unix(); // 结束日期的23:59:59
      handleTimeRangeChange({ start, end });
    } else {
      handleTimeRangeChange({ start: null, end: null})
    }
  }

  const resetQuery = () => {
    setDatePickerValue(null)
    handleTimeRangeChange({ start: null, end: null})

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
              <RangePicker
                onChange={handleDatePickerChange}
                value={datePickerValue} />
              <div className="flex [&>.reset-btn]:!h-auto flex-nowrap items-center ml-[10px]">
                <Button className="reset-btn" onClick={resetQuery}>{$t('重置')}</Button>
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