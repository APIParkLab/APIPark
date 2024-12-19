import { App, Col, Form, Input, Row } from 'antd'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { SubscribeApprovalInfoType } from '@common/const/approval/type.tsx'
import { BasicResponse, FORM_ERROR_TIPS, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const.tsx'
import { useFetch } from '@common/hooks/http.ts'
import WithPermission from '@common/components/aoplatform/WithPermission.tsx'
import { SubscribeApprovalList } from '@common/const/approval/const'
import { $t } from '@common/locales'

type SubscribeApprovalModalProps = {
  type: 'approval' | 'view'
  data?: SubscribeApprovalInfoType
  inSystem?: boolean
  serviceId: string
  teamId: string
}

export type SubscribeApprovalModalHandle = {
  save: (operate: 'pass' | 'refuse') => Promise<boolean | string>
}

type FieldType = {
  reason?: string
  opinion?: string
}

export const SubscribeApprovalModalContent = forwardRef<SubscribeApprovalModalHandle, SubscribeApprovalModalProps>(
  (props, ref) => {
    const { message } = App.useApp()
    const { data, type, inSystem = false, teamId, serviceId } = props
    const [form] = Form.useForm()
    const { fetchData } = useFetch()

    const save: (operate: 'pass' | 'refuse') => Promise<boolean | string> = (operate) => {
      return new Promise((resolve, reject) => {
        if (type === 'view') {
          resolve(true)
          return
        }
        form
          .validateFields()
          .then((value) => {
            if (operate === 'refuse' && form.getFieldValue('opinion') === '') {
              form.setFields([
                {
                  name: 'opinion',
                  errors: [$t(FORM_ERROR_TIPS.refuseOpinion)]
                }
              ])
              form.scrollToField('opinion')
              reject($t(RESPONSE_TIPS.refuseOpinion))
              return
            }
            fetchData<BasicResponse<null>>(`${inSystem ? 'service/' : ''}approval/subscribe`, {
              method: 'POST',
              eoBody: { opinion: value.opinion, operate },
              eoParams: inSystem ? { apply: data!.id, team: teamId } : { id: data!.id, team: teamId }
            })
              .then((response) => {
                const { code, msg } = response
                if (code === STATUS_CODE.SUCCESS) {
                  message.success(msg || $t(RESPONSE_TIPS.success))
                  resolve(true)
                } else {
                  message.error(msg || $t(RESPONSE_TIPS.error))
                  reject(msg || $t(RESPONSE_TIPS.error))
                }
              })
              .catch((errorInfo) => reject(errorInfo))
          })
          .catch((errorInfo) => reject(errorInfo))
      })
    }

    useImperativeHandle(ref, () => ({
      save
    }))

    useEffect(() => {
      form.setFieldsValue({ opinion: '', ...data })
    }, [])

    return (
      <div className="my-btnybase">
        {SubscribeApprovalList?.map((x) => (
          <Row key={x.key} className="leading-[32px] mb-btnbase mx-auto">
            <Col className="text-left" span={6}>
              {$t(x.title)}：
            </Col>
            <Col>
              {(data as { [k: string]: unknown })?.[x.key]?.name || (data as { [k: string]: unknown })?.[x.key] || '-'}
            </Col>
          </Row>
        ))}
        <WithPermission access="">
          <Form
            labelAlign="left"
            layout="vertical"
            form={form}
            className="mx-auto "
            name="subscribeApprovalModalContent"
            // labelCol={{ span: 6}}
            // wrapperCol={{ span: 18}}
            autoComplete="off"
            disabled={type === 'view'}
          >
            <Form.Item<FieldType> label={$t('申请原因')} name="reason">
              <Input.TextArea className="w-INPUT_NORMAL" disabled={true} placeholder=" " />
            </Form.Item>
            <Form.Item<FieldType> label={$t('审核意见')} name="opinion" extra={$t(FORM_ERROR_TIPS.refuseOpinion)}>
              <Input.TextArea
                className="w-INPUT_NORMAL"
                placeholder={$t(PLACEHOLDER.input)}
                onChange={() => {
                  form.setFields([
                    {
                      name: 'opinion',
                      errors: [] // 设置为空数组来移除错误信息
                    }
                  ])
                }}
              />
            </Form.Item>
          </Form>
        </WithPermission>
      </div>
    )
  }
)
