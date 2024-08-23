import InsidePage from "@common/components/aoplatform/InsidePage"
import { $t } from "@common/locales"
import { Icon } from "@iconify/react/dist/iconify.js"
import { Button, Card, Collapse } from "antd"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

export default function Guide(){
    const [showGuide, setShowGuide] = useState(localStorage.getItem('showGuide') !== 'false' )
    useEffect(()=>{
        localStorage.setItem('showGuide', showGuide.toString())
    },[showGuide])
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
            contentClassName=" pr-PAGE_INSIDE_X pb-PAGE_INSIDE_B"
            >
                {showGuide && 
                <Collapse
                size="large"
                expandIconPosition='end'
                defaultActiveKey={['1']}
                className="bg-[linear-gradient(153.41deg,rgba(244,245,255,1)_0.23%,rgba(255,255,255,1)_83.32%)] rounded-[10px] h-full [&>.ant-collapse-item]:h-full [&>.ant-collapse-item]:flex [&>.ant-collapse-item]:flex-col  [&>.ant-collapse-item>.ant-collapse-content]:bg-transparent [&>.ant-collapse-item>.ant-collapse-content]:overflow-auto "
                items={[{ key: '1', 
                            label: 
                                <div className="">
                                    <p className="text-[14px] mb-[10px] flex gap-[8px] items-center font-bold">
                                        <span>🚀</span><span>{`${$t('快速入门')}`}</span> </p>
                                <p className="text-[12px]" >{$t("我们提供了一些任务来帮你快速了解 APIPark")}</p></div>, 
                            children:<QuickGuideContent changeGuideShow={setShowGuide} /> }]}
                />}
    </InsidePage>)
}

