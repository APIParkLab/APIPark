import { FC } from 'react'
import { Input, Space } from 'antd'
import { Icon } from '@iconify/react/dist/iconify.js'

type KeyValueInput = {
  key: string
  value: string
}

type DynamicKeyValueInputProps = {
  value?: KeyValueInput[]
  onChange?: (newValue: KeyValueInput[]) => void
}

export function transferToList(rawData: unknown): Array<{ key: string; value: string }> {
  const res: Array<{ key: string; value: string }> = []
  if (!rawData) return res
  const keys: Array<string> = Object.keys(rawData)
  if (keys?.length > 0) {
    for (const key of keys) {
      res.push({ key: key, value: rawData[key] })
    }
    return [...res, { key: '', value: '' }]
  }
  return [{ key: '', value: '' }]
}

export function transferToMap(rawData: Array<{ key: string; value: string }>): { [key: string]: string } {
  const res: { [key: string]: string } = {}
  for (const kv of rawData) {
    if (kv.key && kv.value) {
      res[kv.key] = kv.value
    }
  }
  return res
}

export const DynamicKeyValueInput: FC<DynamicKeyValueInputProps> = ({ value = [{ key: '', value: '' }], onChange }) => {
  // const [keyValuePairs, setKeyValuePairs] = useState<KeyValueInput[]>([{ key: '', value: '' }]);

  // Define a handler for when the inputs change
  const handleInputChange = (index: number, type: 'key' | 'value', newValue: string) => {
    // Create a new array with the updated value
    const newKeyValuePairs = value ? [...value] : []
    if (newKeyValuePairs[index]) {
      newKeyValuePairs[index][type] = newValue
      // If we're changing the last input and it's not empty, add a new pair
      if (index === newKeyValuePairs.length - 1 && (newKeyValuePairs[index].key || newKeyValuePairs[index].value)) {
        newKeyValuePairs.push({ key: '', value: '' })
      }
      // Call the onChange handler if it exists
      onChange?.(newKeyValuePairs)
    }
  }

  const addNewPair = () => {
    const newKeyValuePairs = value ? [...value, { key: '', value: '' }] : [{ key: '', value: '' }]
    onChange?.(newKeyValuePairs)
  }

  const removePair = (index: number) => {
    const newKeyValuePairs = value?.filter((_, idx) => idx !== index) || []
    onChange?.(newKeyValuePairs)
  }

  return (
    <>
      {value &&
        value?.map((pair, index) => (
          <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
            <Input
              placeholder="Key"
              value={pair.key}
              onChange={(e) => handleInputChange(index, 'key', e.target.value)}
              style={{ width: 162 }}
            />
            <Input
              placeholder="Value"
              value={pair.value}
              onChange={(e) => handleInputChange(index, 'value', e.target.value)}
              style={{ width: 162 }}
            />
            {index !== value.length - 1 && (
              <>
                <Icon icon="ic:baseline-delete" onClick={() => removePair(index)} width="14" height="14" />
                <Icon icon="ic:baseline-add" onClick={addNewPair} width="14" height="14" />
              </>
            )}
          </Space>
        ))}
    </>
  )
}
