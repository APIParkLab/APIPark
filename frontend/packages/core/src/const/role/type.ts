
export type RoleTableListItem = {
    id:string
    name:string
}

export type RoleModalContentProps = {
    type:'add'|'edit'
    entity?:RoleTableListItem
}

export type RoleModalContentHandle = {
    save:()=>Promise<boolean|string>
}