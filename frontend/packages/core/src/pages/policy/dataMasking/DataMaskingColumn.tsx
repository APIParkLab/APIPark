
import { PageProColumns } from "@common/components/aoplatform/PageList";
import { frontendTimeSorter } from "@common/utils/dataTransfer";
import { $t } from "@common/locales";
import { StrategyStatusEnum, StrategyStatusColorClass } from "@common/const/policy/consts";


export const DATA_MASKING_TABLE_COLUMNS: PageProColumns<any>[] = [
  {
    title: ('策略名称'),
    dataIndex: 'name',
    ellipsis: true,
    width: 160
  },
  {
    title: ('优先级'),
    dataIndex: 'priority',
    width: 90,
    ellipsis: true,
    sorter: (a: any, b: any) => {
      return (a.priority as number) - (b.priority as number)
    }
  },
  {
    title: ('发布状态'),
    dataIndex: 'publishStatus',
    filters: true,
    onFilter: false ,
    ellipsis: true,
    width: 110,
    valueEnum: new Map(
      Object.keys(StrategyStatusEnum).map(key=>
        [key,
        <span className={StrategyStatusColorClass[key as keyof typeof StrategyStatusColorClass]}>{$t(StrategyStatusEnum[key as keyof typeof StrategyStatusEnum])}</span>
      ]))
  },
  {
    title: ('启用'),
    dataIndex: 'isStop',
    filters: true,
    onFilter: false ,
    ellipsis: true,
    width: 90,
    valueEnum: {
      false: { text: <span className="text-status_success">{$t('启用')}</span> },
      true: { text: <span className="text-status_fail">{$t('禁用')}</span> }
    }
  },
  {
    title: ('筛选条件'),
    dataIndex: 'filters',
    ellipsis: true
  },
  {
    title: ('处理数'),
    dataIndex: 'processedTotal',
    ellipsis: true,
    width: 80,
  },
  {
    title: ('更新者'),
    dataIndex: ['updater','name'],
    width: 140,
    ellipsis: true
  },
  {
    title: ('更新时间'),
    dataIndex: 'updateTime',
    width: 182,
    ellipsis: true,
    sorter: (a, b) => frontendTimeSorter(a, b, 'updateTime')
  },
];
export const DATA_MASKING_TABLE_LOG_COLUMNS: PageProColumns<any>[] = [
  {
    title: ('服务'),
    dataIndex: ['service', 'name'],
    ellipsis: true,
    width: 80
  },
  {
    title: ('调用地址'),
    dataIndex: 'url',
    ellipsis: true,
    width: 200
  },
  {
    title: ('消费者 IP'),
    dataIndex: 'remote_ip',
    ellipsis: true,
    width: 100
  },
  {
    title: ('消费者'),
    dataIndex: ['consumer', 'name'],
    ellipsis: true,
    width: 80
  },
  {
    title: ('鉴权名称'),
    dataIndex: ['authorization', 'name'],
    ellipsis: true,
    width: 100
  },
  {
    title: ('时间'),
    dataIndex: 'record_time',
    width: 110,
    ellipsis: true
  },
]
