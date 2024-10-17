import InsidePage from "@common/components/aoplatform/InsidePage"
import { useGlobalContext } from "@common/contexts/GlobalStateContext"
import { $t } from "@common/locales"
import { Icon } from "@iconify/react/dist/iconify.js"
import { Button, Card, Collapse } from "antd"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export default function Guide(){
    const [showGuide, setShowGuide] = useState(localStorage.getItem('showGuide') !== 'false' )
    const [showAdvancedGuide, setShowAdvancedGuide] = useState(localStorage.getItem('showAdvancedGuide') !== 'false' )
    const [, forceUpdate] = useState<unknown>(null);
    const {state} = useGlobalContext()
    const location = useLocation()
    const currentUrl = location.pathname
    const navigator = useNavigate()
    const guideSections = [
        {
            title: $t('快速接入 AI'),
            items: [
                {
                    title: $t("配置你的 AI 模型"),
                    description: $t('通过 APIPark 快速接入各种 AI 模型，使用统一的格式来调用API，并且可以随意切换模型。'),
                    link: 'https://docs.apipark.com/docs/quick/pre-work/team'
                },
                {
                    title: $t("创建 AI 服务和 API"),
                    description: $t('创建 AI 类型的服务，并且你可以将 Prompt 提示词设置为一个 API，简化使用 AI 的流程。'),
                    link: 'https://docs.apipark.com/docs/quick/provider/service'
                },
                {
                    title: $t("创建调用 Token"),
                    description: $t('为了安全地调用 API，你需要创建一个应用以及Token。'),
                    link: 'https://docs.apipark.com/docs/quick/suberscriber/application'
                },
                {
                    title: $t("调用"),
                    description: $t('现在你可以通过 Token 来调用这些 API。'),
                    link: 'https://docs.apipark.com/docs/quick/suberscriber/application'
                }
            ]
        },
        {
            title: $t('快速接入 REST API'),
            items: [
                {
                    title: $t("创建 REST 服务和 API"),
                    description: $t('创建 AI 类型的服务，并且你可以将 Prompt 提示词设置为一个 API，简化使用 AI 的流程。'),
                    link: 'https://docs.apipark.com/docs/tutorials/api-market/service'
                },
                {
                    title: $t("创建调用 Token"),
                    description: $t('为了安全地调用 API，你需要创建一个应用以及Token。'),
                    link: 'https://docs.apipark.com/docs/quick/suberscriber/subscribe'
                },
                {
                    title: $t("调用"),
                    description: $t('现在你可以通过 Token 来调用这些 API。'),
                    link: 'https://docs.apipark.com/docs/quick/provider/approve'
                }
            ]
        },
        {
            title: $t('仪表盘'),
            items: [
                {
                    title: $t("统计 API 调用情况"),
                    description: $t('仪表盘中提供了多种统计图表，帮助我们了解 API 的运行情况。'),
                    link: 'https://docs.apipark.com/docs/quick/pre-work/monitor'
                }
            ]
        }
    ];
    const advanceGuideSections = [
        {
            title: $t('核心功能'),
            items: [
                {
                    title: $t("账号与角色"),
                    description: $t('邀请你的团队成员加入 APIPark，共同管理和调用 API。'),
                    link: 'https://docs.apipark.com/docs/quick/pre-work/team'
                },
                {
                    title: $t("团队"),
                    description: $t('团队中包含了人员、应用和服务，不同团队之间的应用和服务数据是隔离的，可用于管理企业内部不同的部门/项目组/团队。'),
                    link: 'https://docs.apipark.com/docs/quick/provider/service'
                },
                {
                    title: $t("服务"),
                    description: $t('服务内包含一组 API，并且可以发布到 API 市场被其他团队使用。'),
                    link: 'https://docs.apipark.com/docs/quick/suberscriber/application'
                }
            ]
        },
        {
            title: $t('权限管理'),
            items: [
                {
                    title: $t("订阅服务"),
                    description: $t('如果需要调用某个服务的 API，需要先订阅该服务，并且等待提供服务的团队审批后才可发起 API 请求。'),
                    link: 'https://docs.apipark.com/docs/tutorials/api-market/service'
                },
                {
                    title: $t("审批订阅申请"),
                    description: $t('提供服务的团队可以审批来自其他团队的订阅申请，审批通过后的应用才可发起 API 请求。'),
                    link: 'https://docs.apipark.com/docs/quick/suberscriber/subscribe'
                }
            ]
        },
        {
            title: $t('集成'),
            items: [
                {
                    title: $t("日志"),
                    description: $t('APIPark 提供详尽的 API 调用日志，帮助企业监控、分析和审计 API 的运行状况。'),
                    link: 'https://docs.apipark.com/docs/quick/pre-work/monitor'
                }
            ]
        }
    ];
    useEffect(()=>{
        localStorage.setItem('showGuide', showGuide.toString())
    },[showGuide])
    useEffect(()=>{
        localStorage.setItem('showAdvancedGuide', showAdvancedGuide.toString())
    },[showAdvancedGuide])
    
    useEffect(()=>{
        if(currentUrl === '/guide'){
            setTimeout(()=>{
                navigator('/guide/page')
            },0)
        }
    },[])
    useEffect(()=>{forceUpdate({})},[state.language])
    return (
       <InsidePage 
            pageTitle={<div className="flex items-center gap-[8px]">
                <span>👋</span>
                <span>{$t('Hello！欢迎使用 APIPark')}</span>
                <a className="" href="https://github.com/APIParkLab/APIPark" target="_blank"><img src="https://img.shields.io/github/stars/APIParkLab/APIPark?style=social"alt="" /></a>
            </div>} 
            description={<div className="flex flex-col gap-[8px]">
                <p>{$t("你能通过 APIPark 快速在企业内部构建 API 开放门户/市场，享受极致的转发性能、API 可观测、服务治理、多租户管理、订阅审批流程等诸多好处。")}</p>
                <p>{$t("如果你喜欢我们的产品，欢迎给我们 Star 或提供产品反馈意见。")}</p>
            </div>}
            showBorder={false}
            scrollPage={false}
            contentClassName=" w-full pr-PAGE_INSIDE_X pb-PAGE_INSIDE_B"
            >
               <div className="flex flex-col gap-[15px]">
               {showGuide && 
                <Collapse
                size="large"
                expandIconPosition='end'
                defaultActiveKey={['1']}
                className="bg-[linear-gradient(153.41deg,rgba(244,245,255,1)_0.23%,rgba(255,255,255,1)_83.32%)] rounded-[10px]  [&>.ant-collapse-item>.ant-collapse-content]:bg-transparent  "
                items={[{ key: '1', 
                            label: 
                                <div className="">
                                    <p className="text-[14px] mb-[10px] flex gap-[8px] items-center font-bold">
                                        <span>🚀</span><span>{`${$t('快速入门')}`}</span> </p>
                                <p className="text-[12px]" >{$t("我们提供了一些任务来帮你快速了解 APIPark")}</p></div>, 
                            children:<QuickGuideContent changeGuideShow={setShowGuide} guideSections={guideSections} /> }]}
                />}
                {showAdvancedGuide && 
                <Collapse
                size="large"
                expandIconPosition='end'
                defaultActiveKey={['1']}
                className="bg-[linear-gradient(153.41deg,rgba(244,245,255,1)_0.23%,rgba(255,255,255,1)_83.32%)] rounded-[10px]  [&>.ant-collapse-item>.ant-collapse-content]:bg-transparent  "
                items={[{ key: '1', 
                            label: 
                                <div className="">
                                    <p className="text-[14px] mb-[10px] flex gap-[8px] items-center font-bold">
                                        <span>🏍️</span><span>{`${$t('进阶教程')}`}</span> </p>
                                <p className="text-[12px]" >{$t("了解 APIPark 如何更好地管理 API 和 AI")}</p></div>, 
                            children:<QuickGuideContent changeGuideShow={setShowAdvancedGuide} guideSections={advanceGuideSections} /> }]}
                />}
               </div>
                
    </InsidePage>)
}

