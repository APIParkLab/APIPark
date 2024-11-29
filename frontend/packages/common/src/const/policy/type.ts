import { DefaultOptionType } from "antd/es/select";
import { StrategyStatusEnum } from "./consts";
import { EntityItem } from "../type";

export type DataMaskRuleTableProps = {
    disabled?: boolean;
    value?: MaskRuleData[];
    onChange?: (value: MaskRuleData[]) => void;
  }

  
export type MaskRuleData = {
    match: {
      type: string;
      value: string;
    };
    mask: {
      type: string;
      begin?: number;
      length?: number;
      replace?: {
        type: string;
        value: string;
      };
    };
    eoKey?: string;
  }
  
  export type DataMaskRuleFormProps = {
    editData?: MaskRuleData;
    ruleList: MaskRuleData[];
    onSave: (ruleList: MaskRuleData[]) => void;
    onClose: () => void;
    modalVisible:boolean
  }
  
  
export type DataMaskingConfigHandle = {
    save: (values: any) => void
}

export type PolicyMatchType = {name:string, values:string[], label?:string, title?:string, type?:string}

export type DataMaskingRulesType = {}

export type DataMaskingConfigFieldType = {
    id:string
    name:string
    priority:number
    description:string
    filters:PolicyMatchType[]
    config:{
        rules:DataMaskingRulesType
    }
}

export type DataMaskStrategyItem = {
    id:string
    name:string
    priority:number
    isStop:boolean
    isDelete:boolean
    publishStatus:keyof typeof StrategyStatusEnum
    filters:string
    conf:string
    updater:EntityItem
    updateTime:string
  }
export type DataMaskLogItem = {
    id:string
    service: {
      id:string
      name:string
    }
    method:string
    url:string
    remote_ip:string
    consumer: {
      id:string
      name:string
    }
    authorization:string
    record_time:string
  }

  
export type FilterFormField= {
    name: string;
    values:string[] |string;
    label:string
    title:string
  }
  
  export type FilterOptionType = {
    name:string
    pattern:string
    title:string
    type:'remote'|'pattern'|'static'
    options:string[]
  }
  
  
  export type FilterTableProps = {
    disabled?: boolean;
    drawerTitle?: string;
    value?:FilterFormField[];
    onChange?:(val:FilterFormField[])=>void
  }
  
export type FilterFormType = {
    name:string
    values:unknown
    type?:string
  }
  
  export type FilterFormProps =  {
    filterForm: FilterFormType;
    filterOptions:DefaultOptionType[];
    selectedOptionNameSet: Set<string>;
    disabled: boolean;
    onFilterFormChange: (form: FilterFormType) => void;
    setFormCanSubmit:(canSubmit:boolean)=>void
    serviceId?:string
    teamId?:string
  }
  
  export type FilterFormHandle = {
    clear:()=>void
    save:()=>Promise<FilterFormField>
  }
  
  export type FilterFormItemProps = {
    value?: string[];
    onChange?: (value: string[]) => void;
    disabled:boolean
    option:unknown
    onShowValueChange?:(value:string)=>void
    serviceId?:string
    teamId?:string
  }
  
  export type RemoteTitleType = {
    title:string
    field:string
  }