
import { ChangeEvent, useEffect, useState } from 'react'
import { FormControl, TextField, Box } from '@mui/material'
import { $t } from '@common/locales';

interface ParamLimitProps {
  min: number | null
  max: number | null
  onChange: ({ min, max }: { min: number; max: number }) => void
  minLabel?: string
  maxLabel?: string
}

export function ParamLimit({ min, max, onChange, minLabel = 'Minimum', maxLabel = 'Maximum' }: ParamLimitProps) {
  const [minValue, setMinValue] = useState<number>(min ?? 0)
  const [maxValue, setMaxValue] = useState<number>(max ?? 0)
  const [error, setError] = useState<string | null>(null)

  const validate = (minVal: number, maxVal: number) => {
    if (isNaN(minVal) || minVal < 0) {
      return $t('The (0) must not be negative.', [minLabel])
    }

    if (isNaN(maxVal) || maxVal < 0) {
      return $t('The (0) must not be negative.',[maxLabel])
    }

    if (minVal > maxVal) {
      return $t('The (0) must be greater than or equal to the (1).',[maxLabel, minLabel])
    }

    return null
  }

  useEffect(() => {
    onChange?.({
      min: minValue,
      max: maxValue
    })
  }, [minValue, maxValue, onChange])

  const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newMinValue = parseFloat(event.target.value)
    setMinValue(newMinValue)
    setError(validate(newMinValue, maxValue))
  }

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newMaxValue = parseFloat(event.target.value)
    setMaxValue(newMaxValue)
    setError(validate(minValue, newMaxValue))
  }

  return (
    <Box width="100%">
      <form>
        <FormControl error={!!error} variant="standard" fullWidth>
          <Box display="flex" width="100%" gap={2}>
            <Box width="100%">
              <TextField
                fullWidth
                label={minLabel}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: '1px solid #EDEDED'
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline':{
                    border:'1px solid #3D46F2'
                  },
                  '& .MuiInputLabel-root.Mui-focused':{
                    color:'#3D46F2'
                  },
                  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline':{
                    borderColor:'#3D46F2'
                    }
                }}
                value={minValue}
                onChange={handleMinChange}
                type="number"
                error={!!error && (isNaN(minValue) || minValue < 0)}
                helperText={!!error && (isNaN(minValue) || minValue < 0) ? error : ''}
              />
            </Box>
            <Box width="100%">
              <TextField
                fullWidth
                label={maxLabel}
                value={maxValue}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: '1px solid #EDEDED'
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline':{
                    border:'1px solid #3D46F2'
                  },
                  '& .MuiInputLabel-root.Mui-focused':{
                    color:'#3D46F2'
                  },
                  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline':{
                    borderColor:'#3D46F2'
                    }
                }}
                onChange={handleMaxChange}
                type="number"
                error={!!error && (isNaN(maxValue) || maxValue < 0 || maxValue < minValue)}
                helperText={!!error && (isNaN(maxValue) || maxValue < 0 || maxValue < minValue) ? error : ''}
              />
            </Box>
          </Box>
        </FormControl>
      </form>
    </Box>
  )
}
