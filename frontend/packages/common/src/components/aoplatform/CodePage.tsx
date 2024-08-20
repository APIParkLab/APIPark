import { FC } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { $t } from '@common/locales';

interface DataType {
  httpStatusCode: string;
  systemStatusCode: string;
  description: string;

}

const columns: ColumnsType<DataType> = [
  {
    title:$t('HTTP 状态码'),
    dataIndex: 'httpStatusCode',
    key: 'httpStatusCode',
  },
  {
    title:$t('系统状态码'),
    dataIndex: 'systemStatusCode',
    key: 'systemStatusCode',
  },
  {
    title: $t('描述'),
    dataIndex: 'description',
    key: 'description',
    ellipsis:true
  },
  
];

const data: DataType[] = [
  // {
  //   httpStatusCode: '416',
  //   systemStatusCode: '10001',
  //   description: '尚未购买该 API 或 API 调用次数已用完',
  // },
  // {
  //   httpStatusCode: '401',
  //   systemStatusCode: '10002',
  //   description: 'Header 参数中找不到 X-APISpace-Token 或 X-APISpace-Token 非法',
  // },
  {
    httpStatusCode: '413',
    systemStatusCode: '10003',
    description:  '请求频率过高',
  },
  {
    httpStatusCode: '403',
    systemStatusCode: '10004',
    description: '请求来源非法，不在白名单中',
  },
  // {
  //   httpStatusCode: '416',
  //   systemStatusCode: '10005',
  //   description: '该接口超 90 天未完成企业认证，请尽快于平台内完成认证',
  // },
  {
    httpStatusCode: '504',
    systemStatusCode: '10006',
    description: '网关超时',
  },
  // {
  //   httpStatusCode: '504',
  //   systemStatusCode: '10006',
  //   description: '网关超时，请联系 APISpace 客服',
  // },
  {
    httpStatusCode: '404',
    systemStatusCode: '10007',
    description: '接口不存在',
  },
  // {
  //   httpStatusCode: '416',
  //   systemStatusCode: '10008',
  //   description: '内部错误，请联系 APISpace 技术支持',
  // },
  // {
  //   httpStatusCode: '401',
  //   systemStatusCode: '10009',
  //   description: 'Header 参数中找不到 Authorization-Type 或 Authorization-Type 非法',
  // },
  {
    httpStatusCode: '400',
    systemStatusCode: '10010',
    description: '无法识别请求内容，请检查请求体是否正确',
  },
  {
    httpStatusCode: '400',
    systemStatusCode: '10011',
    description: '请求头部缺少 Content-Type 字段',
  },
  {
    httpStatusCode: '400',
    systemStatusCode: '10011',
    description: '请求头部 Content-Type 字段错误',
  },
  {
    httpStatusCode: '400',
    systemStatusCode: '10014',
    description: '批量参数超出单次批量数量的最大限制',
  },
  {
    httpStatusCode: '400',
    systemStatusCode: '10016',
    description: '参数缺少内容',
  },
  {
    httpStatusCode: '500',
    systemStatusCode: '10017',
    description: '参数类型错误',
  },
];

const CodePage: FC = () => 
  <Table 
    size="small"
    columns={columns} 
    className='table-border border-b-0 rounded'
    dataSource={data?.map((item, index) => ({...item, key: index})) || []} 
    pagination={false}
  />;

export default CodePage;