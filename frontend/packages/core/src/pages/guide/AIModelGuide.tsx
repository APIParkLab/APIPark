import restAPIPic from '@common/assets/restAPI.svg'
import onlineAIPic from '@common/assets/onlineAI.svg'
import localAIPic from '@common/assets/localAI.svg'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { $t } from '@common/locales'
import { Icon } from '@iconify/react/dist/iconify.js'
import { App } from 'antd'
import { Card } from 'antd'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AiSettingModalContent, { AiSettingModalContentHandle } from '../aiSetting/AiSettingModal'
import { checkAccess } from '@common/utils/permission'
import LocalAiDeploy, { LocalAiDeployHandle } from './LocalAiDeploy'
import useDeployLocalModel from './deployModelUtil'
import RestAIDeploy, { RestAIDeployHandle } from './RestAIDeploy'

export const AIModelGuide = () => {
  const { modal } = App.useApp()
  const entityData = useRef<any>(null)
  const navigateTo = useNavigate()
  const { accessData } = useGlobalContext()
  const modalRef = useRef<AiSettingModalContentHandle>()
  const localAiDeployRef = useRef<LocalAiDeployHandle>()
  const restAiDeployRef = useRef<RestAIDeployHandle>()
  const { deployLocalModel } = useDeployLocalModel()

  const dumpServerPage = () => {
    navigateTo('/service/list')
  }

  /**
   * rest 服务卡片点击事件
   */
  const restCardClick = async () => {
    modal.confirm({
      title: $t('添加 Rest 服务'),
      content: <RestAIDeploy ref={restAiDeployRef}></RestAIDeploy>,
      onOk: () => {
        return restAiDeployRef.current?.deployRestAIServer().then((res) => {
          if (res === true) {
            dumpServerPage()
          }
        })
      },
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  /**
   * AI 模型配置弹窗
   */
  const aiCardClick = () => {
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
          modelMode="manual"
          updateEntityData={updateEntityData}
          source="guide"
          readOnly={!checkAccess('system.devops.ai_provider.edit', accessData)}
        />
      ),
      onOk: () => {
        return modalRef.current?.deployAIServer().then((res) => {
          if (res === true) {
            dumpServerPage()
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

  /**
   * 本地部署 AI 并生成 API
   */
  const localModelCardClick = async () => {
    const modalInstance = modal.confirm({
      title: $t('部署本地模型'),
      content: <LocalAiDeploy ref={localAiDeployRef} onClose={() => {
        modalInstance.destroy()
        dumpServerPage()
      }}></LocalAiDeploy>,
      onOk: () => {
        return localAiDeployRef.current?.deployLocalAIServer().then((res) => {
            if (res === true) {
              dumpServerPage()
            }
        })
      },
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }
  const deployDeepSeek = (e: any) => {
    e.stopPropagation()
    deployLocalModel({
      modelID: 'deepseek-r1'
    })
  }

  const cardList = [
    {
      imgSrc: restAPIPic,
      title: $t('添加 Rest 服务'),
      description: $t('支持批量添加现有 API 文档以实现统一的外部访问。'),
      click: restCardClick
    },
    {
      imgSrc: onlineAIPic,
      title: $t('添加在线 AI API'),
      description: $t('快速调用 AI 模型的云服务 API，方便管理提示词和统一计费。'),
      click: aiCardClick
    },
    {
      imgSrc: localAIPic,
      title: $t('本地部署 AI 并生成 API'),
      description: $t('快速在本地部署开源模型并自动生成 API。'),
      click: localModelCardClick,
      bottomRender: (
        <span className="text-[#2196f3] text-[13px] hover:text-[#1976d2]" onClick={deployDeepSeek}>
          <Icon className="align-sub mr-[5px]" icon="lsicon:lightning-filled" width="15" height="15" />
          {$t('部署')} Deepseek-R1
        </span>
      )
    }
  ]
  return (
    <div className="mb-[30px] p-[15px] flex justify-center">
      {cardList.map((item, itemIndex) => (
        <Card
          key={itemIndex}
          className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] bg-[linear-gradient(153.41deg,rgba(244,245,255,1)_0.23%,rgba(255,255,255,1)_83.32%)] mr-[30px] rounded-[10px] overflow-visible cursor-pointer w-[250px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]"
          classNames={{
            header: 'border-b-[0px] p-[20px] pb-[10px] text-[14px] font-normal',
            body: 'p-[20px] pt-[50px] pb-[50px] text-[12px] text-[#666] text-center'
          }}
          onClick={item.click}
        >
          <img src={item.imgSrc} alt="" width={60} height={60} />
          <p className="text-[13px] font-bold text-black mt-[10px] mb-[10px]">{item.title}</p>
          <p className="break-words mb-[10px]">{item.description}</p>
          {item.bottomRender ? item.bottomRender : null}
        </Card>
      ))}
    </div>
  )
}
