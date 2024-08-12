import { Box, Button, LinearProgress, Stack } from '@mui/material'
import { Allotment } from 'allotment'
import { memo, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import {HTTPMethod} from "./api/RequestMethod";
import {
    ApiBodyType,
    ApiDetail,
    BodyParamsType,
    HeaderParamsType,
    QueryParamsType, ResponseList, RestParamsType,
    TestApiBodyType
} from "@common/const/api-detail";
import {extractBraceContent, mapContentTypeToApiBodyType, syncUrlAndQuery} from "@common/utils/postcat.tsx";
import {generateRow} from "./api/ApiManager/components/MessageDataGrid/constants.ts";
import {RawParams} from "./api/ApiManager/components/ApiMessageBody";
import {ParseCurlResult} from "@common/utils/curl.ts";
import {ApiRequestTester, ApiRequestTesterApi} from "./api/ApiTest/components/ApiRequestTester";
import {TestResponse} from "@common/hooks/useTest.ts";
import {getDefaultApiInfo} from "./api/ApiManager/constants.ts";
import {UriInput} from "./api/ApiManager/components/UriInput";
import {TestControl} from "./api/ApiTest/components/TestControl";
const Tester = memo(ApiRequestTester)
import 'allotment/dist/style.css'
import {ApiResponse} from "./api/ApiTest/components/ApiResponse";

type SafeAny = unknown
export interface ApiTestApiRef {
    getTestMeta: () => SafeAny
}

export default function ApiTest({ apiRef, apiInfo,loaded = true}: { apiRef?: React.RefObject<ApiTestApiRef> ,apiInfo:ApiDetail,loaded?:boolean}) {
    const [uri, setUri] = useState<string>('')
    const [httpMethod, setHttpMethod] = useState<HTTPMethod>(HTTPMethod.POST)
    const [testResponse, setTestResponse] = useState<TestResponse | null>(null)
    // const { apiInfo, loaded } = useContext<Partial<ApiTabContextProps>>(ApiTabContext)
    const testerApiRef = useRef<ApiRequestTesterApi>(null)
    const [parent] = useAutoAnimate()
    // const testApiInfo:ApiDetail = apiInfo
    const [isLoading, setIsLoading] = useState<boolean>()
    const [cancel,setCancel] = useState<boolean>()



    // useEffect(() => {
    //     if (testApiInfo) {
    //         const data: SafeAny = testApiInfo
    //         const responseResult = {
    //             report: {
    //                 general: {
    //                     downloadRate: data.downloadRate,
    //                     downloadSize: data.downloadSize,
    //                     redirectTimes: data.redirectTimes,
    //                     time: data.time,
    //                     timingSummary: data.timingSummary
    //                 },
    //                 request: {
    //                     headers: testApiInfo.requestParams.headerParams?.map((item) => ({
    //                         value: item.paramAttr.example,
    //                         key: item.name
    //                     })),
    //                     requestType: data.request.contentType,
    //                     body: testApiInfo.requestParams.bodyParams,
    //                     uri: testApiInfo.uri
    //                 },
    //                 response: {
    //                     headers: data.headers.map((item: SafeAny) => ({ key: item.name, value: item.value })),
    //                     body: data.body,
    //                     contentType: data.contentType,
    //                     httpCode: data.statusCode,
    //                     responseType: data.responseType
    //                 }
    //             }
    //         } as unknown as TestResponse
    //         setTestResponse(responseResult)
    //         setHttpMethod(testApiInfo.method)
    //         testerApiRef.current?.updateHeaderDataGrid((testApiInfo.requestParams.headerParams as HeaderParamsType[]) || [])
    //         const apiBodyType: TestApiBodyType = testApiInfo.requestParams.bodyParams[0]?.contentType as TestApiBodyType
    //         const contentType = apiBodyType === ApiBodyType.Raw ? 'application/json' : 'application/x-www-form-urlencoded'
    //         testerApiRef.current?.updateRequestBody({
    //             apiBodyType,
    //             contentType: contentType,
    //             data:
    //                 apiBodyType === ApiBodyType.Raw
    //                     ? testApiInfo.requestParams.bodyParams?.[0]?.binaryRawData
    //                     : testApiInfo.requestParams.bodyParams
    //         })
    //         setTimeout(() => {
    //             setUri(testApiInfo.uri)
    //             testerApiRef.current?.updateQueryDataGrid([])
    //             testerApiRef.current?.updateRestDataGrid([])
    //         }, 0)
    //         // updateTestApiInfo(null)
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [testApiInfo])

    useEffect(() => {
        if (apiInfo && loaded) {
            setUri(apiInfo.uri)
            setHttpMethod(apiInfo.method)
            testerApiRef.current?.updateHeaderDataGrid((apiInfo.requestParams.headerParams as HeaderParamsType[]) || [])
            const apiBodyType: TestApiBodyType = apiInfo.requestParams?.bodyParams[0]?.contentType as TestApiBodyType
            const contentType = apiBodyType === ApiBodyType.Raw ? 'application/json' : 'application/x-www-form-urlencoded'
            testerApiRef.current?.updateRequestBody({
                apiBodyType,
                contentType: contentType,
                data:
                    apiBodyType === ApiBodyType.Raw
                        ? apiInfo.requestParams?.bodyParams?.[0]?.binaryRawData
                        : apiInfo.requestParams?.bodyParams
            })
        }
    }, [apiInfo, loaded])

    useImperativeHandle(apiRef, () => ({
        getTestMeta: () => {
            const {
                rest,
                query,
                headers,
                body,
            } = testerApiRef.current?.getEditMeta() || {}
            return {
                uri,
                restParams: rest || [],
                headersParams: (headers as HeaderParamsType[]) || [],
                bodyParams: (body?.data as BodyParamsType[]) || [],
                queryParams: query || [],
                method: httpMethod,
                requestType: body!.apiBodyType
            }
        }
    }))

    const handleTest = async () => {
        const { rest, headers, body} = testerApiRef.current?.getEditMeta() || {}
        // const response = await test(
        //     { apiId, workspaceId, projectId },
        //     {
        //         uri,
        //         restParams: rest || [],
        //         headersParams: (headers as HeaderParamsType[]) || [],
        //         bodyParams: (body?.data as BodyParamsType[]) || [],
        //         method: httpMethod,
        //         requestType: body!.apiBodyType
        //     }
        // )
        // const response = {data:{}}
        // if (response.data?.report?.request) {
        //     response.data.report.request.uri = uri
        // }
        // setTestResponse(response.data)
    }

    const handleQueryChange = useCallback((queryList: QueryParamsType[]) => {
        /** Can't use new URL due to potential non-standard URLs; reverting to pre-refactor code temporarily. */
        const result = syncUrlAndQuery(uri, queryList as SafeAny, {
            nowOperate: 'query',
            method: 'replace'
        })
        if (result?.url) {
            setUri(result.url)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleUriChange = (uri: string) => {
        setUri(uri)
        // if (activeTab?.path === quickTestRoute.path) {
        //     updateTab({ ...activeTab, name: uri || 'New Request', method: httpMethod } as TabRouteObject)
        // }
        if (uri) {
            const restResult = extractBraceContent(uri)
            const queryResult = syncUrlAndQuery(uri, [])
            queryResult?.query?.length && testerApiRef.current?.updateQueryDataGrid(queryResult.query)
            restResult?.length &&
            testerApiRef.current?.updateRestDataGrid(restResult.map((rest) => ({ name: rest })) as RestParamsType[])
        }
    }

    const handleHttpMethodChange = (method: HTTPMethod) => {
        setHttpMethod(method)
        // if (activeTab?.path === quickTestRoute.path) {
        //     updateTab({ ...activeTab, name: uri || 'New Request', method } as TabRouteObject)
        // }
    }

    /** Execute this logic only during 'Quicktest' run. */
    const handleSaveApi = () => {
        const { rest, query, headers, body, preScript = '', postScript = '' } = testerApiRef.current?.getEditMeta() || {}
        const newApiInfo = getDefaultApiInfo()
        const contentType = mapContentTypeToApiBodyType(body?.contentType ?? 'text/plain')
        newApiInfo.uri = uri
        newApiInfo.name = 'New Request'
        newApiInfo.apiAttrInfo.requestMethod = httpMethod
        newApiInfo.apiAttrInfo.contentType = contentType
        newApiInfo.requestParams = {
            bodyParams: body?.data,
            headerParams: headers,
            queryParams: query,
            restParams: rest
        } as SafeAny
        if (testResponse) {
            const response = testResponse.report.response
            const responseHeader = response?.headers.map((header) => {
                return generateRow({
                    name: header.key,
                    paramAttr: {
                        example: header.value
                    }
                })
            })
            const responseList = [
                {
                    // TODO: response JSON?
                    contentType: ApiBodyType.Raw,
                    responseParams: {
                        bodyParams: [RawParams(response?.body || '')],
                        headerParams: responseHeader || [],
                        queryParams: [],
                        restParams: []
                    }
                }
            ]
            newApiInfo.responseList = responseList as unknown as ResponseList[]
        }
    }

    const handleCURLParse = (cURLResult: ParseCurlResult) => {
        setHttpMethod(HTTPMethod[cURLResult.method as keyof typeof HTTPMethod])
        /** cURLResult.body */
        const headers = Object.keys(cURLResult.headers).map((key) => ({
            name: key,
            paramAttr: {
                example: cURLResult.headers[key]
            }
        }))
        testerApiRef.current?.updateHeaderDataGrid((headers as HeaderParamsType[]) || [])
        testerApiRef.current?.updateRequestBodyWithCurlInfo(cURLResult)
        setTimeout(() => {
            setUri(cURLResult.url)
            testerApiRef.current?.updateQueryDataGrid([])
            testerApiRef.current?.updateRestDataGrid([])
        }, 0)
    }


    return (
        <Box height="100%" width="calc(100% - 300px)" boxSizing="border-box">
            <Stack direction="column" spacing={1} height="100%">
                <Box height="100%" width="100%">
                    <Allotment vertical>
                        <Allotment.Pane snap>
                            <Box p={2} height="100%" display="flex" boxSizing="border-box" flexDirection="column">
                                <Box height="40px">
                                    <Box display="flex" gap={2}>
                                        <UriInput
                                            inputValue={uri}
                                            onInputChange={handleUriChange}
                                            selectValue={httpMethod}
                                            onSelectChange={handleHttpMethodChange}
                                            onCURLPaste={handleCURLParse}
                                            onTest={handleTest}
                                        />
                                        <Box flexShrink={0} display="flex" gap={2}>
                                            <TestControl loading={isLoading} onTest={handleTest} onAbort={cancel} />
                                        </Box>
                                    </Box>
                                </Box>
                                <Box height="calc(100% - 40px)">
                                    <Tester apiRef={testerApiRef} apiInfo={apiInfo} onQueryChange={handleQueryChange} />
                                </Box>
                            </Box>
                        </Allotment.Pane>
                        <Allotment.Pane preferredSize={300} snap minSize={180}>
                            <Box ref={parent} height="100%" width="100%">
                                {isLoading ? <LinearProgress /> : null}
                                <ApiResponse data={testResponse} />
                            </Box>
                        </Allotment.Pane>
                    </Allotment>
                </Box>
            </Stack>
        </Box>
    )
}
