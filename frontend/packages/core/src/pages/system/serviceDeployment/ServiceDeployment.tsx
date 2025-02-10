import { SystemTableListItem } from '@core/const/system/type'
import { Steps } from 'antd'
import { CheckCircleOutlined, LoadingOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Codebox } from '@common/components/postcat/api/Codebox'
import { Collapse } from 'antd'
import { useEffect, useState } from 'react'
import { useFetch } from '@common/hooks/http'

const getIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleOutlined style={{ color: 'green', fontSize: '40px' }} />
    case 'inProgress':
      return <LoadingOutlined style={{ color: '#2196f3', fontSize: '40px' }} />
    case 'pending':
      return <ClockCircleOutlined style={{ color: 'gray', fontSize: '40px' }} />
    case 'error':
      return <CloseCircleOutlined style={{ color: 'red', fontSize: '40px' }} />
    default:
      return null
  }
}

export const ServiceDeployment = (props: { record: SystemTableListItem }) => {
  const { record } = props

  const [stepItem, setStepItem] = useState<
    {
      title: string
      description?: string
      status?: string
    }[]
  >([
    {
      title: 'Download',
      status: 'pending'
    },
    {
      title: 'Deploy',
      status: 'pending'
    },
    {
      title: 'Initializing',
      status: 'pending'
    }
  ])

  const [scriptStr, setScriptStr] = useState('')
  const [step, setStep] = useState(0)
  const [collapseText] = useState('Progress log')
  const { fetchData } = useFetch()

  useEffect(() => {
    setStepItem((prevItems) =>
      prevItems.map((item, index) => {
        return { ...item, status: index < step ? 'completed' : item.status }
      })
    )
  }, [step])

  useEffect(() => {
    fetchData(
      'http://localhost:3000/stream',
      // 'model/local/deploy',
      {
        method: 'POST',
        eoBody: { recordId: record.id },
        custom: true,
        isStream: true,
        handleStream: (chunk) => {
          const parsedChunk = JSON.parse(chunk)
          // 下载中
          if (parsedChunk?.data?.state.includes('download')) {
            setStepItem((prevItems) =>
              prevItems.map((item) => {
                return item.title === 'Download'
                  ? {
                      ...item,
                      description: `${parsedChunk?.data?.info?.current} / ${parsedChunk?.data?.info?.total}`,
                      status: 'inProgress'
                    }
                  : item
              })
            )
            setStep(0)
            // 部署中
          } else if (parsedChunk?.data?.state.includes('deploy')) {
            setStepItem((prevItems) =>
              prevItems.map((item) => {
                return { ...item, status: item.title === 'Deploy' ? 'inProgress' : item.status }
              })
            )
            setStep(1)
            // 初始化中
          } else if (parsedChunk?.data?.state.includes('initializing')) {
            setStepItem((prevItems) =>
              prevItems.map((item) => {
                return { ...item, status: item.title === 'Initializing' ? 'inProgress' : item.status }
              })
            )
            setStep(2)
            // 完成
          } else if (parsedChunk?.data?.state.includes('finish')) {
            setStepItem((prevItems) =>
              prevItems.map((item) => {
                return { ...item, status: item.title === 'Initializing' ? 'completed' : item.status }
              })
            )
            setStep(4)
          }
          setScriptStr(parsedChunk?.data?.message || '')
        }
      }
    )
  }, [])

  return (
    <>
      <div className="flex justify-center items-center mb-[20px] mt-[20px] custom-steps">
        <Steps labelPlacement="vertical">
          {stepItem.map((item, index) => (
            <Steps.Step
              key={index}
              title={item.title}
              icon={getIcon(item.status || '')}
              description={item.description}
            />
          ))}
        </Steps>
      </div>
      <Collapse
        expandIconPosition="end"
        defaultActiveKey={['1']}
        className="[&_.ant-collapse-content-box]:p-[0px]"
        items={[
          {
            label: collapseText,
            key: '1',
            children: (
              <Codebox
                editorTheme="vs-dark"
                readOnly={true}
                autoScrollToEnd={true}
                options={{
                  wordWrap: 'off'
                }}
                width="100%"
                value={scriptStr}
                height="200px"
                language="json"
                enableToolbar={false}
              />
            )
          }
        ]}
      ></Collapse>
    </>
  )
}
