
import { EntityItem } from "@common/const/type";

export type PartitionConfigFieldType = {
    name?: string;
    id?: string;
    description?: string;
    prefix?:string
    url?:string 
    managerAddress?:string
    canDelete?:boolean
};

export type PartitionCertTableListItem = {
    id:string;
    name: string;
    domains:string[];
    notAfter:string;
    notBefore:string;
    updater:EntityItem;
    updateTime:string;
};

export type PartitionCertConfigFieldType = {
    id?:string
    key:string
    pem:string
};

export type PartitionCertConfigProps = {
   type:'add'|'edit'
   entity?:PartitionCertConfigFieldType
}

export type PartitionCertConfigHandle = {
   save:()=>Promise<boolean|string>
}

export type PartitionClusterFieldType = {
    name?: string;
    id?: string;
    description?: string;
    address?:string;
    protocol?:'http'|'https'
};

export type ClusterConfigProps = {
    mode:'config' | 'retry' | 'result' | 'edit',
    clusterId?:string
    initFormValue?:{[k:string]:string|number}
}

export type ClusterConfigHandle = {
    save:()=>Promise<boolean|string>
    check:()=>Promise<boolean>
}

export type PartitionClusterTableListItem = {
    id:string;
    name: string;
    status:0|1;
    description:string;
};

export type PartitionClusterNodeTableListItem = {
    id:string;
    name: string;
    managerAddress:string[];
    serviceAddress:string[];
    peerAddress:string;
    status:0|1;
};

export type PartitionClusterNodeModalTableListItem = {
    id: string,
    name: string,
    managerAddress: [],
    serviceAddress: [],
    peerAddress: string,
    status: string
}

export type NodeModalFieldType = {
    address:string
}


export type NodeModalHandle = {
    save:()=>Promise<boolean|string>
}

export type PartitionTableListItem = {
    id:string;
    name: string;
    clusterNum:number;
    updater:EntityItem;
    updateTime:string;
};

export type SimplePartition = EntityItem & { clusters: (EntityItem & {description:string})[] }

export type PartitionDashboardConfigFieldType = {
    driver:string
    config:{
        org:string
        token:string
        addr:string
    }
}