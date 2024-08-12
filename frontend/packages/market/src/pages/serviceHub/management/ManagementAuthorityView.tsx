import {Col, Row} from "antd";
import {useEffect, useState} from "react";

export type ManagementAuthorityViewProps = {
    entity:Array<{key:string, value:string}>
}

export const ManagementAuthorityView = ({entity}:ManagementAuthorityViewProps)=>{
    const [detail,setDetail] = useState<Array<{key:string, value:string}>>(entity)

    useEffect(() => {
        setDetail(entity)
    }, [entity]);

    return (
        <div className="my-btnybase">{
            detail?.length > 0 && detail.map((k,i)=>(
                <Row className="leading-[32px]" key={i}>
                    <Col className="pr-[8px]" offset={1} span={5}>{k.key}:</Col>
                    <Col className="break-all" span={18}>{ k.value || '-'}</Col>
                </Row>
            ))
        }
        </div>
    )
}