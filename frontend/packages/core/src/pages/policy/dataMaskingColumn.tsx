
import { PageProColumns } from "@common/components/aoplatform/PageList";
import { frontendTimeSorter } from "@common/utils/dataTransfer";
import { $t } from "@common/locales";

export const DATA_MASSKING_TABLE_COLUMNS: PageProColumns<any>[] = [
  {
    title: ('策略名称'),
    dataIndex: 'name',
    ellipsis: true,
    filters: true,
    onFilter: true,
    valueType: 'select',
    filterSearch: true,
    width: 160
  },
  {
    title: ('优先级'),
    dataIndex: 'priority',
    width: 140,
    ellipsis: true,
    sorter: (a: any, b: any) => {
      return (a.priority as number) - (b.priority as number)
    }
  },
  {
    title: ('发布状态'),
    dataIndex: 'status',
    filters: true,
    onFilter: true,
    width: 140,
    valueEnum: new Map([
      [true, <span className="text-status_success">{$t('已发布')}</span>],
      [false, <span className="text-status_fail">{$t('未发布')}</span>]
    ])
  },
  {
    title: ('启用'),
    dataIndex: 'enabled',
    filters: true,
    onFilter: true,
    valueEnum: {
      true: { text: <span className="text-status_success">{$t('启用')}</span> },
      false: { text: <span className="text-status_fail">{$t('禁用')}</span> }
    }
  },
  {
    title: ('筛选条件'),
    dataIndex: 'condition',
    ellipsis: true
  },
  {
    title: ('处理数'),
    dataIndex: 'treatmentNumber',
    ellipsis: true
  },
  {
    title: ('更新者'),
    dataIndex: 'updater',
    width: 140,
    ellipsis: true
  },
  {
    title: ('更新时间'),
    dataIndex: 'createTime',
    width: 182,
    ellipsis: true,
    sorter: (a, b) => frontendTimeSorter(a, b, 'createTime')
  },
];
