import InsidePage from '@common/components/aoplatform/InsidePage'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { checkAccess } from '@common/utils/permission'
import { Icon } from '@iconify/react/dist/iconify.js'
import { App, Tabs } from 'antd'
import { useRef } from 'react'
import AIFlowChart from './AIFlowChart'
import AiSettingModalContent, { AiSettingModalContentHandle } from './AiSettingModal'
import AIUnConfigure from './AIUnconfigure'
import { AiProviderConfig, AiSettingListItem } from './types'

const AiSettingList = () => {
  const { modal, message } = App.useApp()
  const { fetchData } = useFetch()
  const modalRef = useRef<AiSettingModalContentHandle>()
  const { setAiConfigFlushed, accessData } = useGlobalContext()

  const openModal = async (entity: AiSettingListItem) => {
    console.log(entity)
    message.loading($t(RESPONSE_TIPS.loading))
    const { code, data, msg } = await fetchData<BasicResponse<{ provider: AiProviderConfig }>>('ai/provider/config', {
      method: 'GET',
      eoParams: { provider: entity!.id },
      eoTransformKeys: ['get_apikey_url']
    })
    message.destroy()
    if (code !== STATUS_CODE.SUCCESS) {
      message.error(msg || $t(RESPONSE_TIPS.error))
      return
    }
    modal.confirm({
      title: $t('模型配置'),
      content: (
        <AiSettingModalContent
          ref={modalRef}
          entity={{ ...data.provider, defaultLlm: entity.defaultLlm }}
          readOnly={!checkAccess('system.devops.ai_provider.edit', accessData)}
        />
      ),
      onOk: () => {
        return modalRef.current?.save().then((res) => {
          if (res === true) setAiConfigFlushed(true)
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
              href={data.provider.getApikeyUrl}
              className="flex items-center gap-[8px]"
            >
              <span>{$t('从 (0) 获取 API KEY', [data.provider.name])}</span>
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

  return (
    <>
      <InsidePage
        className="overflow-y-auto pb-PAGE_INSIDE_B"
        pageTitle={$t('AI 模型')}
        description={$t('配置好 AI 模型后，你可以使用对应的大模型来创建 AI 服务')}
        showBorder={false}
        scrollPage={false}
      >
        <div className="flex flex-col h-full">
          <Tabs
            className="flex-shrink-0"
            items={[
              {
                key: 'flow',
                label: $t('已设置'),
                children: <AIFlowChart openModal={openModal} />
              },
              {
                key: 'config',
                label: $t('未设置'),
                children: <div className="overflow-auto flex-grow">{<AIUnConfigure openModal={openModal} />}</div>
              }
            ]}
          />
        </div>
      </InsidePage>
    </>
  )
}
export default AiSettingList
