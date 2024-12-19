import { Codebox } from '../../../../Codebox'

interface RawProps {
  value: string
  onChange: (value: string) => void
}

export function Raw({ value, onChange }: RawProps) {
  return <Codebox value={value} onChange={onChange} width="100%" height="100%" />
}
