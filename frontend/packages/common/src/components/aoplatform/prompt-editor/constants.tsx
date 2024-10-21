// import type { ValueSelector } from '../../workflow/types'

export const CONTEXT_PLACEHOLDER_TEXT = '{{#context#}}'
export const HISTORY_PLACEHOLDER_TEXT = '{{#histories#}}'
export const QUERY_PLACEHOLDER_TEXT = '{{#query#}}'
export const PRE_PROMPT_PLACEHOLDER_TEXT = '{{#pre_prompt#}}'
export const UPDATE_DATASETS_EVENT_EMITTER = 'prompt-editor-context-block-update-datasets'
export const UPDATE_HISTORY_EVENT_EMITTER = 'prompt-editor-history-block-update-role'
export const MAX_VAR_KEY_LENGTH = 30

export const checkHasContextBlock = (text: string) => {
  if (!text)
    return false
  return text.includes(CONTEXT_PLACEHOLDER_TEXT)
}

export const checkHasHistoryBlock = (text: string) => {
  if (!text)
    return false
  return text.includes(HISTORY_PLACEHOLDER_TEXT)
}

export const checkHasQueryBlock = (text: string) => {
  if (!text)
    return false
  return text.includes(QUERY_PLACEHOLDER_TEXT)
}

/*
* {{#1711617514996.name#}} => [1711617514996, name]
* {{#1711617514996.sys.query#}} => [sys, query]
*/
export const getInputVars = (text: string) => {
  if (!text)
    return []

  const allVars = text.match(/{{#([^#]*)#}}/g)
  if (allVars && allVars?.length > 0) {
    // {{#context#}}, {{#query#}} is not input vars
    const inputVars = allVars
      .filter(item => item.includes('.'))
      .map((item) => {
        const valueSelector = item.replace('{{#', '').replace('#}}', '').split('.')
        if (valueSelector[1] === 'sys' && /^\d+$/.test(valueSelector[0]))
          return valueSelector.slice(1)

        return valueSelector
      })
    return inputVars
  }
  return []
}
