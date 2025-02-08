import { SystemTableListItem } from '@core/const/system/type'
import type { StepsProps } from 'antd'
import { Popover, Steps } from 'antd'
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'

const customDot: StepsProps['progressDot'] = (dot, { status, index }) => (
  <Popover
    content={
      <span>
        step {index} status: {status}
      </span>
    }
  >
    {dot}
  </Popover>
)

export const ServiceDeployment = (props: { record: SystemTableListItem }) => {
  const { record } = props
  console.log('record', record)

  const items = [
    {
      title: 'Download',
      description: '4.7 GB / 4.7 GB'
    },
    {
      title: 'Deploy',
    },
    {
      title: 'Initializing',
    }
  ]
  return (
    <div className="flex justify-center items-center">
      {/* <Steps items={items} /> */}
      <Steps
        current={0}
        labelPlacement="vertical"
        items={items}
      />
    </div>
  )
}
