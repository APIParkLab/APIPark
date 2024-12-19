import { useImperativeHandle, useRef, useState } from 'react'
import { BodyParamsType } from '@common/const/api-detail'
import { TestMessageDataGrid, TestMessageDataGridApi } from '../../TestMessageDataGrid'

interface FormDataProps {
  apiRef: React.RefObject<Pick<TestMessageDataGridApi, 'getEditMeta' | 'importData'>>
}

export function FormData({ apiRef }: FormDataProps) {
  const [apiBody, setApiBody] = useState<BodyParamsType[] | null>(null)
  // const { apiInfo, loaded } = useContext<Partial<ApiTabContextProps>>(ApiTabContext)

  const formDataApiRef = useRef<TestMessageDataGridApi>(null)

  // useEffect(() => {
  //   if (loaded && (apiInfo || apiInfo === null)) {
  //     setApiBody(apiInfo?.requestParams.bodyParams || [])
  //   }
  // }, [apiInfo, loaded])

  useImperativeHandle(apiRef, () => ({
    getEditMeta: () => {
      return formDataApiRef.current?.getEditMeta() || []
    },
    importData(changeType, data) {
      return formDataApiRef.current?.importData(changeType, data)
    },
    updateRows(data: BodyParamsType[]) {
      return formDataApiRef.current?.updateRows(data)
    }
  }))

  return <TestMessageDataGrid apiRef={formDataApiRef} initialRows={apiBody} messageType="Body" />
}
