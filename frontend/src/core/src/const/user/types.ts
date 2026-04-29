import { DepartmentListItem } from "../member/type";


export type UserGroupItem = {
    id:string
    name:string
    usage:number
}

export type FieldType = {
    id?:string
    name:string
};

export type UserGroupModalProps = {
    type:'add'|'edit'
    entity?:FieldType
    departmentList?:DepartmentListItem[]
}

export type UserGroupModalHandle = {
    save:()=>Promise<boolean|string>
}
