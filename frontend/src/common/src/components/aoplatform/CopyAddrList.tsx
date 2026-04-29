import { useState, FC } from 'react'
import { Tooltip, Button } from 'antd'
import useCopyToClipboard from '@common/hooks/copy'
import { Icon } from '@iconify/react/dist/iconify.js'

type AddressItem = {
  expand?: boolean
  [key: string]: unknown
}

type CopyAddrListProps = {
  addrItem: AddressItem
  onAddrItemChange?: (addrItem: AddressItem) => void
  keyName: string
}

const CopyAddrList: FC<CopyAddrListProps> = ({ addrItem, onAddrItemChange, keyName }) => {
  const [localAddrItem, setLocalAddrItem] = useState<AddressItem>(addrItem)
  const { copyToClipboard } = useCopyToClipboard()

  const toggleExpand = () => {
    const updatedAddrItem = { ...localAddrItem, expand: !localAddrItem.expand }
    setLocalAddrItem(updatedAddrItem)
    onAddrItemChange?.(updatedAddrItem)
  }

  const renderTooltipTitle = () => {
    // 假设keyName对应的值是一个字符串数组
    const addresses: string[] = localAddrItem[keyName] as string[]
    return (
      <div>
        {addresses?.map((addr, index) => (
          <div key={index} className="flex justify-between">
            <span className="leading-6">{addr}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderAddresses = () => {
    if (!localAddrItem.expand) {
      return (
        <span className="overflow-ellipsis w-full inline-block overflow-hidden align-middle">
          <Tooltip title={renderTooltipTitle}>
            <span className="flex items-center">
              <span
                className={`overflow-ellipsis inline-block overflow-hidden align-middle ${(localAddrItem[keyName] as string[]).length > 1 ? 'w-5/6' : 'w-full'}`}
              >
                {(localAddrItem[keyName] as string[]).join(',')}
              </span>
              {(localAddrItem[keyName] as string[]).length === 1 && (
                <Button
                  type="primary"
                  className="border-none ant-typography-copy text-theme hover:text-A_HOVER "
                  ghost
                  onClick={() => copyToClipboard(localAddrItem[keyName] as string)}
                  icon={<Icon icon="ic:baseline-file-copy" width="14" height="14" />}
                  size="small"
                />
              )}
              {(localAddrItem[keyName] as string[]).length !== 1 && (
                <Button
                  className="border-none bg-transparent w-[16px] h-[22px] text-table_text p-[0px]"
                  icon={<iconpark-icon name="zhankai" style={{ marginTop: '4px' }}></iconpark-icon>}
                  onClick={toggleExpand}
                />
              )}
            </span>
          </Tooltip>
        </span>
      )
    } else {
      return (
        <div className="flex flex-nowrap items-center justify-between">
          <div>
            {(localAddrItem[keyName] as string[])?.map((addr: string, index: number) => (
              <div key={index} className="block w-full">
                <span className="leading-6">{addr}</span>
                <Button
                  type="primary"
                  className="border-none bg-transparent w-[16px] h-[22px]  p-[0px] ml-2 text-theme hover:text-A_HOVER"
                  ghost
                  onClick={() => copyToClipboard(addr)}
                  icon={<Icon icon="ic:baseline-file-copy" width="14" height="14" />}
                  size="small"
                />
              </div>
            ))}
          </div>
          <Button
            className="border-none bg-transparent w-[16px] h-[22px] text-table_text p-[0px]"
            icon={<iconpark-icon name="shouqi-2"></iconpark-icon>}
            onClick={toggleExpand}
          />
        </div>
      )
    }
  }

  return <div>{renderAddresses()}</div>
}

export default CopyAddrList
