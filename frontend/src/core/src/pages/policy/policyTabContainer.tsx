import { Tabs } from "antd";

const PolicyTabContainer = (props: any) => {
  /**
   * 支持的tab
   */
  const { tabs } = props;

  return (
    <>
      <Tabs
        className="overflow-hidden h-full [&>.ant-tabs-content-holder]:overflow-auto global-policy-tabs"
        items={tabs}
      />
    </>
  )
}

export default PolicyTabContainer;