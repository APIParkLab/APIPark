import { Codebox } from "@common/components/postcat/api/Codebox";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { RouterParams } from "@common/const/type";
import { $t } from "@common/locales";
import { App, Button, message, Switch, Modal, Spin } from 'antd'
import { useFetch } from "@common/hooks/http";
import { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";

import { useParams } from "react-router-dom";
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
  const [targetValue, settTargetValue] = useState('')
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
          setOriginValue(log.origin || '')
          settTargetValue(log.target || '')
          setLoading(false)
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      }).catch(() => {
        return { data: [], success: false }
      }).finally(() => {
        const aa = `{
          "code": {
              "gg": "gg",
              "gg1": "gg",
              "gg2": "gg",
              "gg3": "gg",
              "gg4": "gg"
          }
      }`
        setOriginValue(JSON.stringify(JSON.parse(aa), null, 2))
        settTargetValue(JSON.stringify(JSON.parse(aa), null, 2))
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
            脱敏前
          </div>
          <div style={{ height: 'calc(100vh - 50px)' }}>
            <Codebox
              language='json'
              height="100%"
              width="100%"
              value={originValue}
            />
          </div>
        </div>
        <div className="w-1/2 p-2 h-full">
          <div className="h-[30px] bg-green-100 mb-2 flex items-center justify-center">
            脱敏后
          </div>
          <div style={{ height: 'calc(100vh - 50px)' }}>
            <Codebox
              language='json'
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