const QuickGuideContent = ({changeGuideShow}:{changeGuideShow:Dispatch<SetStateAction<boolean>>})=>{
    return (<>
                <div className="">
                    <p className="flex gap-[8px] items-center text-[14px] font-bold"><Icon icon="ic:baseline-info" width="18" height="18"  className="text-theme "
                            />{$t('工作空间')}</p>
                    <div className="ml-[9px] border-[0px] border-l-[1px] my-[10px] border-dashed border-BORDER">
                        <div className="grid gap-[20px] px-[20px] py-[10px] justify-start content-start" style={{
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 0fr))',
                                gridAutoRows: '1fr'
                                }}>
                            <Card title={$t("团队")} className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible cursor-pointer w-[300px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]" classNames={{header:'border-b-[0px] p-[20px] pb-[10px] text-[14px] font-normal ', body:"p-[20px] pt-0 text-[12px] text-[#666]"}} onClick={()=>{window.open('https://docs.apipark.com/docs/category/%E5%9B%A2%E9%98%9F','_blank')}}>
                                <span className="">{$t('团队中包含了人员、应用和服务，不同团队之间的应用和服务数据是隔离的，可用于管理企业内部不同的部门/项目组/团队。')}</span> 
                            </Card>
                            <Card title={$t("服务")} className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible cursor-pointer w-[300px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]" classNames={{header:'border-b-[0px] p-[20px] pb-[10px]  text-[14px] font-normal', body:"p-[20px]  pt-0 text-[12px] text-[#666]"}} onClick={()=>{window.open('https://docs.apipark.com/docs/category/%E6%9C%8D%E5%8A%A1','_blank')}}>
                                <span className="">{$t('服务内包含一组 API，并且可以发布到 API 市场被其他团队使用。')}</span> 
                            </Card>
                            <Card title={$t("应用")} className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible cursor-pointer w-[300px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]" classNames={{header:'border-b-[0px] p-[20px] pb-[10px]  text-[14px] font-normal', body:"p-[20px]  pt-0 text-[12px] text-[#666]"}} onClick={()=>{window.open('https://docs.apipark.com/docs/category/%E5%BA%94%E7%94%A8','_blank')}}>
                                <span className="">{$t('应用是申请服务和调用 API 的身份，可以在 API 市场申请调用服务，并且每个应用拥有独立的 API 访问鉴权。')}</span> 
                            </Card>
                        </div>
                    </div>
                    <p className="flex gap-[8px] items-center text-[14px] font-bold"><Icon icon="ic:baseline-info" width="18" height="18" className="text-theme"/>{$t('API 市场')}</p>
                    <div className="ml-[9px] border-[0px] border-l-[1px] my-[10px] border-dashed border-BORDER">
                        <div className="grid gap-[20px] px-[20px] py-[10px] justify-start content-start" style={{
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 0fr))',
                                gridAutoRows: '1fr'
                                }}>
                            <Card title={$t("检索服务和 API")} className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible cursor-pointer w-[300px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]" classNames={{header:'border-b-[0px] p-[20px] pb-[10px]  text-[14px] font-normal', body:"p-[20px] pt-0 text-[12px] text-[#666]"}} onClick={()=>{window.open('https://docs.apipark.com/docs/category/api-market','_blank')}}>
                                <span className="">{$t('你可以在 API 市场中查看所有公开的服务。')}</span> 
                            </Card>
                            <Card title={$t("订阅服务")} className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible cursor-pointer w-[300px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]" classNames={{header:'border-b-[0px] p-[20px] pb-[10px]  text-[14px] font-normal', body:"p-[20px]  pt-0 text-[12px] text-[#666]"}} onClick={()=>{window.open('https://docs.apipark.com/docs/tutorials/application/subscribe-service','_blank')}}>
                                <span className="">{$t('如果需要调用某个服务的 API，需要先订阅该服务，并且等待提供服务的团队审批后才可发起 API 请求。')}</span> 
                            </Card>
                            <Card title={$t("审批订阅申请")} className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible cursor-pointer w-[300px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]" classNames={{header:'border-b-[0px] p-[20px] pb-[10px]  text-[14px] font-normal', body:"p-[20px]  pt-0 text-[12px] text-[#666]"}} onClick={()=>{window.open('https://docs.apipark.com/docs/tutorials/service/subscriber-approve','_blank')}}>
                                <span className="">{$t('提供服务的团队可以审批来自其他团队的订阅申请，审批通过后的应用才可发起 API请求。')}</span> 
                            </Card>
                        </div>
                    </div>
                    <p className="flex gap-[8px] items-center text-[14px] font-bold"><Icon icon="ic:baseline-info" width="18" height="18" className="text-theme"/>{$t('仪表盘')}</p>
                    <div className="ml-[9px] border-[0px] border-l-[1px] my-[10px] border-dashed border-BORDER">
                        <div className="grid gap-[20px] px-[20px] py-[10px] justify-start content-start" style={{
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 0fr))',
                                gridAutoRows: '1fr'
                                }}>
                            <Card title={$t("运行视图")} className="shadow-[0_5px_10px_0_rgba(0,0,0,0.05)] rounded-[10px] overflow-visible cursor-pointer w-[300px] transition duration-500 hover:shadow-[0_5px_20px_0_rgba(0,0,0,0.15)] hover:scale-[1.05]" classNames={{header:'border-b-[0px] p-[20px] pb-[10px]  text-[14px] font-normal', body:"p-[20px] pt-0 text-[12px] text-[#666]"}} onClick={()=>{window.open('https://docs.apipark.com/docs/quick/','_blank')}}>
                                <span className="">{$t('仪表盘中提供了多种统计图表，帮助我们了解 API 的运行情况。')}</span> 
                            </Card>
                        </div>
                    </div>
                    <p className="flex gap-[8px] items-center">
                        <Icon icon="ic:baseline-info" width="18" height="18" className="text-theme"/>
                        <div className="flex justify-between items-center w-full">
                            <Button type="link" icon={<Icon icon="ic:baseline-open-in-new" width="18" height="18" />} iconPosition="end" classNames={{icon:'h-[22px] flex items-center'}} href="https://docs.apipark.com" target="_blank" className="text-[14px] font-bold  px-0">{$t('了解更多功能')}</Button>
                            <Button type="text" icon={<Icon icon="ic:baseline-visibility-off" width="18" height="18" />}  onClick={()=>changeGuideShow((prev)=>!prev)} classNames={{icon:'h-[22px] flex items-center'}} className="text-[14px] font-bold">{$t('隐藏快速入门')}</Button>
                        </div>
                    </p>
               </div>
    </>)
}