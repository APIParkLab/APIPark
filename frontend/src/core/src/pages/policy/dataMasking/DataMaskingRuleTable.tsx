import { useMemo, useState } from 'react';
import { Button, Table, Tooltip } from 'antd';
import DataMaskRuleForm from './DataMaskingRuleForm';
import { $t } from '@common/locales';
import {DataMaskRuleTableProps, MaskRuleData} from "@common/const/policy/type";
import { useGlobalContext } from '@common/contexts/GlobalStateContext';
import { COLUMNS_TITLE } from '@common/const/const';
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission';


const DataMaskRuleTable: React.FC<DataMaskRuleTableProps> = ({
  disabled = false,
  value,
  onChange
}) => {
  const [editData, setEditData] = useState<MaskRuleData | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {state} = useGlobalContext()
  const openDrawer = (type:'add'|'edit',data?: MaskRuleData) => {
    setEditData(data);
    setIsModalVisible(true);
  };

  const closeDrawer = () => {
    setIsModalVisible(false);
    setEditData(undefined);
  };

  const handleSave = (newRuleList: MaskRuleData[]) => {
    onChange?.(newRuleList);
  };

  const columns = useMemo(()=> [
    {
      title: $t('匹配类型'),
      dataIndex: ['match', 'type'],
      key: 'matchType',
      render: (text: string) => {
        switch (text) {
          case 'inner':
            return $t('数据格式');
          case 'keyword':
            return $t('关键字');
          case 'regex':
            return $t('正则表达式');
          case 'json_path':
            return $t('JSON Path');
          default:
            return text;
        }
      },
    },
    {
      title: $t('匹配值'),
      dataIndex: ['match', 'value'],
      key: 'matchValue',
      render: (text: string) => {
        switch (text) {
          case 'name':
            return $t('姓名');
          case 'phone':
            return $t('手机号');
          case 'id-card':
            return $t('身份证号');
          case 'bank-card':
            return $t('银行卡号');
          case 'date':
            return $t('日期');
          case 'amount':
            return $t('金额');
          default:
            return text;
        }
      },
    },
    {
      title: $t('脱敏类型'),
      dataIndex: ['mask', 'type'],
      key: 'maskType',
      render: (text: string) => {
        switch (text) {
          case 'partial-display':
            return $t('局部显示');
          case 'partial-masking':
            return $t('局部遮蔽');
          case 'truncation':
            return $t('截取');
          case 'replacement':
            return $t('替换');
          case 'shuffling':
            return $t('乱序');
          default:
            return text;
        }
      },
    },
    {
      title: $t('脱敏规则'),
      dataIndex: 'mask',
      key: 'maskRule',
      render: (mask: any) => {
        switch (mask.type) {
          case 'replacement':
            return (
              <Tooltip title={`${$t('类型')}：${mask.replace.type === 'random' ? $t('随机字符串') : $t('自定义字符串; 值：')}${mask.replace.value}`}>
                {$t('类型')}：{mask.replace.type === 'random' ? $t('随机字符串') : $t('自定义字符串; 值：')}{mask.replace.value}
              </Tooltip>
            );
          case 'shuffling':
            return '-';
          default:
            return (
              <Tooltip title={$t('起始位置：(0)位；长度：(1)位',[mask.begin,mask.length])}>
                {$t('起始位置：(0)位；长度：(1)位',[mask.begin,mask.length])}
              </Tooltip>
            );
        }
      },
    },
    {
      title: COLUMNS_TITLE.operate,
      key: 'action',
      render: (_: any, record: MaskRuleData) => (
          <TableBtnWithPermission  key="edit"  btnType="edit" onClick={()=>{openDrawer('edit', record)}} btnTitle={$t("编辑")}/>
        ),
    },
  ],[state.language])

  return (
    <div>
    {
      !disabled &&<Button onClick={() => openDrawer('add')}>
        {$t('添加配置')}
      </Button>
      }
      {value && value.length >0 && <Table 
        className={disabled ? '' : 'mt-btnbase'}
        size='small'
        pagination={false}
        columns={columns} dataSource={value} rowKey="eoKey" /> }
        <DataMaskRuleForm
          editData={editData}
          ruleList={value}
          onSave={handleSave}
          onClose={closeDrawer}
          modalVisible = {isModalVisible}
        />
    </div>
  );
};

export default DataMaskRuleTable;