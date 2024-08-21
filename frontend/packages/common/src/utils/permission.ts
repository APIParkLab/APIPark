
import { PERMISSION_DEFINITION } from "@common/const/permissions"
import { AccessDataType } from "@common/const/type"


export const checkAccess:(access:AccessDataType, accessData:Map<string,string[]>)=>boolean = (access, accessData)=>{
    if(!access){
      return true
    }
    const accLevel = access.split('.')[0]
    if(['system','team'].indexOf(accLevel) === -1){
        console.warn('权限字段有误：',access)
        return false
    }
    const neededBackendAccessArr = PERMISSION_DEFINITION[0]?.[access]?.granted.anyOf[0].backend || []
    return accessData?.has(accLevel)&& accessData.get(accLevel)!.length > 0 ? hasIntersection(neededBackendAccessArr, accessData.get(accLevel)!) : false
}

const hasIntersection = (arr1:string[], arr2:string[])=> {
  // 当没有对应后端权限字段时，默认有权限
    if(arr1.length === 0) return true
    const set = new Set(arr1.length > arr2.length ? arr2:arr1) 
    const arr = arr1.length > arr2.length ? arr1:arr2
    for (const item of arr) {
      if (set.has(item)) {
        return true; // 发现交集
      }
    }
    return false; // 没有交集
  }