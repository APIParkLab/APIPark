// deployModelUtil.ts
import { useFetch } from '@common/hooks/http'
import { message } from 'antd'
import { STATUS_CODE, RESPONSE_TIPS, BasicResponse } from '@common/const/const'
import { $t } from '@common/locales'
import { MemberItem, SimpleTeamItem } from '@common/const/type'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'

const useDeployLocalModel = () => {
  const { fetchData } = useFetch()
  const { checkPermission } = useGlobalContext()
  const deployLocalModel = (value: { modelID: string; team?: number }) => {
    return new Promise((resolve, reject) => {
      fetchData<BasicResponse<null>>('model/local/deploy/start', {
        method: 'POST',
        eoBody: {
          model: value.modelID,
          team: value?.team
        }
      })
        .then((response) => {
          const { code, msg } = response
          if (code === STATUS_CODE.SUCCESS) {
            message.success(msg || $t(RESPONSE_TIPS.success))
            resolve(true)
          } else {
            message.error(msg || $t(RESPONSE_TIPS.error))
            reject(false)
          }
        })
        .catch((errorInfo) => reject(errorInfo))
    })
  }
    /**
   * 获取 team 选项列表
   * @returns
   */
    const getTeamOptionList = async (): any[] => {
      const response = await fetchData<BasicResponse<{ teams: SimpleTeamItem[] }>>(
        !checkPermission('system.workspace.team.view_all') ? 'simple/teams/mine' : 'simple/teams',
        { method: 'GET', eoTransformKeys: [] }
      )
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        const teamOptionList = data.teams?.map((x: MemberItem) => {
          return { ...x, label: x.name, value: x.id }
        })
        return teamOptionList
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
        return []
      }
    }
  return { deployLocalModel, getTeamOptionList }
}

export default useDeployLocalModel
