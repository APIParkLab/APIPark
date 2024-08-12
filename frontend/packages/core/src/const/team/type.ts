
import { EntityItem } from "@common/const/type";

export type TeamTableListItem = {
    id:string;
    name: string;
    description:string;
    serviceNum:number;
    creator:EntityItem;
    createTime:string;
    canDelete:boolean
};

export type TeamConfigProps = {
    entity?:TeamConfigFieldType
}
export type TeamConfigHandle = {
    save:()=>Promise<boolean|string>
}

export type TeamConfigType = {
    name: string;
    id?: string;
    description: string;
    master:EntityItem;
    canDelete:boolean
};

export type TeamConfigFieldType = {
    name: string;
    id?: string;
    description: string;
    master:string;
};

export type TeamMemberTableListItem = {
    user:EntityItem;
    roles:EntityItem[];
    userGroup:EntityItem;
    attachTime:string;
    isDelete:boolean
};