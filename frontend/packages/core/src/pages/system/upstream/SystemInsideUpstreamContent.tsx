
import { App, Button, Divider, Form, Input, InputNumber, Radio, Select, Spin } from "antd";
import  {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { GlobalNodeItem, ProxyHeaderItem, ServiceUpstreamFieldType, SystemInsideUpstreamConfigHandle, SystemInsideUpstreamContentHandle } from "../../../const/system/type.ts";
import { FormItemProps } from "antd/es/form/index";
import EditableTable from "@common/components/aoplatform/EditableTable.tsx";
import EditableTableWithModal from "@common/components/aoplatform/EditableTableWithModal.tsx";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { typeOptions, SYSTEM_UPSTREAM_GLOBAL_CONFIG_TABLE_COLUMNS, schemeOptions, balanceOptions, passHostOptions, PROXY_HEADER_CONFIG } from "../../../const/system/const.tsx";
import { Link, useParams } from "react-router-dom";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes.tsx";
import { BasicResponse, STATUS_CODE } from "@common/const/const.ts";
import { useFetch } from "@common/hooks/http.ts";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext.tsx";

const DEFAULT_FORM_VALUE = {
    driver:'static',
    scheme:'HTTP',
    balance:'round-robin',
    limitPeerSecond:10000,
    retry:3,
    timeout:10000,
}

const SystemInsideUpstreamContent= forwardRef<SystemInsideUpstreamContentHandle>((props,ref) => {
    const formRef = useRef<SystemInsideUpstreamConfigHandle>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const { message } = App.useApp()
    const { serviceId, teamId} = useParams<RouterParams>();
    const {fetchData} = useFetch()
    const [, forceUpdate] = useState<unknown>(null);
    const [formShowHost, setFormShowHost] =  useState<boolean>(false);
    const { setBreadcrumb } = useBreadcrumb()
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
        save:()=>formRef.current?.save()
    }));


    const saveUpstream = ()=>{
        form.validateFields().then((value)=>{
            if(value.nodes){
                value.nodes = value.nodes.filter((x:GlobalNodeItem)=>x.address)?.map((x:GlobalNodeItem)=>({address:x.address, weight:x.weight ?? 100}))
            }
            value.limitPeerSecond = Number(value.limitPeerSecond)||0,
            value.retry = Number(value.retry)||0,
            value.timeout = Number(value.timeout)||0

        return fetchData<BasicResponse<null>>(
            'service/upstream',
            {
                method:'PUT',
                eoBody:({...value}),
                eoParams:{service:serviceId,team:teamId},
                eoTransformKeys:['limitPeerSecond','proxyHeaders','optType','passHost','upstreamHost']
            }).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || '操作成功！')
                    return Promise.resolve(true)
                }else{
                    message.error(msg || '操作失败')
                    return Promise.reject(msg || '操作失败')
                }
            }).catch((errorInfo)=> {return Promise.reject(errorInfo)})
        })
    }

    // 获取表单默认值
    const getUpstreamInfo = () => {
            setLoading(true)
            fetchData<BasicResponse<{ upstream: ServiceUpstreamFieldType }>>('service/upstream',{method:'GET',eoParams:{service:serviceId,team:teamId},eoTransformKeys:['limit_peer_second','proxy_headers','opt_type','global_config','pass_host','upstream_host']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setTimeout(()=>{
                    form.setFieldsValue({...DEFAULT_FORM_VALUE,...data.upstream})
                    setFormShowHost(data.upstream.passHost === 'rewrite')
                },0)
            }else{
                message.error(msg || '操作失败')
            }
        }).finally(()=>{
            setLoading(false)
            forceUpdate({})
        })
    };

   // 自定义校验规则
