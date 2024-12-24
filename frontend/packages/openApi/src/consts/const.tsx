import { PageProColumns } from '@common/components/aoplatform/PageList'
import { OpenApiTableListItem } from './type'
import { $t } from '@common/locales/index.ts'

export const OPENAPI_LIST_COLUMNS: PageProColumns<OpenApiTableListItem>[] = [
  {
    title: $t('消费者名称'),
    dataIndex: 'name',
    ellipsis: true,
    width: 160,
    fixed: 'left'
  },
  {
    title: $t('消费者 ID'),
    dataIndex: 'id',
    ellipsis: true,
    width: 140
  },
  {
    title: $t('鉴权 Token'),
    dataIndex: 'token',
    ellipsis: {
      showTitle: true
    }
  },
  {
    title: $t('关联标签'),
    dataIndex: 'tag'
  },
  {
    title: $t('启用'),
    dataIndex: 'status'
  },
  {
    title: $t('更新者'),
    dataIndex: ['operator', 'name'],
    filters: true,
    onFilter: true,
    valueType: 'select',
    filterSearch: true
  },
  {
    title: $t('更新时间'),
    width: 182,
    dataIndex: 'updateTime',
    sorter: (a, b) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime()
  }
]
