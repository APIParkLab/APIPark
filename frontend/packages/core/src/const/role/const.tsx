import { $t } from "@common/locales"

export const ROLE_TABLE_COLUMNS = [
    {
        title:$t('角色名称'),
        dataIndex: 'name',
        ellipsis:true,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    }

]