import { LoadingOutlined } from '@ant-design/icons'
import EditableTableWithModal from '@common/components/aoplatform/EditableTableWithModal.tsx'
import InsidePage from '@common/components/aoplatform/InsidePage.tsx'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const.tsx'
import { MatchItem, RouterParams } from '@common/const/type.ts'
import { useGlobalContext } from '@common/contexts/GlobalStateContext.tsx'
import { useFetch } from '@common/hooks/http.ts'
import { $t } from '@common/locales/index.ts'
import { validateUrlSlash } from '@common/utils/validate.ts'
import { useSystemContext } from '@core/contexts/SystemContext.tsx'
import SystemInsideApiProxy from '@core/pages/system/api/SystemInsideApiProxy.tsx'
import { App, Button, Col, Form, Input, Row, Select, Space, Spin, Switch } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  API_PATH_MATCH_RULES,
  API_PROTOCOL,
  HTTP_METHOD,
  MATCH_CONFIG,
  MatchPositionEnum,
  MatchTypeEnum
} from '../../../const/system/const.tsx'
import {
  SystemApiProxyFieldType,
  SystemInsideApiProxyHandle,
  SystemInsideRouterCreateHandle,
  SystemInsideRouterCreateProps
} from '../../../const/system/type.ts'

const SystemInsideRouterCreate = forwardRef<SystemInsideRouterCreateHandle, SystemInsideRouterCreateProps>(
  (props, ref) => {
    const { message } = App.useApp()
    const { serviceId, teamId, routeId } = useParams<RouterParams>()
    const [form] = Form.useForm()
    const { fetchData } = useFetch()
    const [loading, setLoading] = useState<boolean>(false)
    const proxyRef = useRef<SystemInsideApiProxyHandle>(null)
    const { state } = useGlobalContext()
    const { apiPrefix, prefixForce } = useSystemContext()
    const navigator = useNavigate()

    const onFinish = () => {
      return Promise.all([proxyRef.current?.validate?.(), form.validateFields()]).then(([, formValue]) => {
        const body = {
          ...formValue,
          path: `${prefixForce ? apiPrefix + (!formValue.path?.trim() ? '': '/') : ''}${(formValue.path?.trim() || '')}${formValue.pathMatch === 'prefix' ? '/*' : ''}`,
          proxy: {
            ...formValue.proxy,
            path: formValue.proxy.path
              ? formValue.proxy.path.startsWith('/')
                ? formValue.proxy.path
                : '/' + formValue.proxy.path
              : undefined
          }
        }
        return fetchData<BasicResponse<null>>('service/router', {
          method: routeId ? 'PUT' : 'POST',
          eoBody: body,
          eoParams: { service: serviceId, team: teamId, router: routeId },
          eoTransformKeys: ['matchType', 'disable']
        })
          .then((response) => {
            const { code, msg } = response
            if (code === STATUS_CODE.SUCCESS) {
              message.success(msg || $t(RESPONSE_TIPS.success))
              navigator(`/service/${teamId}/inside/${serviceId}/route`)
              return Promise.resolve(true)
            } else {
              message.error(msg || $t(RESPONSE_TIPS.error))
              return Promise.reject(msg || $t(RESPONSE_TIPS.error))
            }
          })
          .catch((errInfo) => Promise.reject(errInfo))
      })
    }

    const copy: () => Promise<boolean | string> = () => {
      return new Promise((resolve, reject) => {
        return form
          .validateFields()
          .then((value) => {
            fetchData<BasicResponse<{ api: SystemApiProxyFieldType }>>('service/api/copy', {
              method: 'POST',
              eoParams: { service: serviceId, team: teamId, api: routeId },
              eoBody: { ...value, path: value.path.trim() }
            })
              .then((response) => {
                const { code, data, msg } = response
                if (code === STATUS_CODE.SUCCESS) {
                  message.success(msg || $t(RESPONSE_TIPS.success))
                  return resolve(data.api.id)
                } else {
                  message.error(msg || $t(RESPONSE_TIPS.error))
                  return reject(msg || $t(RESPONSE_TIPS.error))
                }
              })
              .catch((errorInfo) => reject(errorInfo))
          })
          .catch((errorInfo) => reject(errorInfo))
      })
    }

    useImperativeHandle(ref, () => ({
      copy,
      save: onFinish
    }))

    const getRouterConfig = () => {
      setLoading(true)
      fetchData<BasicResponse<{ router: SystemApiProxyFieldType }>>('service/router/detail', {
        method: 'GET',
        eoParams: { service: serviceId, team: teamId, router: routeId },
        eoTransformKeys: ['create_time', 'update_time', 'match_type', 'upstream_id', 'opt_type']
      })
        .then((response) => {
          const { code, data, msg } = response
          if (code === STATUS_CODE.SUCCESS) {
            const { disable, protocols, path, name, methods, description, match, proxy } = data.router
            let newPath = path
            let pathMatch = 'full'
            if (prefixForce && path?.startsWith(apiPrefix + '/')) {
              newPath = path.slice((apiPrefix?.length || 0) + 1)
            }
            if (newPath.endsWith('/*')) {
              newPath = newPath.slice(0, -2)
              pathMatch = 'prefix'
            }
            form.setFieldsValue({
              disable,
              protocols,
              name,
              path: newPath,
              pathMatch,
              methods,
              description,
              match,
              proxy
            })
          } else {
            message.error(msg || $t(RESPONSE_TIPS.error))
          }
        })
        .catch((errorInfo) => console.error(errorInfo))
        .finally(() => setLoading(false))
    }

    useEffect(() => {
      if (routeId) {
        getRouterConfig()
      } else {
        form.setFieldValue('prefix', apiPrefix)
        form.setFieldValue(['proxy', 'timeout'], 10000)
        form.setFieldValue(['proxy', 'retry'], 0)
        form.setFieldValue('protocols', ['HTTP', 'HTTPS'])
        form.setFieldValue('pathMatch', 'prefix')
      }
      return form.setFieldsValue({})
    }, [])

    const translatedMatchConfig = useMemo(() => {
      return MATCH_CONFIG.map((item) => {
        if (item.key === 'position') {
          return {
            ...item,
            component: (
              <Select
                showSearch
                optionFilterProp="label"
                className="w-INPUT_NORMAL"
                options={Object.entries(MatchPositionEnum)?.map(([key, value]) => {
                  return { label: $t(value), value: key }
                })}
              />
            )
          }
        }
        if (item.key === 'matchType') {
          return {
            ...item,
            component: (
              <Select
                showSearch
                optionFilterProp="label"
                className="w-INPUT_NORMAL"
                options={Object.entries(MatchTypeEnum)?.map(([key, value]) => {
                  return { label: $t(value), value: key }
                })}
              />
            )
          }
        }
        return { ...item }
      })
    }, [state.language])

    const apiPathMatchRulesOptions = useMemo(
      () => API_PATH_MATCH_RULES.map((x) => ({ label: $t(x.label), value: x.value })),
      [state.language]
    )

    return (
      <InsidePage
        pageTitle={$t('API 路由设置') || '-'}
        showBorder={false}
        scrollPage={false}
        className="overflow-y-auto"
        backUrl={`/service/${teamId}/inside/${serviceId}/route`}
        customBtn={
          <div className="flex items-center gap-btnbase">
            <Button type="primary" onClick={onFinish}>
              {$t('保存')}
            </Button>
          </div>
        }
      >
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading} className="">
          <Form
            layout="vertical"
            labelAlign="left"
            scrollToFirstError
            form={form}
            className="flex flex-col mx-auto h-full"
            name="SystemInsideRouterCreate"
            onFinish={onFinish}
            autoComplete="off"
          >
            <div className="">
              <Row className="mb-btnybase">
                {' '}
                <Col>
                  <span className="font-bold mr-[13px]">{$t('API 基础信息')}</span>
                </Col>
              </Row>
              <Form.Item<SystemApiProxyFieldType>
                label={$t('拦截该接口的请求')}
                name="disable"
                extra={$t('开启拦截后，网关会拦截所有该路径的请求，相当于防火墙禁用了特定路径的访问。')}
              >
                <Switch />
              </Form.Item>
              <Form.Item<SystemApiProxyFieldType>
                className="flex-1"
                label={$t('路由名称')}
                name="name"
                rules={[{ required: true, whitespace: true }]}
              >
                <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
              </Form.Item>

              <Form.Item<SystemApiProxyFieldType> label={$t('请求协议')} name="protocols" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  className="w-INPUT_NORMAL"
                  placeholder={$t(PLACEHOLDER.select)}
                  mode="multiple"
                  options={API_PROTOCOL}
                ></Select>
              </Form.Item>
              <Form.Item label={$t('请求路径')}>
                <Space.Compact block>
                  <Form.Item
                    name="pathMatch"
                    rules={[
                      { required: true, whitespace: true },
                      {
                        validator: validateUrlSlash
                      }
                    ]}
                    noStyle
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      placeholder={$t(PLACEHOLDER.select)}
                      options={apiPathMatchRulesOptions}
                      className="w-[30%] min-w-[100px]"
                    />
                  </Form.Item>
                  <Form.Item<SystemApiProxyFieldType>
                    name="path"
                    dependencies={['pathMatch']}
                    rules={[
                      ({ getFieldValue }) => ({
                        required: getFieldValue('pathMatch') !== 'prefix',
                        whitespace: true
                      }),
                      {
                        validator: validateUrlSlash
                      }
                    ]}
                    noStyle
                  >
                    <Input
                      prefix={prefixForce ? `${apiPrefix}/` : '/'}
                      className="w-INPUT_NORMAL"
                      placeholder={$t(PLACEHOLDER.input)}
                      onChange={(e) => {
                        if ((e.target.value as string).endsWith('/*')) {
                          form.setFieldValue('path', e.target.value.slice(0, -2))
                          form.setFieldValue('pathMatch', 'prefix')
                        }
                      }}
                    />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>

              <Form.Item<SystemApiProxyFieldType> label={$t('请求方式')} name="methods" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  className="w-INPUT_NORMAL"
                  placeholder={$t(PLACEHOLDER.select)}
                  mode="multiple"
                  options={HTTP_METHOD.map((method: string) => {
                    return { label: method, value: method }
                  })}
                ></Select>
              </Form.Item>

              <Form.Item<SystemApiProxyFieldType> label={$t('描述')} name="description">
                <Input.TextArea className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
              </Form.Item>

              <Form.Item<SystemApiProxyFieldType> label={$t('高级匹配')} name="match">
                <EditableTableWithModal<MatchItem & { _id: string }> configFields={translatedMatchConfig} />
              </Form.Item>

              <Row className="mb-btnybase mt-[40px]">
                <Col>
                  <span className="font-bold mr-[13px]">{$t('转发规则设置')} </span>
                </Col>
              </Row>
              <Form.Item<SystemApiProxyFieldType> className="p-0 mb-0 bg-transparent border-none" name="proxy">
                <SystemInsideApiProxy type={routeId ? 'edit' : 'add'} ref={proxyRef} />
              </Form.Item>
            </div>
          </Form>
        </Spin>
      </InsidePage>
    )
  }
)
export default SystemInsideRouterCreate
