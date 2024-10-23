export const BASE_GROUP_ORDER = JSON.stringify({})

/**
 * 消费者关系图节点字体大小
 */
export const RELATIVE_PICTURE_NODE_FONTSIZE = 14

export const SELF_SPACE_THEME = '#5B8FF933'
export const OUT_SPACE_THEME = '#F19E5733'
export const SELF_SPACE_CONTENT_COLOR = '#5B8FF9'
export const OUT_SPACE_CONTENT_COLOR = '#F19E57'
export const SELF_SPACE_CONTENT_EDGE_COLOR = '#5B8FF980'
export const OUT_SPACE_CONTENT_EDGE_COLOR = '#F19E5780'

export const END_ARROW_STYLE = {
  path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
  fill: '#E2E2E2',
  zIndex: 999
}
export const EDGE_STYLE = {
  stroke: '#E2E2E2',
  endArrow: END_ARROW_STYLE,
  lineWidth: 2,
  cursor: 'pointer'
}

export const SYSTEM_TUNNING_CONFIG = {
  options: {
    style: EDGE_STYLE
  },

  afterDraw: (cfg, group) => {
    const lineDash = [4, 2, 1, 2]
    if (!group) return
    const shape = group.get('children')[0]
    let index = 0
    // Define the animation
    shape.animate(
      () => {
        index = index + 0.4
        if (index > 1000) {
          index = 0
        }
        const res = {
          lineDash,
          lineDashOffset: -index
        }
        return res
      },
      {
        repeat: true,
        duration: 5000
      }
    )
  },

  setState: (name, value, item) => {
    if (!item || !name) return
    const shape = item.get('keyShape')
    const itemStatus = item.getStates()

    if (
      !['edge-success', 'edge-error', 'edge-transparent'].includes(name) &&
      itemStatus.some((state) => ['edge-error', 'edge-success', 'edge-transparent'].includes(state))
    )
      return
    const theme = item?._cfg?.model?.style?.stroke || SELF_SPACE_THEME
    if (name === 'running') {
      if (value) {
        shape.attr({
          lineWidth: 4,
          shadowColor: theme,
          shadowBlur: 2
        })
      } else {
        shape.attr(EDGE_STYLE)
      }
    }
  }
}
