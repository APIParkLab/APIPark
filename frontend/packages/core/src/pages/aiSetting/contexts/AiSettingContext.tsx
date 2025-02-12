import Icon from '@ant-design/icons'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { $t } from '@common/locales'
import { checkAccess } from '@common/utils/permission'
import { App } from 'antd'
import { createContext, useContext, useRef } from 'react'
import AiSettingModalContent, { AiSettingModalContentHandle } from '../AiSettingModal'
import { AiSettingListItem } from '../types'

interface AiSettingContextType {
  openConfigModal: (entity?: AiSettingListItem) => Promise<void>
}

const AiSettingContext = createContext<AiSettingContextType | undefined>(undefined)

export const AiSettingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { modal } = App.useApp()
  const { aiConfigFlushed, setAiConfigFlushed, accessData } = useGlobalContext()
  const modalRef = useRef<AiSettingModalContentHandle>()
  const entityData = useRef<any>(null)

  const openConfigModal = async (entity?: AiSettingListItem) => {
    // 更新弹窗
    const updateEntityData = (data: any) => {
      entityData.current = data
      // 更新弹窗
      modalInstance.update({})
    }
    const modalInstance = modal.confirm({
      title: $t('模型配置'),
      content: (
        <AiSettingModalContent
          ref={modalRef}
          entity={{ id: entity?.id, defaultLlm: entity?.defaultLlm }}
          modelMode={entity ? 'auto' : 'manual'}
          updateEntityData={updateEntityData}
          readOnly={!checkAccess('system.devops.ai_provider.edit', accessData)}
        />
      ),
      onOk: () => {
        return modalRef.current?.save().then((res) => {
          if (res === true) {
            setAiConfigFlushed(!aiConfigFlushed)
          }
        })
      },
      width: 600,
      okText: $t('确认'),
      footer: (_, { OkBtn, CancelBtn }) => {
        return (
          <div className="flex justify-between items-center">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={entityData.current?.getApikeyUrl}
              className="flex items-center gap-[8px]"
            >
              <span>{$t('从 (0) 获取 API KEY', [entityData.current?.name])}</span>
              <Icon icon="ic:baseline-open-in-new" width={16} height={16} />
            </a>
            <div>
              <CancelBtn />
              {checkAccess('system.devops.ai_provider.edit', accessData) ? <OkBtn /> : null}
            </div>
          </div>
        )
      },
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  return <AiSettingContext.Provider value={{ openConfigModal }}>{children}</AiSettingContext.Provider>
}

export const useAiSetting = () => {
  const context = useContext(AiSettingContext)
  if (!context) {
    throw new Error('useAiSetting must be used within an AiSettingProvider')
  }
  return context
}
