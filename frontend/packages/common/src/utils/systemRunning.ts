/**
 * @description 获取全局消费者关系视图（即空间下所有项目组的 api 关联关系)
 * @param request
 * @returns
 */
// export function getSpaceProjectGroupRelative(request: GetSpaceProjectGroupRelativeRequest) {
//   return this.http.post<GetSpaceProjectGroupRelativeResponse>(
//     '/javaApi/topology/project/get-all-relations',
//     request,
//     {
//       headers: {
//         'content-type': 'application/json'
//       }
//     }
//   )
// }

import G6, { EdgeConfig } from '@antv/g6'
import {
  OUT_SPACE_CONTENT_COLOR,
  OUT_SPACE_THEME,
  RELATIVE_PICTURE_NODE_FONTSIZE,
  SELF_SPACE_CONTENT_COLOR,
  SELF_SPACE_THEME
} from '@core/const/system-running/const'
import { NodeData } from '@core/const/system-running/type'
import { TopologyProjectItem, TopologyServiceItem } from '@core/pages/systemRunning/SystemRunning'

/**
 * @description 获取全局消费者关系视图（即空间下所有项目组的 api 关联关系)
 * @param request
 * @returns
 */
// export function getProjectGroupRelativeData(request: ProjectGroupRelativeRequest) {
//   return this.http.post<ProjectGroupRelativeResponse>('/javaApi/topology/project/get-focus-relations', request, {
//     headers: {
//       'content-type': 'application/json'
//     }
//   })
// }

export const nodesFormatter: (nodes: TopologyProjectItem[], isSelfSpace?: boolean) => NodeData[] = (
  nodes,
  isSelfSpace = true
) => {
  return nodes
    .filter((item) => item)
    .map((item) => {
      if (isSelfSpace === undefined) {
        isSelfSpace = true
      }
      const theme = isSelfSpace ? SELF_SPACE_CONTENT_COLOR : OUT_SPACE_CONTENT_COLOR
      const name = `${item.name}`
      const nodeData: NodeData = {
        id: item.id,
        label: fittingString(name, 150, RELATIVE_PICTURE_NODE_FONTSIZE),
        name: name,
        isSelfSpace,
        isApp: item.isApp,
        isServer: item.isServer,
        x: 250,
        y: 150,
        title: name,
        style: {
          // 自身空间内的边框颜色和其他空间的边框颜色不一致
          stroke: theme,
          border: theme,
          fill: isSelfSpace ? SELF_SPACE_THEME : OUT_SPACE_THEME
        },
        stateStyles: {
          selected: {
            // 选中状态的颜色
            fill: theme
          }
        }
      }
      return nodeData
    })
}
/**
 * @description
 */
export function edgesFormatter(projectConnectMap: Map<string, Map<string, TopologyServiceItem[]>>) {
  const edges: EdgeConfig[] = []
  for (const [projectKey, invokedMap] of projectConnectMap) {
    for (const [invokedProjectId] of invokedMap) {
      // 这里使用了 for...of 遍历 Map
      edges.push({
        source: projectKey,
        target: invokedProjectId,
        _projectInfo: invokedMap.get(invokedProjectId)
      })
    }
  }
  return edges
}

/**
 * @description 修正节点，过长省略
 * @param str
 * @param maxWidth
 * @param fontSize
 * @returns
 */
export const fittingString = (str: string, maxWidth: number, fontSize: number) => {
  const ellipsis = '...'
  const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0]
  let currentWidth = 0
  let res = str
  const pattern = new RegExp('[\u4E00-\u9FA5]+')
  str.split('').forEach((letter, i) => {
    if (currentWidth > maxWidth - ellipsisLength) return
    if (pattern.test(letter)) {
      currentWidth += fontSize
    } else {
      currentWidth += G6.Util.getLetterWidth(letter, fontSize)
    }
    if (currentWidth > maxWidth - ellipsisLength) {
      res = `${str.substr(0, i)}${ellipsis}`
    }
  })
  return res
}

/**
 * 动态获取节点距离
 */
export const getNodeSpacing = (num: number, nodes?: unknown) => {
  if (nodes) {
    const base: number = getNodeSpacing(num) as number
    return (d: { comboId: string }) => {
      return d.comboId === 'none-combo' ? base / 2 : base
    }
  }
  if (num <= 15) {
    return 100
  }
  let result = 100
  let base = 15
  while (num > base) {
    result = Math.ceil(result / 2)
    base *= 15
  }
  return result
}

export class UnionFind {
  private parent: Record<string, string>
  private rank: Record<string, number>

  constructor(initialNodes: string[]) {
    this.parent = {}
    this.rank = {}
    initialNodes.forEach((node) => {
      this.parent[node] = node
      this.rank[node] = 0
    })
  }

  find(node: string): string {
    if (node !== this.parent[node]) {
      this.parent[node] = this.find(this.parent[node])
    }
    return this.parent[node]
  }

  union(node1: string, node2: string): void {
    const root1 = this.find(node1)
    const root2 = this.find(node2)
    if (root1 !== root2) {
      if (this.rank[root1] < this.rank[root2]) {
        this.parent[root1] = root2
      } else if (this.rank[root1] > this.rank[root2]) {
        this.parent[root2] = root1
      } else {
        this.parent[root2] = root1
        this.rank[root1]++
      }
    }
  }
}
