import PromptEditor from '@common/components/aoplatform/prompt-editor/PromptEditor.tsx'
import PromptEditorHeightResizeWrap from '@common/components/aoplatform/prompt-editor/prompt-editor-height-resize-wrap.tsx'
import { useState } from 'react'
import { getVars } from './utils'
import { VariableItems } from '@core/const/ai-service/type'

const PromptEditorResizable = (props: {
  value?: string
  onChange?: (value: string) => void
  variablesChange?: (keys: string[]) => void
  promptVariables: VariableItems[]
  disabled?: boolean
}) => {
  const { value, onChange, variablesChange, promptVariables, disabled } = props
  const minHeight = 68
  const [editorHeight, setEditorHeight] = useState(minHeight)
  const [previousKeys, setPreviousKeys] = useState<string[]>([])
  const handleChange = (newTemplates: string, keys: string[]) => {
    onChange?.(newTemplates)
  }

  return (
    <PromptEditorHeightResizeWrap
      className="px-4 pt-2 min-h-[94px] bg-white rounded-t-xl text-sm text-gray-700"
      height={editorHeight}
      minHeight={minHeight}
      onHeightChange={setEditorHeight}
      hideResize={false}
      footer={
        <div className="pl-4 pb-2 flex bg-white rounded-b-xl">
          <div className="h-[18px] leading-[18px] px-1 rounded-md bg-gray-100 text-xs text-gray-500">
            {value?.length || 0}
          </div>
        </div>
      }
    >
      <>
        {value !== undefined && (
          <PromptEditor
            className="min-h-[68px]"
            compact
            value={value}
            contextBlock={{
              show: false,
              selectable: true
              // datasets: dataSets.map(item => ({
              //     id: item.id,
              //     name: item.name,
              //     type: item.data_source_type,
              // })),
              // onAddContext: ()=>{console.log('?onAddContext')},
            }}
            variableBlock={{
              show: true,
              variables: promptVariables?.map((x) => ({ name: x.key, value: x.key })) || []
            }}
            externalToolBlock={{
              show: false,
              externalTools: []
              // onAddExternalTool: handleOpenExternalDataToolModal,
            }}
            historyBlock={{
              show: false,
              selectable: false,
              history: {
                user: '',
                assistant: ''
              },
              onEditRole: () => {}
            }}
            queryBlock={{
              show: false,
              selectable: true
            }}
            onChange={(value) => {
              handleChange?.(value, [])
            }}
            onBlur={() => {
              const keys = getVars(value)
              handleChange(value, keys)
              if (keys.filter((key) => !previousKeys.includes(key)).length > 0) {
                variablesChange?.(keys)
                setPreviousKeys(keys)
              }
            }}
            editable={disabled ? false : true}
          />
        )}
      </>
    </PromptEditorHeightResizeWrap>
  )
}

export default PromptEditorResizable
