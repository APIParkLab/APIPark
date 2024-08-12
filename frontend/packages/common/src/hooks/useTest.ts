// import moment from "moment";
//
// declare type Timestamp = number
//
// type SafeAny = unknown
// // Header structure
// interface Header {
//   key: string
//   value: SafeAny
// }
//
// // TimingSummary structure
// interface TimingSummary {
//   dnsTiming: string
//   tcpTiming: string
//   tlsTiming: string
//   requestSentTiming: string
//   firstByteTiming: string
//   contentDeliveryTiming: string
//   responseTiming: string
// }
//
// // General structure
// interface General {
//   redirectTimes: number
//   downloadSize: number
//   downloadRate: string
//   timingSummary: TimingSummary[]
//   time: string
// }
//
// // Request structure
// interface Request {
//   headers: Header[]
//   body: SafeAny
//   requestType: string
//   uri?: string
// }
//
// export type ResponseType = 'text' | 'longText' | 'stream'
// export type ResponseContentType = 'formdata' | 'raw' | 'binary'
//
// // Response structure
// interface Response {
//   headers: Header[]
//   body: SafeAny
//   httpCode: number
//   testDeny: string
//   responseLength: number
//   responseType: ResponseType
//   contentType: ResponseContentType
// }
//
// // Report structure
// interface Report {
//   response: Response
//   request: Request
//   reportList: Array<{ type: 'throw' | 'interrupt'; content: string }>
//   general: General
//   blobFileName?: string
// }
//
// // RequestInfo structure
// interface RequestInfo {
//   params: SafeAny[]
//   apiProtocol: string
//   URL: string
//   headers: Header[]
//   methodType: string
//   method: string
//   requestType: string
// }
//
// // ResultInfo structure
// interface ResultInfo {
//   headers: Header[]
//   body: string
//   httpCode: number
//   testDeny: string
//   responseLength: number
//   responseType: string
//   contentType: string
//   reportList: SafeAny[]
// }
//
// // History structure
// interface History {
//   afterInject: string
//   beforeInject: string
//   requestInfo: RequestInfo
//   general: General
//   resultInfo: ResultInfo
// }
//
// // TestResponse structure
export interface TestResponse {
  id: string
  report: Report
  history: History
  globals: SafeAny
}
//
// interface TestInfo {
//   createTime: Timestamp
//   updateTime: Timestamp
//   id: number
//   projectUuid: string
//   sharedUuid: string
// }
//
// export function useCreateTestHistory() {
//   // const { request, loading, error, response, data } = useRequest<TestInfo>('/api/api/history', 'POST')
//
//   // const { projectId, workspaceId } = useParams()
//
//   const createTestHistory = async (data: SafeAny) => {
//     const result = await request({
//       projectUuid: projectId,
//       workSpaceUuid: workspaceId,
//       request: '',
//       response: '',
//       general: '{}',
//       apiUuid: -1,
//       ...data
//     })
//     return result
//   }
//
//   return { data: response, raw: data, error, createTestHistory, isLoading: loading }
// }
//
// interface TestRequestProps {
//   apiId: string
//   projectId: string
//   workspaceId: string
// }
//
// interface TestProps {
//   uri: string
//   method: HTTPMethod
//   preScript: string
//   postScript: string
//   // contentType: SafeAny
//   restParams: SafeAny[]
//   headersParams: MessageBody[]
//   bodyParams: MessageBody[]
//   requestType: TestApiBodyType
//   authInfo: SafeAny
// }
//
// export function useTest() {
//   const { request, loading, error, response, data, cancel } = useRequest('/api/unit', 'POST', { raw: true })
//   const selectedEnv = useEnvStore((state) => state.selectedEnv) as Env<EnvParam[]>
//   const { lang, workspaceId, projectId } = useParams()
//   const testResponse: TestResponse = (data as { data: TestResponse })?.data
//   const language = { en: 'en', zh: 'cn' }[lang]
//   const testTime = moment().format('YYYY-MM-DD HH:mm:ss')
//   const [globalVariables] = useGlobalVariable()
//
//   const { createTestHistory } = useCreateTestHistory()
//
//   const format = (props: TestRequestProps, data: TestProps) => {
//     const { uri, method, preScript, postScript, requestType, restParams, headersParams, bodyParams, authInfo } = data
//
//     const globals = globalVariables || {}
//     const headers =
//       headersParams?.map(
//         (row) =>
//           ({
//             headerName: row.name,
//             headerValue: row.paramAttr.example
//           }) || ''
//       ) || []
//
//     return {
//       action: 'ajax',
//       data: {
//         lang: language,
//         globals,
//         URL: formatUri(uri!, restParams),
//         method: HTTPMethod[method!],
//         methodType: `${method}`,
//         httpHeader: 0, // TODO: data.protocol,
//         headers: headers,
//         requestType: `${requestType}`,
//         params: formatBody({
//           requestType,
//           data: bodyParams || []
//         }),
//         apiRequestParamJsonType: '0',
//         advancedSetting: { requestRedirect: 1, checkSSL: 0, sendEoToken: 1, sendNocacheToken: 0 },
//         env: {
//           paramList: (selectedEnv?.parameters || []).map((val) => ({ paramKey: val.name, paramValue: val.value })),
//           frontURI: selectedEnv?.hostUri
//         },
//         auth: { status: '0' },
//         authInfo: authInfo || {},
//         beforeInject: preScript,
//         afterInject: postScript,
//         testTime
//       },
//       id: JSON.stringify({
//         uuid: props.apiId,
//         wid: props.workspaceId,
//         pid: props.projectId
//       })
//     }
//   }
//
//   const test = async (props: TestRequestProps, data: TestProps) => {
//     const testRequest = format(props, data)
//     const result: SafeAny = await (request(testRequest)) as unknown as Promise<{ data: TestResponse }>
//     await createTestHistory({
//       apiUuid: props.apiId || -1,
//       general: '{}',
//       request: JSON.stringify({
//         requestParams: {
//           headerParams: [],
//           bodyParams: [],
//           queryParams: [],
//           restParams: []
//         },
//         responseList: [],
//         uri: data.uri,
//         protocol: 0,
//         apiAttrInfo: {
//           beforeInject: data.preScript,
//           afterInject: data.postScript,
//           requestMethod: data.method,
//           contentType: 1
//         }
//       }),
//       response: JSON.stringify(result.data.report.response),
//       workSpaceUuid: workspaceId
//     })
//     // mutate(`getTestHistories?projectUuid=${projectId}&workSpaceUuid=${workspaceId}&page=${1}&pageSize=${200}`)
//     return result
//   }
//
//   return { data: response, raw: testResponse, error, test, format, isLoading: loading, cancel }
// }
//
// function formatBody({
//   requestType,
//   data
// }: {
//   requestType: ApiBodyType
//   data: Partial<MessageBody>[]
// }) {
//   switch (requestType) {
//     case ApiBodyType.Binary:
//     case ApiBodyType.Raw: {
//       return data?.[0]?.binaryRawData
//     }
//     case ApiBodyType.FormData: {
//       return data?.map((val) => {
//         const example = val.paramAttr?.example as string
//         const exampleArr = val.paramAttr?.example as FileExample
//         const isFile = val.dataType === ApiParamsType.file
//         const paramInfo = isFile ? exampleArr?.map((val) => val.name).join(',') : example
//         return {
//           listDepth: 0,
//           paramKey: val.name,
//           files: isFile ? exampleArr?.map((file) => file.content) : example,
//           paramType: val.dataType === ApiParamsType.file ? '1' : '0',
//           paramInfo
//         }
//       })
//     }
//   }
// }
