
import  {forwardRef, useEffect, useState} from "react";
import { Button, Empty, Spin, Upload, message} from "antd";
import {BasicResponse, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { SystemApiDetail, SystemInsideApiDocumentHandle, SystemInsideApiDocumentProps } from "../../../const/system/type.ts";
import { LoadingOutlined } from "@ant-design/icons";
import EmptySVG from '@common/assets/empty.svg'
import { $t } from "@common/locales/index.ts";
import ApiDocument from '@common/components/aoplatform/ApiDocument.tsx'
import { Codebox } from "@common/components/postcat/api/Codebox/index.tsx";
import { useParams } from "react-router-dom";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes.tsx";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";

const SystemInsideApiDocument = forwardRef<SystemInsideApiDocumentHandle,SystemInsideApiDocumentProps>((props, ref) => {
    const {serviceId, teamId} = useParams<RouterParams>()
    const {fetchData} = useFetch()
    const [apiDetail, setApiDetail] = useState<SystemApiDetail>()
    const [loading, setLoading] = useState<boolean>(false)
    const [showEditor, setShowEditor] = useState<boolean>(false)
    useEffect(() => {
        getApiDetail()
    }, []);

    const getApiDetail = ()=>{
        setLoading(true)
        fetchData<BasicResponse<{doc:SystemApiDetail}>>('service/api_doc',{method:'GET',eoParams:{service:serviceId,team:teamId },eoTransformKeys:['update_time']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setApiDetail(data.doc?.content)
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        }).finally(()=>{setLoading(false)})
    }

    

    const UploadBtn = ({type, updated}:{type:'new'|'edit', updated:()=>void})=>{
        const {fetchData} = useFetch()

        const uploadFile = (file:File)=>{
            const body = new FormData()
            body.append('doc',file)
            fetchData<BasicResponse<{doc:SystemApiDetail}>>('service/api_doc/upload',{method:'POST',body:body,eoParams:{service:serviceId,team:teamId },eoTransformKeys:['update_time']}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    updated?.()
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                }
            }).finally(()=>{setLoading(false)})

        }
        return (
        <WithPermission access="team.service.api_doc.edit">
                <Upload name='file'  accept=".json,.yaml" maxCount={1} showUploadList={false} beforeUpload={(file)=>{
                    uploadFile(file)
                    return false;  
                }}>
                <Button type="primary">{$t(type === 'new' ? '上传 OpenAPI 文档 (.json/.yaml)' :'替换 OpenAPI 文档 (.json/.yaml)')}</Button>
            </Upload>
        </WithPermission>
        )
    }

    const ApiEdit = ({spec,updated}:{spec?:string|object,updated:()=>void})=>{
        const [code, setCode] = useState<string>('')
        const [saveLoading, setSaveLoading] = useState<boolean>(false)
        useEffect(()=>{
            try{
                setCode(typeof spec === 'string' ? spec:JSON.stringify(spec) )
            }catch(e){
                console.warn('文档解析失败',e)
            }
        },[spec])

        const saveCode = ()=>{
            setSaveLoading(true)
            fetchData<BasicResponse<{doc:SystemApiDetail}>>('service/api_doc',{method:'PUT',eoBody:{content:code},eoParams:{service:serviceId,team:teamId },eoTransformKeys:['update_time']}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    updated?.()
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                }
            }).finally(()=>{setSaveLoading(false)})
        }

        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center gap-btnbase justify-end mr-PAGE_INSIDE_X pr-btnbase pb-btnbase">
                    <UploadBtn type="edit" updated={updated}/>
                    <WithPermission access="team.service.api_doc.edit">
                        <Button type="primary" loading={saveLoading} onClick={()=>saveCode()}>{$t('保存')}</Button>
                    </WithPermission>
                </div>
                <div className="flex-1 flex items-center pr-PAGE_INSIDE_X overflow-hidden gap-btnbase">
                    <div className="flex-1 h-full">
                        <Codebox enableToolbar={false} width="100%" height="100%" editorTheme="vs-dark" language='yaml' value={code} onChange={setCode}/>
                    </div>
                    <div className="flex-1  h-full overflow-auto" >{
                        !code ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : <ApiDocument spec={code}/>}</div>
                </div>
            </div>)
    }

    const ApiPreview = ({setShowEditor,spec,updated}:{setShowEditor:(show:boolean)=>void,spec?:string | object, updated:()=>void})=>{
        return (<div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center gap-btnbase justify-end pb-btnbase pr-btnbase mr-PAGE_INSIDE_X">
                <UploadBtn type="edit" updated={updated}/>
                <WithPermission access="team.service.api_doc.edit">
                    <Button type="primary" onClick={()=>setShowEditor(true)}>{$t('打开 OpenAPI YAML 编辑器')}</Button>
                </WithPermission>
            </div>
            <div className="flex-1 overflow-auto pr-PAGE_INSIDE_X">
            <ApiDocument spec={spec}/>
            </div>
        </div>
        )
    }

    const updated = ()=>{
        getApiDetail(); setShowEditor(false)
    }

    return (<>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading} wrapperClassName=' h-full overflow-hidden '>
            <div className=" h-full">
               {!showEditor && apiDetail && <ApiPreview setShowEditor={setShowEditor} spec={apiDetail} updated={updated}/>}
                
                {showEditor && <ApiEdit updated={updated} spec={apiDetail}/>}
                {!showEditor && !apiDetail && <Empty image={EmptySVG} >
                    <div className="flex items-center gap-btnbase justify-center">
                        <UploadBtn type="new" updated={updated}/>
                        <WithPermission access="team.service.api_doc.edit">
                            <Button type="primary" onClick={()=>setShowEditor(true)}>{$t('打开 OpenAPI YAML 编辑器')}</Button>
                        </WithPermission>
                    </div>
                </Empty>}
            </div>
        </Spin>
    </>)
})

export default SystemInsideApiDocument