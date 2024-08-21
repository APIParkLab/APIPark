import { EntityItem } from "@common/const/type";

export type OpenApiTableListItem = {
    id:string;
    name: string;
    token:string;
    tags:string;
    status:boolean;
    operator:EntityItem;
    updateTime:string;
};