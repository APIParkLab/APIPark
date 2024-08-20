import {useCallback, useEffect, useState} from "react";
import Search from "antd/es/input/Search";
import {Button, Space, Tooltip} from "antd";
import CodeSnippetCompo from "@common/components/apispace/code-snippet";
import {ApiDetail} from "@common/const/api-detail";
import {flattenTree} from "@common/utils/postcat.tsx";
import MessageBodyComponent, {RenderMessageBody} from "./api/ApiPreview/components/MessageBody";
import HeaderFields from "./api/ApiPreview/components/HeaderFields";
import {ResponseExampleCompo} from "@common/components/apispace/response-example";
import {MoreSetting} from "./api/MoreSetting";
import {
    useMoreSettingHiddenConfig
} from "./api/ApiManager/components/MessageDataGrid/hooks/useMoreSettingHiddenConfig.ts";
import {MessageType} from "./api/ApiManager/components/MessageDataGrid";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { ThemeProvider } from "@mui/material";
import { theme } from "./ApiEdit.tsx";
import { $t } from "@common/locales/index.ts";

export const SearchBtn = ({entity}:{entity:unknown})=>{
    return (
        <Tooltip >
            <span className="text-disabled">{$t('测试 API')}</span>
        </Tooltip>
    )
}

export default function ApiPreview(props:{testClick?:()=>void, entity:ApiDetail}){
    const {testClick,entity} = props
    const {requestParams,responseList,resultList} = entity
    const [requestBodyList, setRequestBodyList] = useState<RenderMessageBody[]>([])
    const [responseBodyList, setResponseBodyList] = useState<RenderMessageBody[]>([])
    const [currentMoreSettingParam, setCurrentMoreSettingParam] = useState<RenderMessageBody | null>(null)

    // const responseData = responseList?.[0]
    // const responseParams = responseData?.responseParams?.headerParams

    useEffect(() => {
        // setTimeout(()=>{
        //     const element = document.querySelectorAll('.MuiDataGrid-main');
        //     if(element?.length > 0){
        //         for(const x of element){
        //             x.childNodes[x.childNodes.length - 1 ].textContent === 'MUI X Missing license key' ?  x.childNodes[x.childNodes.length - 1 ].textContent = '' :null
        //         }
        //     }
        // },500)


        setRequestBodyList(
            flattenTree(requestParams?.bodyParams || [], 'childList', 'name') as unknown as RenderMessageBody[]
        )
        setResponseBodyList(
            flattenTree(
                responseList?.[0]?.responseParams?.bodyParams || [],
                'childList',
                'name'
            ) as unknown as RenderMessageBody[]
        )
    }, [requestParams,responseList,resultList]);


    const handleCloseMoreSetting = useCallback(() => {
        setCurrentMoreSettingParam(null)
    }, [])


    const moreSettingHiddenConfig = useMoreSettingHiddenConfig({
        param: currentMoreSettingParam as unknown as RenderMessageBody,
        // TODO:
        messageType: 'Header' as MessageType,
        readOnly: true
    })

    const handleTest = () => {
        // testClick && testClick()
    };

    return (<>
        <ThemeProvider theme={theme}>

        {testClick &&
        <Space direction="vertical" className="mb-btnybase w-full mt-btnybase">
            <Search
                readOnly
                addonBefore={entity?.method}
                value={entity?.uri}
                // enterButton={<SearchBtn  entity={entity}/>}
                onSearch={handleTest}
            />
        </Space>}

        {
            requestParams?.headerParams?.length > 0 &&
            <HeaderFields title={$t('请求 Header')} rows={requestParams?.headerParams}
                          onMoreSettingChange={setCurrentMoreSettingParam}  />
        }

        {requestBodyList?.length > 0 &&
            <MessageBodyComponent
                title={$t("请求 Body")}
                rows={requestBodyList}
                contentType={requestParams?.bodyParams[0]?.contentType}
                onMoreSettingChange={setCurrentMoreSettingParam}
            />
        }

        {
            requestParams?.queryParams?.length > 0 &&
            <HeaderFields title={$t('Query 参数')} rows={requestParams?.queryParams}
                          onMoreSettingChange={setCurrentMoreSettingParam}  />
        }

        {
            requestParams?.restParams?.length > 0 &&
            <HeaderFields title={$t('Rest 参数')} rows={requestParams?.restParams}
                          onMoreSettingChange={setCurrentMoreSettingParam}/>
        }

        {/*<h3 className="text-lg mb-btnybase font-normal flex items-center">请求示例代码</h3>*/}
        <CodeSnippetCompo
            title={$t('请求示例代码')}
            api={entity}
            extraContent={ testClick ? <div className="ml-5">
                <Tooltip >
                <WithPermission access="" > 
                    <Button type='primary' onClick={handleTest}    size='small' className='w-[114px]'>{$t('测试 API')}</Button>
                </WithPermission>
                </Tooltip>
            </div> : undefined }
        />

        {resultList?.length > 0 && <ResponseExampleCompo title={$t('响应示例')} detail={resultList}/>}

        {
            responseList?.[0]?.responseParams?.headerParams?.length > 0 &&
            <HeaderFields title={$t('响应 Header')} rows={ responseList?.[0]?.responseParams?.headerParams}
                          onMoreSettingChange={setCurrentMoreSettingParam} />
        }

        {responseBodyList?.length > 0 &&
            <MessageBodyComponent
                title={$t("响应 Body")}
                rows={responseBodyList}
                contentType={responseList?.[0]?.contentType}
                onMoreSettingChange={setCurrentMoreSettingParam}
            />
        }

        <MoreSetting
            readOnly={true}
            open={Boolean(currentMoreSettingParam)}
            onClose={handleCloseMoreSetting}
            hiddenConfig={moreSettingHiddenConfig}
            param={currentMoreSettingParam as unknown as RenderMessageBody}
        />
        </ThemeProvider>
    </>)
}