const QuickGuideContent = ({changeGuideShow,guideSections}:{changeGuideShow:Dispatch<SetStateAction<boolean>>,guideSections: {
    title: string;
    items: {
        title: string;
        description: string;
        link: string;
    }[];
}[]})=>{
   

    return (<>
                <div className="">
                            {guideSections.map((section, index) => (
                                <div key={index}>
                                    <p className="flex gap-[8px] items-center text-[14px] font-bold">
                                        <Icon icon="ic:baseline-info" width="18" height="18" className="text-theme" />
                                        {section.title}
                                    </p>
                                    <div className="ml-[9px] border-[0px] border-l-[1px] my-[10px] border-dashed border-BORDER">
                                        <div className="grid gap-[20px] px-[20px] py-[10px] justify-start content-start" style={{
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 0fr))',
                                            gridAutoRows: '1fr'
                                        }}>
                                            {section.items.map((item, itemIndex) => (
                                                <Card
                                                    key={itemIndex}
                                                    title={item.title}
                                                    className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible cursor-pointer w-[300px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]"
                                                    classNames={{ header: 'border-b-[0px] p-[20px] pb-[10px] text-[14px] font-normal', body: "p-[20px] pt-0 text-[12px] text-[#666]" }}
                                                    onClick={() => { window.open(item.link, '_blank') }}
                                                >
                                                    <span>{item.description}</span>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    <p className="flex gap-[8px] items-center">
                        <Icon icon="ic:baseline-info" width="18" height="18" className="text-theme"/>
                        <div className="flex items-center w-full gap-4">
                            <Button type="link" icon={<Icon icon="ic:baseline-open-in-new" width="18" height="18" />} iconPosition="end" classNames={{icon:'h-[22px] flex items-center'}} href="https://docs.apipark.com" target="_blank" className="text-[14px] font-bold  px-0">{$t('了解更多功能')}</Button>
                            <Button type="text" icon={<Icon icon="ic:baseline-visibility-off" width="18" height="18" />}  onClick={()=>changeGuideShow((prev)=>!prev)} classNames={{icon:'h-[22px] flex items-center'}} className="text-[14px] font-bold">{$t('隐藏该教程')}</Button>
                        </div>
                    </p>
               </div>
    </>)
}