import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Select, Modal } from 'antd';
import { useGlobalContext } from '@common/contexts/GlobalStateContext';
import { $t } from '@common/locales';
import { PLACEHOLDER } from '@common/const/const';
import { v4 as uuidv4 } from 'uuid';
import { DataMaskRuleFormProps } from '@common/const/policy/type';
import { MatchRules, DataFormatOptions, DataMaskReplaceStrOptions, DataMaskBaseOptionOptions, DataMaskOrderOptions } from '@common/const/policy/consts';
const DataMaskRuleForm: React.FC<DataMaskRuleFormProps> = ({ editData, ruleList, onSave, onClose,modalVisible }) => {
  const [form] = Form.useForm();
  const [matchType, setMatchType] = useState<string>('');
  const [matchValue, setMatchValue] = useState<string>('');
  const [maskType, setMaskType] = useState<string>('');
  const [replaceType, setReplaceType] = useState<string>('');
  const {state} = useGlobalContext()
  useEffect(() => {
    if (editData) {
      form.setFieldsValue(editData);
    }
  }, [editData, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      const submitData = prepareSubmitData(values);
      const newRuleList =ruleList ? [...ruleList] : [];
      if (editData) {
        const index = newRuleList.findIndex((rule) => rule.eoKey === editData.eoKey);
        if (index !== -1) {
          newRuleList.splice(index, 1);
        }
      }
      newRuleList.unshift({ ...submitData, eoKey: editData?.eoKey || uuidv4() });
      onSave?.(newRuleList);
      onClose?.();
      clearData()
    });
  };

  const clearData = ()=>{
      form.resetFields()
      setMatchType('');
      setMaskType('');
      setMatchValue('');
      setReplaceType('');
  }

  useEffect(() => {
    if (editData) {
      form.setFieldsValue(editData);
      editData?.match?.type && setMatchType(editData.match.type);
      editData?.mask?.type && setMaskType(editData.mask.type);
      editData?.match?.value && setMatchValue(editData.match.value);
    editData?.mask?.replace?.type && setReplaceType(editData.mask.replace.type);
    }
  }, [editData, form]);

  const handleMatchTypeChange = (value: string) => {
    setMatchType(value);
    form.resetFields(['match.value','mask.begin', 'mask.length', 'mask.replace.type', 'mask.replace.value']);
  };

  const handleMatchValueChange = (value: string) => {
    setMatchValue(value);
    form.resetFields(['mask.begin', 'mask.length', 'mask.replace.type', 'mask.replace.value']);
  };

  const handleMaskTypeChange = (value: string) => {
    setMaskType(value);
    form.resetFields(['mask.begin', 'mask.length', 'mask.replace.type', 'mask.replace.value']);
  };

  const handleReplaceTypeChange = (value: string) => {
    setReplaceType(value);
    form.resetFields(['mask.replace.value']);
  };

  const prepareSubmitData = (formData: any) => {
    const submitData: any = {
      match: {
        type: formData.match.type,
        value: formData.match.value
      },
      mask: {
        type: formData.mask.type
      }
    };

    switch (formData.mask.type) {
      case 'replacement':
        submitData.mask = {
          ...submitData.mask,
          replace: formData.mask.replace
        };
        break;
      case 'shuffling':
        break;
      default:
        submitData.mask.begin = Number(formData.mask.begin) || 0;
        submitData.mask.length = Number(formData.mask.length) || 0;
        break;
    }
    return submitData;
  };

  const matchRuleOptions = useMemo(()=>MatchRules.map(rule => ({ label: $t(rule.label), value: rule.value })),[state.language])
  const dataFormatOptions = useMemo(()=>DataFormatOptions.map(rule => ({ label: $t(rule.label), value: rule.value })),[state.language])
  const dataMaskBaseOptions = useMemo(()=>DataMaskBaseOptionOptions.map(rule => ({ label: $t(rule.label), value: rule.value })),[state.language])
  const dataMaskOrderOptions = useMemo(()=>DataMaskOrderOptions.map(rule => ({ label: $t(rule.label), value: rule.value })),[state.language])
  const dataMaskReplaceStrOptions = useMemo(()=>DataMaskReplaceStrOptions.map(rule => ({ label: $t(rule.label), value: rule.value })),[state.language])

  return (
    <Modal open={modalVisible}  onCancel={onClose} onOk={handleSave} title={$t("配置脱敏规则")}>
      <Form form={form} layout="vertical" className="p-4">
      <Form.Item name={['match', 'type']} label={$t("匹配类型")} rules={[{ required: true }]}>
        <Select placeholder={$t(PLACEHOLDER.select)} onChange={handleMatchTypeChange} options={matchRuleOptions}/>
      </Form.Item>

     { matchType && <Form.Item name={['match', 'value']} label={$t("匹配值")} rules={[{ required: true }]}>{
        matchType === 'inner' ?
           <Select placeholder={$t(PLACEHOLDER.select)} onChange={handleMatchValueChange} options={dataFormatOptions}/>
           :<Input placeholder={$t(PLACEHOLDER.input)} />}
      </Form.Item>
    }
    
      <Form.Item name={['mask', 'type']} label={$t("脱敏类型")} rules={[{ required: true }]}>
        <Select placeholder={$t(PLACEHOLDER.select)} onChange={handleMaskTypeChange} options={ matchType &&  ['name', 'phone', 'id-card', 'bank-card'].indexOf(matchValue) !== -1 ? dataMaskOrderOptions:dataMaskBaseOptions} />
      </Form.Item>

      {['partial-display', 'partial-masking', 'truncation'].includes(maskType) && (
        <>
          <Form.Item name={['mask', 'begin']} label={$t("起始位置")} rules={[{ required: true }]}>
            <Input type="number" placeholder={$t(PLACEHOLDER.input)} />
          </Form.Item>
          <Form.Item name={['mask', 'length']} label={$t("长度")} rules={[{ required: true }]}>
            <Input type="number" placeholder={$t(PLACEHOLDER.input)} />
          </Form.Item>
        </>
      )}

      {maskType === 'replacement' && (
        <>
          <Form.Item name={['mask', 'replace', 'type']} label={$t("替换类型")} rules={[{ required: true }]}>
            <Select placeholder={$t(PLACEHOLDER.select)} onChange={handleReplaceTypeChange} options={dataMaskReplaceStrOptions}/>
          </Form.Item>
          {replaceType === 'custom' && (
            <Form.Item name={['mask', 'replace', 'value']} label={$t("替换值")} rules={[{ required: true }]}>
              <Input placeholder={$t(PLACEHOLDER.input)} />
            </Form.Item>
          )}
        </>
      )}

    </Form>
    </Modal>
  );
};

export default DataMaskRuleForm;