import { IconButton } from '@common/components/postcat/api/IconButton'
import useCopyToClipboard from '@common/hooks/copy'
import { RESPONSE_TIPS } from '@common/const/const'
import { $t } from '@common/locales/index.ts'
import { App } from 'antd'
import ReactJson from 'react-json-view'

const ApiNetWorkDataPreview = ({ configContent = {} }: { configContent?: { [key: string]: string | undefined } }) => {
  /** 复制组件 */
  const { copyToClipboard } = useCopyToClipboard()
  /** 弹窗组件 */
  const { message } = App.useApp()
  /**
   * 复制
   * @param value
   * @returns
   */
  const handleCopy = async (value: string): Promise<void> => {
    if (value) {
      copyToClipboard(value)
      message.success($t(RESPONSE_TIPS.copySuccess))
    }
  }
  /**
   * 判断字符串是否是有效的JSON对象字符串
   */
  const isJsonString = (str: string): boolean => {
    try {
      const parsed = JSON.parse(str)
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
    } catch (e) {
      return false
    }
  }

  return (
    <>
      {Object.keys(configContent).filter((item) => !!configContent[item]).map((item) => {
        return (
          <div className="overflow-auto mb-[15px]">
            <div className="font-semibold text-[16px] mb-[10px]">{item}</div>
            <div className="bg-[#0a0b21] text-white p-4 rounded-md my-2 font-mono text-sm overflow-auto relative">
              {!configContent[item] ? (
                <pre className="whitespace-pre-wrap break-words"></pre>
              ) : isJsonString(configContent[item] || '') ? (
                // 如果是有效的JSON对象字符串，使用ReactJson渲染
                <ReactJson
                  src={JSON.parse(configContent[item] || '')}
                  theme="monokai"
                  indentWidth={2}
                  displayDataTypes={false}
                  displayObjectSize={false}
                  name={false}
                  collapsed={false}
                  enableClipboard={false}
                  style={{
                    backgroundColor: 'transparent',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal'
                  }}
                />
              ) : (
                // 如果是普通字符串，直接用pre渲染
                <pre className="whitespace-pre-wrap break-words my-[8px]">{configContent[item]}</pre>
              )}
              <IconButton
                name="copy"
                onClick={() => handleCopy(configContent[item] || '')}
                sx={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  color: '#999',
                  transition: 'none',
                  '&.MuiButtonBase-root:hover': {
                    background: 'transparent',
                    color: '#3D46F2',
                    transition: 'none'
                  }
                }}
              ></IconButton>
            </div>
          </div>
        )
      })}
    </>
  )
}
export default ApiNetWorkDataPreview
