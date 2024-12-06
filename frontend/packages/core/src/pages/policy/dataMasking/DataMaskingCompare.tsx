import { Codebox, codeBoxLanguagesType } from "@common/components/postcat/api/Codebox";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { $t } from "@common/locales";
import { message, Spin } from 'antd'
import { useFetch } from "@common/hooks/http";
import { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { contentTypeToLanguageMap } from "@common/const/policy/consts";
type LogItems = {
  id: string;
  origin: string;
  target: string;
}
const DataMaskingCompare = () => {
  const { logId, serviceId, teamId } = useParams();
  const { fetchData } = useFetch()
  const [loading, setLoading] = useState(false)
  const [originValue, setOriginValue] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [language, setLanguage] = useState<codeBoxLanguagesType>('json')
  const getMonacoEditorLanguage = (contentType: string): codeBoxLanguagesType => {
    // 提取主类型，忽略参数（如 "; charset=utf-8"）
    const mainType = contentType.split(";")[0].trim().toLowerCase();

    // 根据映射表获取语言，默认返回 "plaintext"
    return contentTypeToLanguageMap[mainType] || "json";
  };
  const getLogData = () => {
    setLoading(true)
    return fetchData<BasicResponse<{ log: LogItems }>>(`strategy/${serviceId === undefined ? 'global' : 'service'}/data-masking/log`,
      {
        method: 'GET',
        eoParams: {
          log: logId,
          service: serviceId,
          team: teamId,
        }
      }).then(response => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          const { log } = data
          const docLanguage = getMonacoEditorLanguage(log.content_type)
          setLanguage(docLanguage)
          setOriginValue(docLanguage === 'json' ? JSON.stringify(JSON.parse(log.origin || ''), null, 2) : log.origin || '')
          setTargetValue(docLanguage === 'json' ? JSON.stringify(JSON.parse(log.target || ''), null, 2) : log.target || '')
          setLoading(false)
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      }).catch(() => {
        return { data: [], success: false }
      }).finally(() => {
        setLoading(false)
      })
  }
  useEffect(() => {
    getLogData()
  }, []);
  return (
    <Spin wrapperClassName=" h-full flex-1" indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading}>
      <div className="flex h-full overflow-hidden">
        <div className="w-1/2 p-2  h-full">
          <div className="h-[30px] bg-gray-200 mb-2 flex items-center justify-center">
            {$t('脱敏前')}
          </div>
          <div style={{ height: 'calc(100vh - 50px)' }}>
            <Codebox
              language={language}
              height="100%"
              width="100%"
              value={originValue}
              sx={{ whiteSpace: 'nowrap' }}
              readOnly
            />
          </div>
        </div>
        <div className="w-1/2 p-2 h-full">
          <div className="h-[30px] bg-green-100 mb-2 flex items-center justify-center">
            {$t('脱敏后')}
          </div>
          <div style={{ height: 'calc(100vh - 50px)' }}>
            <Codebox
              language={language}
              width="100%"
              height="100%"
              value={targetValue}
              sx={{ whiteSpace: 'nowrap' }}
              readOnly
            />
          </div>
        </div>
      </div>
    </Spin>
  );
}
export default DataMaskingCompare;
