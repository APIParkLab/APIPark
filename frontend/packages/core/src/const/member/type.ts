
import { EntityItem } from "@common/const/type"

export type DepartmentListItem = {
    id:string
    name:string
    number?:string
    children:DepartmentListItem[]
    departmentIds?:string[]
    key?:string
}

export type MemberTableListItem = {
    id:string;
    name: string;
    email:string;
    department:Array<EntityItem>;
    userGroup:Array<EntityItem>;
    enable:boolean
    departmentId:string
    roles:EntityItem[]
};

export type AddToDepartmentProps = {
    selectedUserIds:string[]
}

export type AddToDepartmentHandle = {
    save:()=>Promise<boolean|string>
}

export type MemberDropdownModalFieldType = {
    id?:string
    name:string
    parent?:string
    email?:string
    departmentIds?:string[]
};

export type MemberDropdownModalProps = {
    type:'addDep'|'addChild'|'addMember'|'editMember'|'rename'
    entity?:(MemberTableListItem & {departmentIds:string[]}) | ({id?:string, departmentIds?:string[],name?:string})
    selectedMemberGroupId?:string
}

export type MemberDropdownModalHandle = {
    save:()=>Promise<boolean|string>
}
