import {Codebox} from "../../../../Codebox";

interface BodyProps {
  data: string
}

export function Body({ data }: BodyProps) {
  return (
    <>
      <Codebox height="100%" width="100%" value={`${typeof data === 'string' ? data : JSON.stringify(data)}`} />
    </>
  )
}
