'use client'

import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import localAIPic from '@common/assets/localAI.svg'
import onlineAIPic from '@common/assets/onlineAI.svg'
import restAPIPic from '@common/assets/restAPI.svg'
import { Icon } from '@iconify/react/dist/iconify.js'
import { checkAccess } from '@common/utils/permission'
import AiSettingModalContent, { AiSettingModalContentHandle } from '@core/pages/aiSetting/AiSettingModal'
import LocalAiDeploy, { LocalAiDeployHandle } from '@core/pages/guide/LocalAiDeploy'
import RestAIDeploy, { RestAIDeployHandle } from '@core/pages/guide/RestAIDeploy'
import useDeployLocalModel from '@core/pages/guide/deployModelUtil'
import { App as AppAntd, Button, Card, Collapse } from 'antd'
import { usePathname, useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'

function AIModelGuide() {
  const { message, modal } = AppAntd.useApp()
  const entityData = useRef<any>(null)
  const router = useRouter()
  const { accessData } = useGlobalContext()
  const modalRef = useRef<AiSettingModalContentHandle>()
  const localAiDeployRef = useRef<LocalAiDeployHandle>()
  const restAiDeployRef = useRef<RestAIDeployHandle>()
  const { deployLocalModel } = useDeployLocalModel()
  const { fetchData } = useFetch()
  const [ollamaAddress, setOllamaAddress] = useState<string>('')

  const dumpServerPage = () => {
    router.push('/service/list')
  }

  const restCardClick = async () => {
    const permission = checkAccess('system.workspace.service.edit', accessData)
    if (!permission) {
      return message.warning($t('暂无权限'))
    }
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

  const aiCardClick = () => {
    const permission = checkAccess('system.devops.ai_provider.edit', accessData)
    if (!permission) {
      return message.warning($t('暂无权限'))
    }
    const updateEntityData = (data: any) => {
      entityData.current = data
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
      footer: (_, { OkBtn, CancelBtn }) => (
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
      ),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  useEffect(() => {
    fetchData<BasicResponse<{ data: any[] }>>('model/local/source/ollama', {
      method: 'GET'
    }).then((response) => {
      if (response.code === STATUS_CODE.SUCCESS) {
        setOllamaAddress(response.data?.config?.address || '')
      } else {
        message.error(response.msg || $t(RESPONSE_TIPS.error))
      }
    })
  }, [])

  const localModelCardClick = async () => {
    const permission = checkAccess('system.devops.ai_provider.edit', accessData)
    if (!permission) {
      return message.warning($t('暂无权限'))
    }
    if (!ollamaAddress) {
      router.push('/aisetting?status=unconfigure')
      return
    }
    const modalInstance = modal.confirm({
      title: $t('部署本地模型'),
      content: (
        <LocalAiDeploy
          ref={localAiDeployRef}
          onClose={() => {
            modalInstance.destroy()
            dumpServerPage()
          }}
        ></LocalAiDeploy>
      ),
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

  const deployDeepSeek = async (e: any) => {
    e.stopPropagation()
    const permission = checkAccess('system.devops.ai_provider.edit', accessData)
    if (!permission) {
      return message.warning($t('暂无权限'))
    }
    if (!ollamaAddress) {
      router.push('/aisetting?status=unconfigure')
      return
    }
    await deployLocalModel({ modelID: 'deepseek-r1' })
    dumpServerPage()
  }

  const cardList = [
    {
      imgSrc: restAPIPic,
      title: $t('添加 Rest 服务'),
      description: $t('导入OpenAPI文档，将现有系统的API发布到APIPark。'),
      click: restCardClick
    },
    {
      imgSrc: onlineAIPic,
      title: $t('添加在线 AI API'),
      description: $t('添加公有云AI模型的 API Key，通过APIPark 统一调用公有云的AI模型。'),
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
    <>
      <p>{$t('⚡您可快速通过以下方式开放API供大家使用：')}</p>
      <div className="mb-[30px] pt-[25px] flex justify-between space-x-4">
        {cardList.map((item, itemIndex) => (
          <Card
            key={itemIndex}
            className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] bg-[linear-gradient(153.41deg,rgba(244,245,255,1)_0.23%,rgba(255,255,255,1)_83.32%)] rounded-[10px] overflow-visible cursor-pointer flex-1 transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]"
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
    </>
  )
}

function QuickGuideContent({
  changeGuideShow,
  guideSections
}: {
  changeGuideShow: Dispatch<SetStateAction<boolean>>
  guideSections: {
    title: string
    items: {
      title: string
      description: string
      link: string
    }[]
  }[]
}) {
  return (
    <div className="">
      {guideSections.map((section, index) => (
        <div key={index}>
          <p className="flex gap-[8px] items-center text-[14px] font-bold">
            <Icon icon="ic:baseline-info" width="18" height="18" className="text-theme" />
            {section.title}
          </p>
          <div className="ml-[9px] border-[0px] border-l-[1px] my-[10px] border-dashed border-BORDER">
            <div
              className="grid gap-[20px] px-[20px] py-[10px] justify-start content-start"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 0fr))',
                gridAutoRows: '1fr'
              }}
            >
              {section.items.map((item, itemIndex) => (
                <Card
                  key={itemIndex}
                  title={item.title}
                  className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible cursor-pointer w-[300px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]"
                  classNames={{
                    header: 'border-b-[0px] p-[20px] pb-[10px] text-[14px] font-normal',
                    body: 'p-[20px] pt-0 text-[12px] text-[#666]'
                  }}
                  onClick={() => window.open(item.link, '_blank')}
                >
                  <span>{item.description}</span>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="flex gap-[8px] items-center">
        <Icon icon="ic:baseline-info" width="18" height="18" className="text-theme" />
        <div className="flex items-center w-full gap-4">
          <Button
            type="link"
            icon={<Icon icon="ic:baseline-open-in-new" width="18" height="18" />}
            iconPosition="end"
            classNames={{ icon: 'h-[22px] flex items-center' }}
            href="https://docs.apipark.com"
            target="_blank"
            className="text-[14px] font-bold px-0"
          >
            {$t('了解更多功能')}
          </Button>
          <Button
            type="text"
            icon={<Icon icon="ic:baseline-visibility-off" width="18" height="18" />}
            onClick={() => changeGuideShow((prev) => !prev)}
            classNames={{ icon: 'h-[22px] flex items-center' }}
            className="text-[14px] font-bold"
          >
            {$t('隐藏该教程')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function GuidePage() {
  const [showGuide, setShowGuide] = useState(localStorage.getItem('showGuide') !== 'false')
  const [showAdvancedGuide, setShowAdvancedGuide] = useState(localStorage.getItem('showAdvancedGuide') !== 'false')
  const [, forceUpdate] = useState<unknown>(null)
  const { state } = useGlobalContext()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setShowGuide(window.localStorage.getItem('showGuide') !== 'false')
    setShowAdvancedGuide(window.localStorage.getItem('showAdvancedGuide') !== 'false')
  }, [])

  const guideSections = useMemo(
    () => [
      {
        title: $t('快速接入 AI'),
        items: [
          {
            title: $t('配置你的 AI 模型'),
            description: $t('通过 APIPark 快速接入各种 AI 模型，使用统一的格式来调用API，并且可以随意切换模型。'),
            link: 'https://docs.apipark.com/docs/system_setting/ai_model_providers'
          },
          {
            title: $t('创建 AI 服务和 API'),
            description: $t('创建 AI 类型的服务，并且你可以将 Prompt 提示词设置为一个 API，简化使用 AI 的流程。'),
            link: 'https://docs.apipark.com/docs/services/ai_services'
          },
          {
            title: $t('创建调用 Token'),
            description: $t('为了安全地调用 API，你需要创建一个消费者以及Token。'),
            link: 'https://docs.apipark.com/docs/consumers'
          },
          {
            title: $t('调用'),
            description: $t('现在你可以通过 Token 来调用这些 API。'),
            link: 'https://docs.apipark.com/docs/call_api'
          }
        ]
      },
      {
        title: $t('快速接入 REST API'),
        items: [
          {
            title: $t('创建 REST 服务和 API'),
            description: $t('创建 AI 类型的服务，并且你可以将 Prompt 提示词设置为一个 API，简化使用 AI 的流程。'),
            link: 'https://docs.apipark.com/docs/services/rest_services'
          },
          {
            title: $t('创建调用 Token'),
            description: $t('为了安全地调用 API，你需要创建一个消费者以及Token。'),
            link: 'https://docs.apipark.com/docs/consumers'
          },
          {
            title: $t('调用'),
            description: $t('现在你可以通过 Token 来调用这些 API。'),
            link: 'https://docs.apipark.com/docs/call_api'
          }
        ]
      },
      {
        title: $t('仪表盘'),
        items: [
          {
            title: $t('统计 API 调用情况'),
            description: $t('仪表盘中提供了多种统计图表，帮助我们了解 API 的运行情况。'),
            link: 'https://docs.apipark.com/docs/analysis'
          }
        ]
      }
    ],
    [state.language]
  )

  const advanceGuideSections = useMemo(
    () => [
      {
        title: $t('核心功能'),
        items: [
          {
            title: $t('账号与角色'),
            description: $t('邀请你的团队成员加入 APIPark，共同管理和调用 API。'),
            link: 'https://docs.apipark.com/docs/system_setting/account_role'
          },
          {
            title: $t('团队'),
            description: $t(
              '团队中包含了人员、消费者和服务，不同团队之间的消费者和服务数据是隔离的，可用于管理企业内部不同的部门/项目组/团队。'
            ),
            link: 'https://docs.apipark.com/docs/teams'
          },
          {
            title: $t('服务'),
            description: $t('服务内包含一组 API，并且可以发布到 API 市场被其他团队使用。'),
            link: 'https://docs.apipark.com/docs/category/-%E6%9C%8D%E5%8A%A1'
          }
        ]
      },
      {
        title: $t('权限管理'),
        items: [
          {
            title: $t('订阅服务'),
            description: $t(
              '如果需要调用某个服务的 API，需要先订阅该服务，并且等待提供服务的团队审核后才可发起 API 请求。'
            ),
            link: 'https://docs.apipark.com/docs/developer_portal'
          },
          {
            title: $t('审核订阅申请'),
            description: $t('提供服务的团队可以审核来自其他团队的订阅申请，审核通过后的消费者才可发起 API 请求。'),
            link: 'https://docs.apipark.com/docs/services/review_consumers'
          }
        ]
      },
      {
        title: $t('集成'),
        items: [
          {
            title: $t('日志'),
            description: $t('APIPark 提供详尽的 API 调用日志，帮助企业监控、分析和审计 API 的运行状况。'),
            link: 'https://docs.apipark.com/docs/system_setting/log/'
          }
        ]
      }
    ],
    [state.language]
  )

  useEffect(() => {
    window.localStorage.setItem('showGuide', showGuide.toString())
  }, [showGuide])

  useEffect(() => {
    window.localStorage.setItem('showAdvancedGuide', showAdvancedGuide.toString())
  }, [showAdvancedGuide])

  useEffect(() => {
    if (pathname === '/guide') {
      router.replace('/guide/page')
    }
  }, [pathname, router])

  useEffect(() => {
    forceUpdate({})
  }, [state.language])

  return (
    <div className="flex flex-col flex-1 h-full overflow-auto">
      <div className="border-[0px] mr-PAGE_INSIDE_X pt-[30px] pl-[40px]">
        <div className="mb-[30px]">
          <div className="flex justify-between mb-[20px] items-center">
            <div className="flex items-center gap-[8px] text-theme text-[26px]">
              <span>👋</span>
              <span>{$t('Hello！欢迎使用 APIPark')}</span>
            </div>
          </div>
          <div className="flex flex-col gap-[8px]">
            <p>
              <span className="font-bold">🦄 APIPark </span>
              {$t(
                '是开源的一站式 AI 网关与 API 门户，可快速接入 OpenAI/DeepSeek 等各类 AI 模型，通过统一请求格式避免模型切换对业务造成影响，提供企业级 API 安全防护（鉴权/限流/敏感词过滤）与实时用量监控，支持团队内 API 共享协作，管理接口订阅授权并保证您的API安全。'
              )}
            </p>
            <p>
              {$t('✨ 欢迎在 Github 为我们 Star 或提供产品反馈意见。')}
              <span className="font-bold">
                {$t('点击这里')}
                <span className="align-middle leading-[16px]">
                  &nbsp;
                  <Icon icon="pajamas:arrow-right" width="16" height="16" />
                  &nbsp;
                </span>
                <a className="align-text-top" href="https://github.com/APIParkLab/APIPark" target="_blank">
                  <img src="https://img.shields.io/github/stars/APIParkLab/APIPark?style=social" alt="" />
                </a>
                <span className="align-middle leading-[16px]">
                  &nbsp;
                  <Icon icon="pajamas:arrow-right" width="16" height="16" />
                  &nbsp;
                </span>
                {$t('点击')}
                &nbsp;
                <span className="align-middle leading-[16px]">
                  <Icon icon="emojione:star" width="16" height="16" />
                </span>
                Star
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full pr-PAGE_INSIDE_X pb-PAGE_INSIDE_B pl-[40px]">
        <AIModelGuide />
        <div className="flex flex-col gap-[15px] pb-PAGE_INSIDE_B">
          {showGuide && (
            <Collapse
              size="large"
              expandIconPosition="end"
              defaultActiveKey={['1']}
              className="bg-[linear-gradient(153.41deg,rgba(244,245,255,1)_0.23%,rgba(255,255,255,1)_83.32%)] rounded-[10px]  [&>.ant-collapse-item>.ant-collapse-content]:bg-transparent"
              items={[
                {
                  key: '1',
                  label: (
                    <div className="">
                      <p className="text-[14px] mb-[10px] flex gap-[8px] items-center font-bold">
                        <span>🚀</span>
                        <span>{`${$t('快速入门')}`}</span>{' '}
                      </p>
                      <p className="text-[12px]">{$t('我们提供了一些任务来帮你快速了解 APIPark')}</p>
                    </div>
                  ),
                  children: <QuickGuideContent changeGuideShow={setShowGuide} guideSections={guideSections} />
                }
              ]}
            />
          )}
          {showAdvancedGuide && (
            <Collapse
              size="large"
              expandIconPosition="end"
              defaultActiveKey={['1']}
              className="bg-[linear-gradient(153.41deg,rgba(244,245,255,1)_0.23%,rgba(255,255,255,1)_83.32%)] rounded-[10px]  [&>.ant-collapse-item>.ant-collapse-content]:bg-transparent"
              items={[
                {
                  key: '1',
                  label: (
                    <div className="">
                      <p className="text-[14px] mb-[10px] flex gap-[8px] items-center font-bold">
                        <span>🏍️</span>
                        <span>{`${$t('进阶教程')}`}</span>{' '}
                      </p>
                      <p className="text-[12px]">{$t('了解 APIPark 如何更好地管理 API 和 AI')}</p>
                    </div>
                  ),
                  children: <QuickGuideContent changeGuideShow={setShowAdvancedGuide} guideSections={advanceGuideSections} />
                }
              ]}
            />
          )}
        </div>
      </div>
    </div>
  )
}
