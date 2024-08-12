
import {forwardRef, useImperativeHandle, useState} from 'react'

import { Input } from 'antd'
export const ArrayItemBlankComponent = forwardRef(
  (props: { [k: string]: any }, ref) => {
    const { onChange, value, dataFormat } = props

    const getDefaultListItem = () => {
      const defaultData: { [k: string]: unknown } = {}

      for (const data of dataFormat) {
        defaultData[data.key] = ''
      }

      return [defaultData]
    }

    const [resList, setResList] = useState(
      value && Object.keys(value).length > 0
        ? [
            ...value
              ?.filter((v: string) => {
                return v
              })
              ?.map((v: string) => {
                const vTmp = v
                const newValue: { [k: string]: unknown } = {}
                for (let index = 0; index < dataFormat.length; index++) {
                  if (dataFormat[index]?.hideName) {
                    newValue[dataFormat[index].key] = vTmp.split(' ')[index]
                  } else {
                    const vTmp2: string | string[] | undefined =
                      vTmp.indexOf(' ') === -1
                        ? vTmp
                        : vTmp.split(' ')[index]
                        ? vTmp.split(' ')[index].indexOf('=') === -1
                          ? ''
                          : vTmp.split(' ')[index].split('=')
                        : ''

                    if (vTmp2 && vTmp2 instanceof Array && vTmp2.length > 0) {
                      vTmp2.shift()
                    }
                    newValue[dataFormat[index].key] =
                      vTmp2 instanceof Array ? vTmp2?.join('=') : vTmp2
                  }
                }
                return newValue
              }),
            ...getDefaultListItem()
          ]
        : [...getDefaultListItem()]
    )

    useImperativeHandle(ref, () => ({}))

    const emitNewArr = () => {
      const newArr: Array<string> = []
      for (const r of resList) {
        if (r[dataFormat[0].key]) {
          newArr.push(
            dataFormat?.map((format: { key: string; hideName: boolean }) => {
                return format?.hideName
                  ? r[format.key]
                  : `${format.key}=${r[format.key]}`
              })
              .join(' ')
          )
        }
      }
      onChange(newArr)
    }

    const changeInputValue = (
      newValue: string,
      index: number,
      keyName: string,
      dataFormat: unknown
    ) => {
      const newArr = [...resList]
      newArr[index][keyName] = newValue
      newArr[index].status =
        (dataFormat.required && !newValue) ||
        (dataFormat.pattern && !dataFormat.pattern.test(newValue))
          ? 'error'
          : ''
      setResList(newArr)
      emitNewArr()
      if (index === resList.length - 1) {
        setResList([...newArr, ...getDefaultListItem()])
      }
    }

    const addLine = (index: number) => {
      resList.splice(index + 1, 0, ...getDefaultListItem())
      const newKvList = [...resList]
      setResList(newKvList)
      emitNewArr()
    }

    const removeLine = (index: number) => {
      resList.splice(index, 1)
      const newKvList = [...resList]
      setResList([...newKvList])
      emitNewArr()
    }

    return (
      <div>
        {resList?.map((n: unknown, index: unknown) => {
          return (
            <div
              key={n + index}
              className="flex"
              style={{ marginTop: index === 0 ? '0px' : '16px' }}
            >
              {dataFormat?.map((data: unknown, index2: unknown) => {
                return (
                  <Input
                    key={data.key + index2}
                    className="mr-[8px]"
                    style={{ width: data.width }}
                    value={n[data.key]}
                    onChange={(e: unknown) => {
                      changeInputValue(e.target.value, index, data.key, data)
                    }}
                    placeholder={data.placeholder || `请输入${data.key}`}
                    status={n.status}
                    type={data.type || 'text'}
                  />
                )
              })}

              {index !== resList.length - 1 && (
                <div style={{ display: 'inline-block' }}>
                  {n[dataFormat[0].key] && (
                    <a
                      className="array_item_addition ant-btn-text anticon"
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
                    className="array_item_addition ant-btn-text anticon"
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
