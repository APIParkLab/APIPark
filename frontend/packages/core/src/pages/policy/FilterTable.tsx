import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button, Table, Modal, App, Divider } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { $t } from '@common/locales';
import { useFetch } from '@common/hooks/http';
import { useGlobalContext } from '@common/contexts/GlobalStateContext';
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission';
import { FilterFormField, FilterTableProps, FilterOptionType, FilterFormHandle } from '@common/const/policy/type.ts';
import FilterForm from './FilterForm';
import { BasicResponse, COLUMNS_TITLE, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const';
import { useParams } from 'react-router-dom';
import { RouterParams } from '@common/const/type';


const FilterTable: React.FC<FilterTableProps> = ({
  disabled = false,
  drawerTitle = '筛选条件',
  value,
  onChange
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filterForm, setFilterForm] = useState<FilterFormField>();
  const [filterOptions, setFilterOptions] = useState<FilterOptionType[]>([]);
  const {message} = App.useApp()
  const {state} = useGlobalContext()
  const {fetchData} = useFetch()
  const formRef = useRef<FilterFormHandle>(null);
  const [formCanSubmit,setFormCanSubmit] = useState(false)
  const [selectedOptionNameSet, setSelectedOptionNameSet] = useState<Set<string>>(new Set());
  const {serviceId,teamId} = useParams<RouterParams>()
    const openDrawer = (type: string, data?: FilterFormField) => {
    switch (type) {
      case 'addFilter':
        setFilterForm(undefined)
        break;
      case 'editFilter':
        setFilterForm(data)
    }
    setIsModalVisible(true);
  };

  const closeDrawer = () => {
    setIsModalVisible(false);
    cleanFilterForm();
  };

  const cleanFilterForm = () => {
    setFilterForm(undefined);
  };

  const handleSaveFilter = () => {
    const formPromise = formRef.current?.save();
    formPromise?.then?.((res)=>{
        const newFilterForm = {
          name:res.name,
          values:res.values instanceof Array ? res.values : [res.values],
          label:res.label,
          title:res.title
        }
        onChange?.([newFilterForm, ...(value?.filter(x=>!filterForm?.name|| x.name!==filterForm.name) || [])])
        closeDrawer()
    })
  };

  const handleDeleteFilter =  useCallback((item: FilterFormField) => {
    const newFilterShowList = value?.filter((filter) => filter._eoKey !== item._eoKey) || [];
    onChange?.(newFilterShowList);
  }, [value, onChange]);

  const getFilterOptions = ()=>{
    fetchData<BasicResponse<{options:FilterOptionType[]}>>(`strategy/${serviceId === undefined ? 'global' : 'service'}/filter-options`,{method:'GET', eoParams:{...(serviceId ? {team:teamId, service:serviceId} : {})}}).then(response=>{
      const {code,data,msg} = response
      if(code === STATUS_CODE.SUCCESS){
        setFilterOptions(data.options)
      }else{
          message.error(msg || $t(RESPONSE_TIPS.error))
      }
  }).catch((errorInfo)=> console.error(errorInfo))
  }

  const columns: ColumnsType<FilterFormField> =useMemo(()=>[
    {
      title: $t('属性名称'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: $t('属性值'),
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: COLUMNS_TITLE.operate,
      key: 'action',
      width:100,
      render: (_, record) => (
        <div className='flex items-center gap-[8px]'>
          <TableBtnWithPermission  key="edit"  btnType="edit" onClick={()=>{openDrawer('editFilter', record)}} btnTitle={$t("编辑")}/>
          <Divider type="vertical" className="mx-0"  key="div2"/>
          <TableBtnWithPermission   key="delete"  btnType="delete"  onClick={()=>{handleDeleteFilter(record)}} btnTitle={$t("删除")}/></div>)
    }
  ],[state.language,handleDeleteFilter]) 

  useEffect(()=>{
    getFilterOptions()
  },[state.language])

  useEffect(()=>{
    setSelectedOptionNameSet(new Set(value?.map(x=>x.name) || []))
  },[value])
  return (
    <div>
      {
        !disabled &&<Button onClick={() => openDrawer('addFilter')}>
          {$t('添加配置')}
        </Button>
        }
      {value && value.length >0 && <Table 
        className={`mt-btnybase border-solid border-[1px] border-BORDER border-b-0 rounded ${disabled ? '' : 'mt-btnbase'}`}
        pagination={false}
        size='small'
        columns={columns} dataSource={value} rowKey='_eoKey' /> }
      <div role="alert" className="ant-form-item-explain-error">
      </div>
      <Modal
        title={filterForm?.name ? $t('编辑(0)',[$t(drawerTitle)]) :$t('配置(0)',[$t(drawerTitle)])}
        visible={isModalVisible}
        onCancel={closeDrawer}
        width={900}
        okButtonProps={{ disabled:!formCanSubmit }}
        onOk={()=>handleSaveFilter()}
        destroyOnClose={true}
      >
        <FilterForm
          ref={formRef}
          filterForm={filterForm}
          filterOptions={filterOptions}
          selectedOptionNameSet={selectedOptionNameSet}
          disabled={disabled}
          setFormCanSubmit={setFormCanSubmit}
          serviceId={serviceId}
          teamId={teamId}
        />
      </Modal>
    </div>
  );
};

export default FilterTable;