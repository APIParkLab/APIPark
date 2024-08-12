import  {useState, useEffect, useImperativeHandle} from 'react';
import {AutoComplete, Empty, Tabs} from 'antd';
import { ResultListType} from "@common/const/api-detail";
import {Collapse} from "@common/components/postcat/api/Collapse";
import {Box} from "@mui/material";
import {Codebox} from "@common/components/postcat/api/Codebox";
import { cloneDeep } from 'lodash-es';

export interface ResponseExampleCompoEditorApi {
    getData: () => ResultListType[] | []
}

const DEFAULT_RESULT_LIST = [
    {id:'success',name:'成功示例',httpCode:'200',content:''},
    {id:'failed',name:'失败示例',httpCode:'200',content:''},
]

export const HTTP_STATUS_CODE = ['200', '403', '404', '410', '422', '500', '502', '503', '504']

export const CONTENT_TYPE_TYPE = [
    'application/json',
    'application/x-www-form-urlencoded',
    'image/jpeg',
    'image/png',
    'multipart/form-data',
    'text/asp',
    'text/css',
    'text/html',
    'text/html; charset=UTF-8',
    'text/plain',
    'text/xml'
]

export function ResponseExampleCompo ({ editorRef,title,detail,mode='view' }: {editorRef?: React.RefObject<ResponseExampleCompoEditorApi>,title:string, detail:resultList[]}) {
  const [resultDemos, setResultDemos] = useState<unknown>([]);

    useImperativeHandle(editorRef, () => ({
        getData: () => {
            return resultDemos||[]
        }
    }))

  useEffect(() => {
      if(mode === 'view'){
          setResultDemos(detail);
      }else{
          setResultDemos(detail?.length > 0 ? detail: cloneDeep(DEFAULT_RESULT_LIST))
      }
  }, [detail]);

  const updateResultList = (id:string, type:'httpCode' | 'httpContentType'|'content',value:string) => {
      setResultDemos((prevList)=>{
          for(let i = 0 ; i < prevList.length; i++){
              if(prevList[i].id === id){
                    prevList[i][type] = value
                    return prevList
              }
          }
      })
    }

  return (
      <Collapse title={title}>
        <Box width="100%">
        <Tabs className=" small-tabs" defaultActiveKey={resultDemos?.[0]?.id}>
          {resultDemos && resultDemos?.map((item:ResultListType) => (
            <Tabs.TabPane key={item.id} tab={item.name}>
              <div >
                <div className="ml-[8px] mb-[8px] flex">
                    {mode === 'view' ?
                         item.content ? <span className="mr-btnbase py-[5px] px-btnbase text-DEFAULT bg-[#f7f8fa] rounded border-[1px] border-solid border-DEFAULT"> HTTP Status Code: {item.httpCode}</span>:''
                        :  <AutoComplete
                            className="mr-btnbase rounded "
                            options={HTTP_STATUS_CODE.map((code)=>({label:code, value:code}))}
                            style={{ width: 200 }}
                            value={item.httpCode}
                            status={item.httpCode ? '' : 'error'}
                            onSelect={(value)=>updateResultList(item.id,'httpCode',value)}
                            placeholder="HTTP 状态码"
                        />
                    }
                     {mode === 'view' ?
                        item.content ?  <span className="mr-btnbase py-[5px] px-btnbase text-DEFAULT bg-[#f7f8fa] rounded border-[1px] border-solid border-DEFAULT">Content-Type: {item.httpContentType || 'text/html;charset=UTF-8'}</span>:''
                         : <AutoComplete
                             options={CONTENT_TYPE_TYPE.map((type)=>({label:type, value:type}))}
                             style={{ width: 200 }}
                             value={item.httpContentType || 'text/html;charset=UTF-8'}
                             onSelect={(value)=>updateResultList(item.id,'httpContentType',value)}
                             placeholder="默认 text/html;charset=UTF-8"
                         />}
                </div>
                  {mode === 'view' ?
                      <>
                          { item.content ?
                          <pre className="border-[1px] border-solid border-BORDER p-[6px] rounded w-auto min-h-[130px] max-h-[500px] overflow-auto mt-[0px]">{item.content}</pre>
                              :
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂未填写示例"/>
                        }</>
                      : <>
                          <Codebox value={item.content} language='json' width="100%" height={'250px'} onChange={(value)=>updateResultList(item.id,'content',value)}/>
                      </>
                  }
              </div>
            </Tabs.TabPane>
          ))}
        </Tabs>
        </Box>
      </Collapse>
  );
}

