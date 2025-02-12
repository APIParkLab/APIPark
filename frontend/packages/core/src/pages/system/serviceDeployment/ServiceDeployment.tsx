import { SystemTableListItem } from '@core/const/system/type'
import { Steps } from 'antd'
import { CheckCircleOutlined, LoadingOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Codebox } from '@common/components/postcat/api/Codebox'
import { Collapse } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { $t } from '@common/locales/index.ts'
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

export const ServiceDeployment = (props: { record: SystemTableListItem, closeModal?: () => void }) => {
  const { record, closeModal } = props

  const [stepItem, setStepItem] = useState<
    {
      id: string
      title: string
      description?: string
      status?: string
    }[]
  >([
    {
      id: 'download',
      title: $t('下载'),
      status: 'pending'
    },
    {
      id: 'deploy',
      title: $t('部署'),
      status: 'pending'
    },
    {
      id: 'initializing',
      title: $t('初始化'),
      status: 'pending'
    }
  ])

  const [scriptStr, setScriptStr] = useState('')
  const step = useRef(0)
  const [collapseText] = useState('Progress log')
  const { fetchData } = useFetch()

  const updateStepItems = (targetStep: number, description = '') => {
    setStepItem((prevItems) =>
      prevItems.map((item, index) => ({
        ...item,
        description: item.id === 'download' ? description : item.description,
        status: index < targetStep ? 'completed' : index === targetStep ? 'inProgress' : 'pending',
      }))
    );
    step.current = targetStep;
  };
  useEffect(() => {
    fetchData(
      'model/local/deploy',
      {
        method: 'POST',
        eoBody: { recordId: record.id },
        headers: {
          'Content-Type': 'event-stream'
        },
        isStream: true,
        handleStream: (chunk) => {
          const parsedChunk = JSON.parse(chunk)
          // 下载中
          if (parsedChunk?.data?.state.includes('download')) {
            updateStepItems(0, `${parsedChunk?.data?.info?.current} / ${parsedChunk?.data?.info?.total}`);
            // 部署中
          } else if (parsedChunk?.data?.state.includes('deploy')) {
            updateStepItems(1);
            // 初始化中
          } else if (parsedChunk?.data?.state.includes('initializing')) {
            updateStepItems(2);
            // 完成
          } else if (parsedChunk?.data?.state.includes('finish')) {
            updateStepItems(4);
            setTimeout(() => {
              closeModal?.()
            }, 200)
          } else if (parsedChunk?.data?.state.includes('error')) {
            setStepItem((prevItems) =>
              prevItems.map((item, index) => {
                return { ...item, status: index === step.current ? 'error' : item.status }
              })
            )
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
