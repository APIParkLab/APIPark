import InsidePage from "@common/components/aoplatform/InsidePage.tsx";
import { $t } from "@common/locales/index.ts";
import PolicyTabContainer from "./policyTabContainer.tsx";
import DataMasking from "./dataMasking.tsx";


const PartitionInsideGlobalPolicy = () => {
  /**
   * tab列表
   */
  const tabItems = [
    {
      key: 'dataMasking',
      label: $t('数据脱敏'),
      children: <div className="pr-[40px] preview-document h-full pb-[40px]"><DataMasking publishBtn rowOperation={['edit', 'logs', 'delete']} /></div>
    }
  ]

  return (
    <>
      <InsidePage
        pageTitle={$t('全局策略')}
        description={$t("支持对系统全局进行统一的策略配置，从而简化管理并确保一致性。全局策略的优先级比服务策略略低。")}
        showBorder={false}
        scrollPage={false}
      >
        <PolicyTabContainer tabs={tabItems} />
      </InsidePage>
    </>
  )
}

export default PartitionInsideGlobalPolicy