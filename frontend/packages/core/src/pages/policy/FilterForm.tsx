import React, {  forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Form, Input, Select, Checkbox, Table, Spin, TableColumnsType, message } from 'antd';
import { useFetch } from '@common/hooks/http';
import { LoadingOutlined } from '@ant-design/icons';
import { validateApiPath, validateIPorCIDR } from '@common/utils/validate';
import { $t } from '@common/locales';
import { FilterFormItemProps, RemoteTitleType, FilterFormHandle, FilterFormProps } from '@common/const/policy/type';
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const';
import { v4 as uuidv4 } from 'uuid'

const RemoteFormItem: React.FC<FilterFormItemProps> = (props) =>{
  const {value, onChange, disabled,option, onShowValueChange,serviceId, teamId} = props
  const [remoteList, setRemoteList] = useState<unknown[]>([])
  const [remoteTableColumns, setRemoteTableColumns] = useState<TableColumnsType>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [rowKey, setRowKey] = useState<string>('')
  const title = useMemo(()=>option?.title,[option])
  const [remoteCounts, setRemoteCounts] = useState<number>(0)
  const [originRemoteList, setOriginRemoteList] = useState<unknown[]>([])
  const {fetchData} = useFetch()


  const getRemoteDetail = (searchWord?:string)=>{
    setLoading(true)
    fetchData<BasicResponse<{
      key:string, 
      list:Record<string,unknown>[],
      titles:Array<RemoteTitleType>,
      total:number
      value:string
    }>>(`strategy/${serviceId === undefined ? '' : 'service/'}filter-remote/${option?.name}`,{method:'GET', eoParams:{keyword:searchWord,...(serviceId ? {team:teamId, service:serviceId} : {})}}).then(response=>{
      const {code,data, msg} = response
      if(code === STATUS_CODE.SUCCESS){
        setRemoteList(data.list as unknown[])
        setRowKey(data.key as string)
        setRemoteTableColumns(data.titles.map((x:RemoteTitleType)=>({
          title: x.title,dataIndex:x.field,key:x.field,ellipsis:true
        })))
        setRemoteCounts(data.total)
    if(!searchWord){
      setOriginRemoteList(data.list)
      if(value?.length === 1 && value[0] === 'ALL'){
          const totalDataArr = data.list?.map((x:Record<string,unknown>)=>x[data.key as string])
          onChange?.(totalDataArr)
          onShowValueChange?.(totalDataArr.join(','))
      }
    }
      }else{
          message.error(msg || $t(RESPONSE_TIPS.error))
      }
    }).finally(()=>{
      setLoading(false)
    })
  }

  useEffect(()=>{getRemoteDetail()},[option])
  return (
    <div className="w-full transfer-section rounded-DEFAULT" style={{ border: '1px solid var(--border-color)', borderBottom: 'none' }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>} spinning={loading}>
      <p className="flex items-center mt-[12px] text-[16px] font-bold px-btnbase">
        {$t('已选择(0)项(1)数据', [value?.length || 0, title])}
      </p>
      <div className="flex items-center justify-between py-btnybase px-btnbase">
        <div></div>
        <Input.Search
          className="w-[224px] h-[32px]"
          placeholder={$t(PLACEHOLDER.input)}
          onSearch={(value)=>getRemoteDetail(value)}
          disabled={disabled}
        />
      </div>
      <Table
        columns={remoteTableColumns}
        dataSource={remoteList}
        pagination={false}
        scroll={{ y: 316 }}
        rowClassName={() => (disabled ? '' : 'clickable-row')}
        rowKey={rowKey}
        size='small'
        rowSelection={{
          type: 'checkbox', 
          onChange: (selectedRowKeys: React.Key[]) => {
            onChange?.(selectedRowKeys as string[]);
            onShowValueChange?.(selectedRowKeys.length === remoteCounts? $t('所有(0)',[title]) : originRemoteList.filter(x=>selectedRowKeys?.indexOf(x[option.key]))?.map(x=>x.title).join(' , ')) 
          },
          selectedRowKeys: value,
          // getCheckboxProps: (record: unknown) => ({
          //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
          //   name: record.name,
          // })
          }}
          onRow={(record)=>({
            onClick:()=>{
              if(value === undefined){
                onChange?.([record[rowKey]])
                onShowValueChange?.(remoteCounts === 1 ? $t('所有(0)',[option?.title]) : record.name)
              }else if(value?.indexOf(record[rowKey])!== -1){
                const newSelectedKeys = value?.filter(x=>x!==record[rowKey])
                onChange?.(newSelectedKeys!)
                onShowValueChange?.(newSelectedKeys.length === remoteCounts? $t('所有(0)',[option?.title]) : originRemoteList.filter(x=>newSelectedKeys.indexOf(x[rowKey]) !== -1)?.map(x=>x.name)?.join(' , ')) 
              }else{
                const newSelectedKeys = [...value,record[rowKey]]
                onChange?.(newSelectedKeys)
                onShowValueChange?.(newSelectedKeys.length === remoteCounts? $t('所有(0)',[option?.title]) : originRemoteList.filter(x=>newSelectedKeys.indexOf(x[rowKey]) !== -1)?.map(x=>x.name)?.join(' , ')) 
          }
            }
          })}
      />
      </Spin>
    </div>)
}

