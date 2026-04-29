import { Upload } from '../../../../Upload'

interface BinaryProps {
  value: File | null
  onChange: (value: File | null) => void
}

export function Binary({ value, onChange }: BinaryProps) {
  return <Upload value={value} onChange={onChange} />
}
