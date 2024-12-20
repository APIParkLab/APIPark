import { ColumnFilterItem } from 'antd/es/table/interface'
import { DepartmentListItem } from '@core/const/member/type'
import { RcFile } from 'antd/es/upload'

export const handleDepartmentListToFilter: (departmentList: DepartmentListItem[]) => ColumnFilterItem[] = (
  departmentList: DepartmentListItem[]
) => {
  return departmentList?.map((x: DepartmentListItem) => ({
    text: x.name,
    value: x.id,
    children: x.children ? handleDepartmentListToFilter(x.children) : null
  }))
}

export const getImgBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}

export const frontendTimeSorter = (a: { [k: string]: string }, b: { [k: string]: string }, field: string) => {
  return new Date(a[field]).getTime() - new Date(b[field]).getTime()
}
