import { PartitionDataLogConfigFieldType } from "@core/const/partitions/types"

export type DashboardPageShowStatus = 'view'|'edit'
export type DashboardSettingEditProps = {
    changeStatus:(status:DashboardPageShowStatus)=>void
    refreshData:()=>void
    data?:PartitionDataLogConfigFieldType
}
const DataLogSettingEdit = (props:DashboardSettingEditProps) => {
    const {changeStatus,refreshData,data} = props
    return (
        <div>
            222
        </div>
    );
}

export default DataLogSettingEdit;