const StaticFormItem: React.FC<FilterFormItemProps> = (props) => {
  const {value, onChange, disabled,option,onShowValueChange} = props
  const showAll = useMemo(()=>option.options.indexOf('ALL') !== -1,[option])
  const allChecked = useMemo(()=>value?.filter(x=>x!== 'ALL').length === option.options.filter(x=>x!== 'ALL').length,[value,option])
  
  useEffect(()=>{
      if(value?.length === 1 && value[0] === 'ALL'){
        onChange?.(option.options.filter(x=>x!== 'ALL'))
        onShowValueChange?.($t('所有(0)',[option?.title]))
      }
  },[])

  return (
    <div className="w-auto">
      {showAll && (
        <Checkbox
          className='mr-[8px]'
          checked={allChecked}
          onChange={(e) =>{
            onChange?.(e.target.checked ? option.options : [])
            onShowValueChange?.(e.target.checked ? $t('所有(0)',[option?.title]) : '-')
          }}
          disabled={disabled}
          indeterminate={!allChecked && value?.length > 0}
        >
          ALL
        </Checkbox>
      )}
      <Checkbox.Group
        value={value}
        options={option?.options.filter(x=>x!== 'ALL')}
        onChange={(checkedValues) => {
          onChange?.(checkedValues)
          onShowValueChange?.(checkedValues.join(','))
        }}
        disabled={disabled}
      />
    </div>)
}

const FilterForm = forwardRef<FilterFormHandle,FilterFormProps>(({
  filterForm,
  filterOptions,
  selectedOptionNameSet,
  disabled,
  setFormCanSubmit,
  serviceId,teamId},ref)=> {
  const [form] = Form.useForm();
  const [filterType, setFilterType] = useState<'remote'|'static'|'pattern'>();
  const [curOption, setCurOption] = useState<unknown>()
  const [label,setLabel] = useState<string>('')

  useImperativeHandle(ref, ()=>({
    clear:()=>{
      form.resetFields()
    },
    save:()=>form.validateFields().then((res)=>{
      const selectedOption = filterOptions.filter(x=>x.name === res.name)[0]
      return Promise.resolve({
        ...res,
        label:filterType === 'pattern' ? res.values : label,
        title:selectedOption.label,
        _eoKey:uuidv4()
      })
    }).catch((errorInfo)=>Promise.reject(errorInfo))
  })
  )

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if(!allValues){
      setFormCanSubmit(false)
      return
    }
    if(allValues.values instanceof Array){
      setFormCanSubmit(allValues.values.length > 0)
      return
    }
    setFormCanSubmit(true)
  };


  const handleTypeChange = (value:string)=>{
    form.setFieldValue('values',filterForm?.name === value ? filterForm.values : undefined)
    const selectedOption = filterOptions?.filter(item=>item.name === value)[0]
    setFilterType(selectedOption?.type)
    setCurOption(selectedOption)
    setFormCanSubmit(filterForm?.name === value )
  }
  
  const handleIPChange = (e) => {
    const inputValue = e.target.value;
    const formattedValue = inputValue.replace(/,/g, '\n');
    form.setFieldsValue({ value: formattedValue });
  };

  useEffect(()=>{
    if(filterForm?.name){
      form.setFieldsValue({
        ...filterForm, 
        values: filterForm?.type === 'pattern' ? 
          (filterForm.name === 'ip' ? (filterForm.values as string[])?.join('\n') : (filterForm.values as string[])?.[0] ) :filterForm.values})
      const selectedOption = filterOptions.filter(x=>x.name === filterForm?.name)[0]
      setFilterType(selectedOption?.type )
      setCurOption(selectedOption)
      setFormCanSubmit(filterForm?.values && filterForm?.values?.length >0)
  }else{
      const firstOption = filterOptions.filter(x=>!selectedOptionNameSet.has(x.name))[0]
      form.setFieldValue('name',firstOption?.name)
      setFilterType(firstOption?.type)
      setCurOption(firstOption)
  }
  },[filterForm])

  const filterOptionsList = useMemo(() => {
    return filterOptions.filter(x=>{
      return !!(filterForm?.name && x.name === filterForm?.name )|| !selectedOptionNameSet.has(x.name)}).map((item) => ({label:item.title, value:item.name}));
  }, [filterOptions,filterForm,selectedOptionNameSet]);

  return (
    <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
      <Form.Item name="name" label={$t('属性名称')} rules={[{ required: true }]}>
        <Select disabled={disabled} onChange={handleTypeChange} options={filterOptionsList} />
      </Form.Item>
        <Form.Item name="values" label={$t('属性值')} rules={
          (filterType === 'pattern' ? ( [{validator:form.getFieldValue('name')  === 'ip'  ? validateIPorCIDR : validateApiPath}]):[])
        }>
        {filterType === 'remote' && <RemoteFormItem serviceId={serviceId} teamId={teamId} option={curOption}  disabled={disabled} onShowValueChange={setLabel}/>}

          {filterType === 'pattern' && form.getFieldValue('name') !== 'ip' && (
            <Input
              className="w-INPUT_NORMAL"
              placeholder={$t(PLACEHOLDER.input)}
            />
          )}

          {filterType === 'pattern' && form.getFieldValue('name')  === 'ip' && (
            <Input.TextArea
              className="w-INPUT_NORMAL"
              placeholder={$t(PLACEHOLDER.ipAndCidr)}
              onChange={handleIPChange}
            />
          )}

          {filterType === 'static' && <StaticFormItem option={curOption} disabled={disabled} onShowValueChange={setLabel}/>}
        </Form.Item>
    </Form>
  );
})

export default FilterForm;