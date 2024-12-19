import { Codebox } from '../../../../Codebox'

interface RequestBodyRawProps {
  value: string
}
export function PreviewBodyRaw({ value }: RequestBodyRawProps) {
  return <Codebox value={value} enableToolbar={false} language="json" height="250px" width="100%" readOnly={true} />
}
