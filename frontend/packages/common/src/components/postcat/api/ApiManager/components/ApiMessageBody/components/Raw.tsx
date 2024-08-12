import {Codebox} from "../../../../Codebox";

interface RequestBodyRawProps {
  value: string
  onChange: (value: string) => void
}
export function RequestBodyRaw({ value, onChange }: RequestBodyRawProps) {
  // @ts-ignore
  return <Codebox value={value} width="100%" onChange={onChange} />
}
