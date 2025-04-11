import { ApiOutlined, LoadingOutlined } from '@ant-design/icons'
import { ActionType } from '@ant-design/pro-components'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const.tsx'
import { EntityItem } from '@common/const/type.ts'
import { useBreadcrumb } from '@common/contexts/BreadcrumbContext.tsx'
import { useFetch } from '@common/hooks/http.ts'
import { $t } from '@common/locales/index.ts'
import { RouterParams } from '@core/components/aoplatform/RenderRoutes.tsx'
import { App, Avatar, Card, Empty, Spin, Tag, Tooltip } from 'antd'
import { FC, forwardRef, useEffect, useReducer, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { VirtuosoGrid } from 'react-virtuoso'
import { CategorizesType, ServiceHubTableListItem } from '../../const/serviceHub/type.ts'
import ServiceHubGroup from './ServiceHubGroup.tsx'
import { SERVICE_KIND_OPTIONS } from '@core/const/system/const.tsx'
import { Icon } from '@iconify/react/dist/iconify.js'

export enum SERVICE_HUB_LIST_ACTIONS {
  GET_CATEGORIES = 'GET_CATEGORIES',
  GET_TAGS = 'GET_TAGS',
  GET_SERVICES = 'GET_SERVICES',
  SET_SERVICES = 'SET_SERVICES',
  SET_SELECTED_CATE = 'SET_SELECTED_CATE',
  SET_SELECTED_TAG = 'SET_SELECTED_TAG',
  SET_KEYWORD = 'SET_KEYWORD',
  LIST_LOADING = 'LIST_LOADING'
}

export type ServiceHubListActionType =
  | { type: SERVICE_HUB_LIST_ACTIONS.GET_CATEGORIES; payload: CategorizesType[] }
  | { type: SERVICE_HUB_LIST_ACTIONS.GET_TAGS; payload: EntityItem[] }
  | { type: SERVICE_HUB_LIST_ACTIONS.GET_SERVICES; payload: ServiceHubTableListItem[] }
  | { type: SERVICE_HUB_LIST_ACTIONS.SET_SERVICES; payload: ServiceHubTableListItem[] }
  | { type: SERVICE_HUB_LIST_ACTIONS.SET_SELECTED_CATE; payload: string[] }
  | { type: SERVICE_HUB_LIST_ACTIONS.SET_SELECTED_TAG; payload: string[] }
  | { type: SERVICE_HUB_LIST_ACTIONS.SET_KEYWORD; payload: string }
  | { type: SERVICE_HUB_LIST_ACTIONS.LIST_LOADING; payload: boolean }

export const initialServiceHubListState = {
  categoriesList: [] as CategorizesType[],
  tagsList: [] as EntityItem[],
  servicesList: [] as ServiceHubTableListItem[],
  showServicesList: [] as ServiceHubTableListItem[],
  selectedCate: [] as string[],
  selectedTag: [] as string[],
  keyword: '',
  getCateAndTagData: false,
  listLoading: false
}

function reducer(state: typeof initialServiceHubListState, action: ServiceHubListActionType) {
  switch (action.type) {
    case SERVICE_HUB_LIST_ACTIONS.GET_CATEGORIES:
      return { ...state, categoriesList: action.payload, getCateAndTagData: true }
    case SERVICE_HUB_LIST_ACTIONS.GET_TAGS:
      return { ...state, tagsList: action.payload, getCateAndTagData: true }
    case SERVICE_HUB_LIST_ACTIONS.GET_SERVICES:
      return { ...state, servicesList: action.payload }
    case SERVICE_HUB_LIST_ACTIONS.SET_SERVICES:
      return { ...state, showServicesList: action.payload }
    case SERVICE_HUB_LIST_ACTIONS.SET_SELECTED_CATE:
      return { ...state, selectedCate: action.payload }
    case SERVICE_HUB_LIST_ACTIONS.SET_SELECTED_TAG:
      return { ...state, selectedTag: action.payload }
    case SERVICE_HUB_LIST_ACTIONS.SET_KEYWORD:
      return { ...state, keyword: action.payload }
    case SERVICE_HUB_LIST_ACTIONS.LIST_LOADING:
      return { ...state, listLoading: action.payload }
    default:
      return state
  }
}

export const filterServiceList = (dataSet: typeof initialServiceHubListState) => {
  if (!dataSet.getCateAndTagData) {
    return dataSet.servicesList
  } else {
    return dataSet.servicesList.filter((x) => {
      if (
        !dataSet.selectedCate ||
        dataSet.selectedCate.length === 0 ||
        dataSet.selectedCate.indexOf(x.catalogue.id) === -1
      )
        return false
      if (!dataSet.selectedTag || dataSet.selectedTag.length === 0) return false
      if ((!x.tags || !x.tags.length) && dataSet.selectedTag.indexOf('empty') === -1) return false
      if (x.tags && x.tags.length && !x.tags.some((tag) => dataSet.selectedTag.includes(tag.id))) return false
      if (dataSet.keyword && !x.name.toLocaleLowerCase().includes(dataSet.keyword.toLocaleLowerCase())) return false
      return true
    })
  }
}

const ServiceHubList: FC = () => {
  const { setBreadcrumb } = useBreadcrumb()
  const { message } = App.useApp()
  const { fetchData } = useFetch()
  const { categoryId, tagId } = useParams<RouterParams>()
  const pageListRef = useRef<ActionType>(null)
  // const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');
  const navigate = useNavigate()
  const [filterOption, dispatch] = useReducer(reducer, initialServiceHubListState)

  const getServiceList = () => {
    dispatch({ type: SERVICE_HUB_LIST_ACTIONS.LIST_LOADING, payload: true })
    fetchData<BasicResponse<{ services: ServiceHubTableListItem }>>('catalogue/services', {
      method: 'GET',
      eoTransformKeys: ['api_num', 'subscriber_num', 'enable_mcp', 'service_kind', 'invoke_count']
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          dispatch({ type: SERVICE_HUB_LIST_ACTIONS.GET_SERVICES, payload: data.services })
          dispatch({
            type: SERVICE_HUB_LIST_ACTIONS.SET_SERVICES,
            payload: filterServiceList({ ...filterOption, servicesList: data.services })
          })
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .finally(() => {
        dispatch({ type: SERVICE_HUB_LIST_ACTIONS.LIST_LOADING, payload: false })
      })
  }

  const showDocumentDetail = (entity: ServiceHubTableListItem) => {
    navigate(`../detail/${entity.id}`)
  }

  useEffect(() => {
    pageListRef.current?.reload()
  }, [categoryId, tagId])
  useEffect(() => {
    setBreadcrumb([{ title: $t('服务市场') }])
    getServiceList()
  }, [])

  return (
    <ServiceHubGroup filterOption={filterOption} dispatch={dispatch}>
      <div className="h-full padding-top-40">
        <Spin
          className="h-full"
          wrapperClassName="h-full"
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          spinning={filterOption.listLoading}
        >
          {filterOption.showServicesList && filterOption.showServicesList.length > 0 ? (
            <VirtuosoGrid
              style={{ height: '100%' }}
              data={filterOption.showServicesList}
              totalCount={filterOption.showServicesList.length}
              itemContent={(index) => {
                const item = filterOption.showServicesList[index]
                return (
                  <div className="pt-[20px]">
                    <Card
                      title={CardTitle(item)}
                      className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible cursor-pointer h-[200px] m-0 transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]"
                      classNames={{ header: 'border-b-[0px] p-[20px] ', body: 'pt-0 h-[110px]' }}
                      onClick={() => showDocumentDetail(item)}
                    >
                      <span className="line-clamp-3  text-[12px] text-[#666] " style={{ 'word-break': 'auto-phrase' }}>
                        {item.description || $t('暂无服务描述')}
                      </span>
                      <CardAction service={item} />
                    </Card>
                  </div>
                )
              }}
              components={{
                List: forwardRef(({ style, children, ...props }, ref) => (
                  <div
                    ref={ref}
                    {...props}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      columnGap: '20px',
                      padding: '40px',
                      ...style,
                      paddingBottom: '40px'
                    }}
                  >
                    {children}
                  </div>
                )),
                Item: ({ children, ...props }) => <>{children}</>
              }}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Spin>
      </div>
    </ServiceHubGroup>
  )
}
export default ServiceHubList

const CardTitle = (service: ServiceHubTableListItem) => {
  return (
    <div className="flex">
      <Avatar
        shape="square"
        size={50}
        className=" border-none bg-[linear-gradient(135deg,white,#f0f0f0)] text-[#333] rounded-[12px]"
        src={
          service.logo ? (
            <img
              src={service.logo}
              alt="Logo"
              style={{ maxWidth: '200px', width: '45px', height: '45px', objectFit: 'unset' }}
            />
          ) : undefined
        }
      >
        {' '}
        {service.logo ? '' : service.name.substring(0, 1)}
      </Avatar>
      <div className="pl-[20px] w-[calc(100%-50px)]">
        <p className="text-[14px] h-[20px] leading-[20px] truncate w-full flex items-center gap-[4px]">
          {service.name}
        </p>
        <div className="mt-[10px] h-[20px] flex items-center font-normal">
          <Tag
            color="#7371fc1b"
            className="text-theme font-normal border-0 mr-[12px] max-w-[150px] truncate"
            key={service.id}
            bordered={false}
            title={service.catalogue?.name || '-'}
          >
            {service.catalogue?.name || '-'}
          </Tag>
          <Tag
            color="#fbe5e5"
            className="text-[#000] font-normal border-0 mr-[12px] max-w-[150px] truncate"
            bordered={false}
            title={service.serviceKind || '-'}
          >
            {SERVICE_KIND_OPTIONS.find((x) => x.value === service.serviceKind)?.label || '-'}
          </Tag>
          {service?.enableMcp && (
            <Tag
              color="#ffc107"
              className="text-[#000] font-normal border-0 mr-[12px] max-w-[150px] truncate"
              bordered={false}
              title={'MCP'}
            >
              MCP
            </Tag>
          )}
        </div>
      </div>
    </div>
  )
}

// 格式化调用次数，添加K和M单位
const formatInvokeCount = (count: number | null | undefined): string => {
  if (count === null || count === undefined) return '-'
  if (count >= 1000000) {
    const value = Math.floor(count / 100000) / 10
    return `${value}M`
  }
  if (count >= 1000) {
    const value = Math.floor(count / 100) / 10
    return `${value}K`
  }
  return count.toString()
}

const CardAction = (props: { service: ServiceHubTableListItem }) => {
  const { service } = props
  return (
    <div className="absolute bottom-[20px] h-[20px] flex items-center font-normal">
      <Tooltip title={$t('API 数量')}>
        <span className="mr-[12px] flex items-center">
          <ApiOutlined className="mr-[1px] text-[14px] h-[14px] w-[14px]" />
          <span className="font-normal text-[14px]">{service.apiNum ?? '-'}</span>
        </span>
      </Tooltip>
      <Tooltip title={$t('接入消费者数量')}>
        <span className="mr-[12px] flex items-center">
          <span className="h-[14px] mr-[4px] flex items-center ">
            <iconpark-icon size="14px" name="auto-generate-api"></iconpark-icon>
          </span>
          <span className="font-normal text-[14px]">{service.subscriberNum ?? '-'}</span>
        </span>
      </Tooltip>
      <Tooltip title={$t('30天内调用次数')}>
        <span className="mr-[12px] flex items-center">
          <span className="h-[14px] mr-[4px] flex items-center ">
            <Icon icon="iconoir:graph-up" width="14" height="14" />
          </span>
          <span className="font-normal text-[14px]">{formatInvokeCount(service.invokeCount)}</span>
        </span>
      </Tooltip>
    </div>
  )
}
