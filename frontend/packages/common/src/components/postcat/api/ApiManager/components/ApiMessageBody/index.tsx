import {Box, FormControl, FormControlLabel, MenuItem, Radio, RadioGroup, Select, SelectChangeEvent} from '@mui/material'
import {ApiBodyTypeOption} from './constants'
import {ChangeEvent, SetStateAction, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react'
import {RequestBodyRaw} from './components/Raw'
import {RequestBodyBinary} from './components/Binary'
import {ApiBodyType, BodyParamsType} from "@common/const/api-detail";
import {generateId} from "@common/utils/postcat.tsx";
import {MessageDataGrid, MessageDataGridApi} from "../MessageDataGrid";

export interface ApiMessageBodyApi {
  getBodyMeta: () => {
    contentType: ApiBodyType
    bodyParams: Partial<BodyParamsType>[]
  }
}

interface ApiBodyParamsTypeProps {
  mode: 'request' | 'response'
  bodyApiRef?: React.RefObject<ApiMessageBodyApi>
}

export function RawParams(value: string) {
  return {
    apiUuid: generateId(),
    binaryRawData: value,
    childList: [],
    contentType: null,
    dataType: 0,
    dataTypeValue: '',
    description: '',
    id: generateId(),
    isDefault: null,
    isRequired: 0,
    name: '',
    orderNo: 0,
    paramAttr: null,
    paramType: 0,
    parentId: 0,
    partType: 1,
    responseUuid: '',
    structureId: 0,
    structureParamId: ''
  }
}

export function ApiMessageBody({ apiInfo=null, loaded, mode, bodyApiRef }: ApiBodyParamsTypeProps) {
  const [apiBodyTypeValue, setApiBodyTypeValue] = useState<ApiBodyType>(ApiBodyType.JSON)

  const [apiFormData, setApiFormData] = useState<BodyParamsType[] | null>([])
  const [apiJson, setApiJson] = useState<BodyParamsType[] | null>([])
  const [jsonType, setJsonType] = useState<ApiBodyType.JSON | ApiBodyType.JSONArray>(ApiBodyType.JSON)
  const [apiXml, setApiXml] = useState<BodyParamsType[] | null>([])
  const [apiRaw, setApiRaw] = useState<string>('')
  const [apiBinary, setApiBinary] = useState<string>('')

  const jsonTableApiRef = useRef<MessageDataGridApi>(null)
  const formDataRef = useRef<MessageDataGridApi>(null)
  const xmlRef = useRef<MessageDataGridApi>(null)
  useImperativeHandle(bodyApiRef, () => ({
    getBodyMeta: () => {
      const bodyParams: BodyParamsType[] = []
      if ([ApiBodyType.JSON, ApiBodyType.FormData, ApiBodyType.XML].includes(apiBodyTypeValue)) {
        const targetRef = {
          [ApiBodyType.JSON]: jsonTableApiRef,
          [ApiBodyType.FormData]: formDataRef,
          [ApiBodyType.XML]: xmlRef
        }[apiBodyTypeValue as ApiBodyType.JSON | ApiBodyType.FormData | ApiBodyType.XML]
        bodyParams.push(...(targetRef.current?.getEditMeta() as BodyParamsType[]))
      } else if ([ApiBodyType.Raw, ApiBodyType.Binary].includes(apiBodyTypeValue)) {
        bodyParams.push(RawParams(apiBodyTypeValue === ApiBodyType.Raw ? apiRaw : apiBinary) as unknown as BodyParamsType)
      }

      return {
        contentType: jsonType === ApiBodyType.JSONArray ? ApiBodyType.JSONArray : apiBodyTypeValue,
        bodyParams
      }
    }
  }))

  useEffect(() => {
    // setTimeout(()=>{
    //   const element = document.querySelectorAll('.MuiDataGrid-main');
    //   if(element?.length > 0){
    //     for(const x of element){
    //       x.childNodes[x.childNodes.length - 1 ].textContent === 'MUI X Missing license key' ?  x.childNodes[x.childNodes.length - 1 ].textContent = '' :null
    //     }
    //   }
    // },500)
  }, []);

  useEffect(() => {
    if (loaded && (apiInfo || apiInfo === null)) {
      let data: BodyParamsType[] | null = null
      let contentType = ApiBodyType.JSON
      if (mode === 'request') {
        data = apiInfo?.requestParams?.bodyParams || []
        contentType = apiInfo?.apiAttrInfo?.contentType || ApiBodyType.JSON
      } else if (mode === 'response') {
        data = (apiInfo?.responseList?.[0]?.responseParams?.bodyParams as unknown as BodyParamsType[]) || []
        contentType = apiInfo?.responseList?.[0]?.contentType || ApiBodyType.JSON
      }
      if (contentType === ApiBodyType.JSONArray) {
        contentType = ApiBodyType.JSON
        setJsonType(ApiBodyType.JSONArray)
      }
      setApiBodyTypeValue(contentType)
      const updaterMap = {
        [ApiBodyType.FormData]: setApiFormData,
        [ApiBodyType.JSON]: setApiJson,
        [ApiBodyType.JSONArray]: setApiJson,
        [ApiBodyType.XML]: setApiXml,
        [ApiBodyType.Raw]: setApiRaw,
        [ApiBodyType.Binary]: setApiBinary
      }
      const DataGridType = [ApiBodyType.FormData, ApiBodyType.JSON, ApiBodyType.JSONArray, ApiBodyType.XML]
      if (DataGridType.includes(contentType)) {
        DataGridType.forEach((type) => {
          const updater: (value: SetStateAction<BodyParamsType[]>) => void = updaterMap[type] as (
            value: SetStateAction<BodyParamsType[]>
          ) => void
          if (+type === +contentType) {
            updater([...((data || []) as BodyParamsType[])])
          } else {
            const JsonType = [ApiBodyType.JSON, ApiBodyType.JSONArray]
            if (!(JsonType.includes(contentType) && JsonType.includes(type))) {
              updater([])
            }
          }
        })
      }
      const StringType = [ApiBodyType.Raw, ApiBodyType.Binary]
      if (StringType.includes(contentType)) {
        StringType.forEach((type) => {
          const stringUpdater: (value: SetStateAction<string>) => void = updaterMap[type] as (
            value: SetStateAction<string>
          ) => void
          stringUpdater(data?.[0]?.binaryRawData || '')
        })
        DataGridType.forEach((type) => {
          const updater: (value: SetStateAction<BodyParamsType[]>) => void = updaterMap[type] as (
            value: SetStateAction<BodyParamsType[]>
          ) => void
          updater([])
        })
      }
    }
  }, [apiInfo, loaded, mode])

  const apiBodyTypeList: ApiBodyTypeOption[] = useMemo(() => {
    return [
      mode === 'request' && {
        key: 'Form-Data',
        value: ApiBodyType.FormData,
        element: (
          <MessageDataGrid
            apiRef={formDataRef}
            initialRows={apiFormData}
            onChange={setApiFormData}
            contentType="FormData"
            messageType="Body"
            loaded={loaded}
          />
        )
      },
      {
        key: 'JSON',
        value: ApiBodyType.JSON,
        element: (
          <MessageDataGrid
            apiRef={jsonTableApiRef}
            initialRows={apiJson}
            onChange={setApiJson}
            contentType="JSON"
            messageType="Body"
            loaded={loaded}
          />
        )
      },
      {
        key: 'XML',
        value: ApiBodyType.XML,
        element: (
          <MessageDataGrid
            apiRef={xmlRef}
            initialRows={apiXml}
            onChange={setApiXml}
            contentType="XML"
            messageType="Body"
            loaded={loaded}
          />
        )
      },
      {
        key: 'Raw',
        value: ApiBodyType.Raw,
        element: <RequestBodyRaw value={apiRaw} onChange={setApiRaw} 
        loaded={loaded} />
      },
      {
        key: 'Binary',
        value: ApiBodyType.Binary,
        element: <RequestBodyBinary value={apiBinary} onChange={setApiBinary} 
        loaded={loaded}/>
      }
    ].filter((type) => type) as ApiBodyTypeOption[]
  }, [apiBinary, apiFormData, apiJson, apiRaw, apiXml, mode])

  const handleApiBodyTypeValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setApiBodyTypeValue(+(event.target as HTMLInputElement).value)
  }

  const handleJsonTypeChange = (event: SelectChangeEvent<ApiBodyType>) => {
    setJsonType(event.target.value as unknown as ApiBodyType.JSON | ApiBodyType.JSONArray)
  }

  return (
    <Box >
      <Box sx={{display:'flex',alignItems:'CENTER',paddingY:'4px'}}>
        <FormControl>
          <RadioGroup
            row
            name="api-body-type-radio-buttons-group"
            value={apiBodyTypeValue}
            onChange={handleApiBodyTypeValueChange}
            sx={{ height: '30px' ,paddingLeft:'8px',marginLeft:'8px',fontSize:'12px'}}
          >
            {apiBodyTypeList.map((apiBodyType) => (
              <FormControlLabel
              sx={{ paddingRight:'10px' ,'& .MuiFormControlLabel-label': { fontSize: '12px' }, }}
                key={apiBodyType.value}
                value={apiBodyType.value}
                checked={apiBodyType.value === apiBodyTypeValue}
                control={<Radio  sx={{ height: '30px',width:'22px',marginRight:'4px',color:'#EDEDED' }} />}
                label={apiBodyType.key}
              />
            ))}
          </RadioGroup>
        </FormControl>
        {[ApiBodyType.JSON].includes(apiBodyTypeValue) ? (
          <Box>
            <Select
              value={jsonType}
              onChange={handleJsonTypeChange}
              sx={{
                height: '30px',
                borderColor:'#EDEDED'
                
              }}
            >
              <MenuItem value={ApiBodyType.JSON}>Object</MenuItem>
              <MenuItem value={ApiBodyType.JSONArray}>Array</MenuItem>
            </Select>
          </Box>
        ) : null}
      </Box>
      {apiBodyTypeList.map((apiBodyType) => (
        <Box hidden={apiBodyType.value !== apiBodyTypeValue} key={apiBodyType.value}>
          <Box>{apiBodyType.element}</Box>
        </Box>
      ))}
    </Box>
  )
}
