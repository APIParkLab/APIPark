import { SystemTableListItem } from '@core/const/system/type'
import { App, Steps } from 'antd'
import { CheckCircleOutlined, LoadingOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Codebox } from '@common/components/postcat/api/Codebox'
import { Collapse } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { $t } from '@common/locales/index.ts'
import { useFetch } from '@common/hooks/http'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'

export const ServiceDeployment = (props: { record: SystemTableListItem, closeModal?: () => void, updateFooter?: () => void, cancelCb?: (cancel: () => void) => void }) => {
  const { record, closeModal, updateFooter, cancelCb } = props
  const { message } = App.useApp()
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

  /**
   * 根据状态获取当前步骤
   * @param currentState 当前状态
   * @returns 
   */
  const getCurrentStep = (currentState?: string) => {
    switch (currentState) {
      case 'download':
      case 'download_error':
        return 0
      case 'deploy':
      case 'deploy_error':
        return 1
      case 'initializing':
      case 'initializing_error':
        return 2
      default:
        return 0
    }
  }

  /**
   * 更新步骤
   * @param targetStep 目标步骤
   * @param description 描述
   * @param currentState 当前状态
   */
  const updateStepItems = (targetStep: number, description = '', currentState?: string) => {
    setStepItem((prevItems) =>
      prevItems.map((item, index) => ({
        ...item,
        description: item.id === 'download' ? description : item.description,
        status: index < targetStep ? 'completed' : index === targetStep ? currentState && currentState.includes('error') ? 'error' : 'inProgress' : 'pending',
      }))
    );
    step.current = targetStep;
  };

  /**
   * 获取本地模型状态
   * @returns 
   */
  const getLocalModelState = () => {
    fetchData<BasicResponse<any>>('model/local/state', {
      method: 'GET',
      eoParams: {
        model: record.id
      }
    })
      .then((response) => {
        if (response.code === STATUS_CODE.SUCCESS) {
          updateStepItems(getCurrentStep(response.data?.state), `${response.data?.info?.current} / ${response.data?.info?.total}`, response.data?.state)
          setScriptStr(response?.data?.info?.last_message || '')
        } else {
          message.error(response.msg || RESPONSE_TIPS.error)
        }
      })
      .catch((error) => {
        message.error(RESPONSE_TIPS.error)
      })
  }
  useEffect(() => {
    if (['deploying_error', 'error'].includes(record.state)) {
      getLocalModelState()
    } else {
      fetchData(
        'model/local/deploy',
        {
          method: 'POST',
          eoBody: { model: record.id, team: record.team?.id },
          isStream: true,
          callback: (cancel: () => void) => {
            cancelCb?.(cancel)
          },
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
              }, 500)
            } else if (parsedChunk?.data?.state.includes('error')) {
              updateFooter?.()
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
    }
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
