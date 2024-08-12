import {forwardRef, useImperativeHandle, useState} from 'react'

import { Input } from '@formily/antd-v5'
export const SimpleMapComponent = forwardRef(
  (props: { [k: string]: unknown }, ref) => {
    const {
      onChange,
      value,
      placeholderKey = '请输入Key',
      placeholderValue = '请输入Value'
    } = props

    const [kvList, setKvList] = useState(
      value && Object.keys(value).length > 0
        ? [
            ...Object.keys(value)?.map((k: string) => {
              return { key: k, value: value[k] }
            }),
            { key: '', value: '' }
          ]
        : [{ key: '', value: '' }]
    )

    useImperativeHandle(ref, () => ({}))

    const emitNewArr = () => {
      const res: { [k: string]: unknown } = {}
      for (const kv of kvList) {
        res[kv.key] = kv.value
      }
      onChange(res)
    }

    const changeInputValue = (
      newValue: string,
      index: number,
      type: 'key' | 'value'
    ) => {
      const newArr = [...kvList]
      newArr[index][type] = newValue
      setKvList(newArr)
      emitNewArr()
      if (index === kvList.length - 1) {
        setKvList([...newArr, { key: '', value: '' }])
      }
    }

    const addLine = (index: number) => {
      kvList.splice(index + 1, 0, { key: '', value: '' })
      const newKvList = [...kvList]
      setKvList(newKvList)
      emitNewArr()
    }

    const removeLine = (index: number) => {
      kvList.splice(index, 1)
      const newKvList = [...kvList]
      setKvList(newKvList)
      emitNewArr()
    }

    return (
      <div>
        {kvList?.map((n: unknown, index: unknown) => {
          return (
            <div
              key={n + index}
              className="flex"
              style={{ marginTop: index === 0 ? '0px' : '16px' }}
            >
              <Input
                    className="w-INPUT_NORMAL mr-[8px]"
                style={{ width: '174px' }}
                value={n.key}
                onChange={(e: unknown) => {
                  changeInputValue(e.target.value, index, 'key')
                }}
                placeholder={placeholderKey}
              />
              <Input
                style={{ width: '164px', marginRight: '10px' }}
                value={n.value}
                onChange={(e: unknown) => {
                  changeInputValue(e.target.value, index, 'value')
                }}
                placeholder={placeholderValue}
              />
              {index !== kvList.length - 1 && (
                <div style={{ display: 'inline-block' }}>
                  {n.key && (
                    <a
                      className="arrayItemAddition ant-btn-text anticon"
                      onClick={() => addLine(index)}
                    >
                      <span>
                        <svg className="iconpark-icon">
                          <use href="#add-circle"></use>
                        </svg>
                      </span>
                    </a>
                  )}
                  <a
                    className="arrayItemAddition ant-btn-text anticon"
                    onClick={() => removeLine(index)}
                  >
                    <span>
                      <svg className="iconpark-icon">
                        <use href="#reduce-one"></use>
                      </svg>
                    </span>
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }
)
