import { Box, Stack } from '@mui/material'
import { ParamPreview } from './components/ParamPreview'
import { RenderMessageBody } from '../ApiPreview/components/MessageBody'

import { useEffect, useRef, useState } from 'react'
import { ValueEnum, ValueEnumApi } from './components/ValueEnum'
import { Example } from './components/Example'
import { ParamLimit } from './components/ParamLimit'
import { ParamAttrType } from '@common/const/api-detail'
import { BaseDialog } from '../Dialog/base-dialog.tsx'
import { ApiParamsTypeOptions } from '../ApiManager/components/ApiMessageBody/constants.ts'
import { $t } from '@common/locales/index.ts'

interface MoreSettingProps {
  open: boolean
  onClose: () => void
  param: RenderMessageBody | null
  onConfirm?: () => void
  onChange?: ({ param, id }: { param: Partial<ParamAttrType>; id: string }) => void
  readOnly?: boolean
  hiddenConfig?: {
    valueEnum?: boolean
    value?: boolean
    example?: boolean
    paramLength?: boolean
  }
}

export function MoreSetting({ open, readOnly, onClose, param, onChange, hiddenConfig }: MoreSettingProps) {
  const [previewType, setPreviewType] = useState<string>('')
  const [valueEnumList, setValueEnumList] = useState<ValueEnum[]>([])

  const valueEnumApiRef = useRef<ValueEnumApi>(null)

  const [code, setCode] = useState('')
  const [minLength, setMinLength] = useState(0)
  const [maxLength, setMaxLength] = useState(0)
  const [minValue, setMinValue] = useState(0)
  const [maxValue, setMaxValue] = useState(0)

  useEffect(() => {
    setPreviewType(ApiParamsTypeOptions.find((option) => option.value === param?.dataType)?.key || '')
    try {
      const list = JSON.parse(param?.paramAttr?.paramValueList || '[]')
      setValueEnumList(list.length ? list : [])
    } catch (err) {
      console.warn('error parsing paramValueList', err)
      setValueEnumList([])
    }
  }, [param])

  const handleConfirm = () => {
    onChange?.({
      id: param?.id as string,
      param: {
        paramValueList: JSON.stringify(valueEnumApiRef.current?.getEditMeta()),
        minLength,
        maxLength,
        minValue,
        maxValue,
        example: code
      }
    })
  }

  const handleExampleChange = (code: string) => {
    setCode(code)
  }

  const handleParamLengthChange = ({ min, max }: { min: number; max: number }) => {
    setMinLength(min)
    setMaxLength(max)
  }

  const handleParamValueChange = ({ min, max }: { min: number; max: number }) => {
    setMinValue(min)
    setMaxValue(max)
  }

  return (
    <BaseDialog open={open} onClose={onClose} title={$t('更多设置')} onConfirm={handleConfirm}>
      <Box px={2} pb={2} width={880}>
        <Stack spacing={2}>
          <ParamPreview
            name={param?.name}
            type={previewType}
            required={!!param?.isRequired}
            description={param?.description}
          />
          {!hiddenConfig?.paramLength ? (
            <ParamLimit
              min={param?.paramAttr?.minLength ?? 0}
              max={param?.paramAttr?.maxLength ?? 0}
              minLabel={$t('最小长度')}
              maxLabel={$t('最大长度')}
              onChange={handleParamLengthChange}
            />
          ) : null}
          {!hiddenConfig?.value ? (
            <ParamLimit
              min={param?.paramAttr?.minValue ?? 0}
              max={param?.paramAttr?.maxValue ?? 0}
              minLabel={$t('最小值')}
              maxLabel={$t('最大值')}
              onChange={handleParamValueChange}
            />
          ) : null}
          {!hiddenConfig?.valueEnum ? (
            <ValueEnum data={valueEnumList} apiRef={valueEnumApiRef} readOnly={readOnly} />
          ) : null}
          {!hiddenConfig?.example ? (
            <Example
              code={(param?.paramAttr?.example as string) || ''}
              readOnly={readOnly}
              onChange={handleExampleChange}
            />
          ) : null}
        </Stack>
      </Box>
    </BaseDialog>
  )
}