const globalConfigNodesRule: FormItemProps['rules'] = [
    {
      validator: (_, value) => {
        if (!value || !Array.isArray(value)) {
            return Promise.resolve();
        }
        const filteredValue = value.filter((item) => item.address && item.weight!== '' && item.weight!== null);
        if (filteredValue.length > 0) {
          return Promise.resolve();
        } else {
          return Promise.reject(new Error('必填项'));
        }
      },
    },
  ];

    useEffect(() => {
        setBreadcrumb([
            {
                title: <Link to={`/service/list`}>服务</Link>
            },
            {
                title: '上游'
            }])

            getUpstreamInfo();
    }, [serviceId]);

    return (
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading}>
            <div className={`flex-1 h-full overflow-auto`} >
                        <WithPermission access={'team.service.upstream.edit'}>
                            <Form
                                layout='vertical'
                                labelAlign='left'
                                name="systemInsideUpstreamContent"
                                scrollToFirstError
                                className="mx-auto mb-[20px]  overflow-hidden"
                                autoComplete="off"
                                form={form}
                                onFinish={saveUpstream}
                                >

                                <Form.Item<ServiceUpstreamFieldType>
                                    label="上游类型"
                                    name="driver"
                                    rules={[{ required: true, message: '必填项' }]}
                                >
                                    <Radio.Group options={typeOptions} />
                                </Form.Item>


                                <Form.Item<ServiceUpstreamFieldType>
                                    label="服务地址"
                                    name="nodes"
                                    tooltip="后端默认使用的IP地址"
                                    rules={[{ required: true, message: '必填项' },
                                    ...globalConfigNodesRule]}
                                >
                                    <EditableTable<GlobalNodeItem & {_id:string}>
                                        configFields={SYSTEM_UPSTREAM_GLOBAL_CONFIG_TABLE_COLUMNS}
                                    />
                                </Form.Item>

                                <Form.Item<ServiceUpstreamFieldType>
                                    label="请求协议"
                                    name="scheme"
                                    rules={[{ required: true, message: '必填项' }]}
                                >
                                <Select className="w-INPUT_NORMAL" placeholder="请选择" options={schemeOptions}>
                                </Select>
                                </Form.Item>

                                <Form.Item<ServiceUpstreamFieldType>
                                    label="负载均衡"
                                    name="balance"
                                    rules={[{ required: true, message: '必填项' }]}
                                >
                                    <Radio.Group className="flex flex-col gap-[8px] mt-[5px]" options={balanceOptions} />
                                </Form.Item>

                                <Form.Item<ServiceUpstreamFieldType>
                                    label="转发 Host"
                                    name="passHost"
                                    rules={[{ required: true, message: '必填项' }]}
                                >
                                    <Select className="w-INPUT_NORMAL" placeholder="请选择" options={passHostOptions} onChange={(val)=>setFormShowHost(val === 'rewrite')}>
                                    </Select>
                                </Form.Item>

                                {formShowHost && <Form.Item<ServiceUpstreamFieldType>
                                    label="重写域名"
                                    name="upstreamHost"
                                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                                >
                                    <Input className="w-INPUT_NORMAL" placeholder="请输入上游名称"/>
                                </Form.Item>
                            }

                                <Divider />
                                
                                <Form.Item<ServiceUpstreamFieldType>
                                    label="超时时间"
                                    name="timeout"
                                    rules={[{ required: true, message: '必填项' }]}
                                >
                                    <InputNumber className="w-INPUT_NORMAL" min={1} addonAfter={<span className="whitespace-nowrap">ms</span> }/> 
                                </Form.Item>

                                <Form.Item<ServiceUpstreamFieldType>
                                    label="超时重试次数"
                                    name="retry"
                                    rules={[{ required: true, message: '必填项' }]}
                                >
                                    <InputNumber className="w-INPUT_NORMAL" min={1} addonAfter={<span>次</span>} /> 
                                </Form.Item>

                                <Form.Item<ServiceUpstreamFieldType>
                                    label="调用频率限制"
                                    name="limitPeerSecond"
                                    rules={[{ required: true, message: '必填项' }]}
                                >
                                    <InputNumber className="w-INPUT_NORMAL"  min={1} addonAfter={<span className="whitespace-nowrap">次/秒</span> } />
                                </Form.Item>

                                <Form.Item<ServiceUpstreamFieldType>
                                    label="转发上游请求头"
                                    name="proxyHeaders"
                                    className="mb-0"
                                >
                                    <EditableTableWithModal<ProxyHeaderItem & {_id:string}>
                                        configFields={PROXY_HEADER_CONFIG}
                                    />
                                </Form.Item>

                                <Form.Item
                                    className="border-none bg-transparent pt-btnrbase"
                                >
                                    <WithPermission access='team.service.upstream.edit'><Button type="primary" htmlType="submit" >
                                        保存
                                    </Button></WithPermission>
                                </Form.Item>
                            </Form>
                        </WithPermission>
            </div>
        </Spin>
    )
})

export default SystemInsideUpstreamContent