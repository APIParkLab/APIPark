import { $t } from "@common/locales/index.ts";
import DataMasking from "./dataMasking/DataMasking";
import PolicyTabContainer from "./globalPolicy.tsx";

const servicePolicy = () => {
  /**
   * tab列表
   */
  const tabItems = [
    {
      key: 'dataMasking',
      label: $t('数据脱敏'),
      children: <div className="pr-[40px] h-full preview-document mb-PAGE_INSIDE_B"><DataMasking rowOperation={['edit', 'logs', 'delete']} /></div>
    }
  ]
  return (
    <>
      <PolicyTabContainer tabs={tabItems} />
    </>
  )
}

export default servicePolicy;