
import { Button, Tag } from "antd"
import {useNavigate} from "react-router-dom";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { FC, ReactNode } from "react";
import { ArrowLeftOutlined, LeftOutlined } from "@ant-design/icons";


class InsidePageProps {
    showBanner?:boolean = true
    pageTitle:string = ''
    tagList?:Array<{label:string|ReactNode}> = []
    children:React.ReactNode
    showBtn?:boolean = false
    btnTitle?:string = ''
    description?:string = ''
    onBtnClick?:()=>void
    backUrl?:string = '/'
    btnAccess?:string
}

const InsidePage:FC<InsidePageProps> = ({showBanner=true,pageTitle,tagList,showBtn,btnTitle,btnAccess,description,children,onBtnClick,backUrl})=>{
    const navigate = useNavigate();

    const goBack = () => {
        navigate(backUrl || '/');
    };
    return (
        // <div className="h-full flex flex-col flex-1 overflow-hidden bg-[#f7f8fa]">
        <div className="h-full flex flex-col flex-1 overflow-hidden  ">
            { showBanner &&  <div className="  mx-[4px] border-[0px] border-b-[1px] border-solid border-BORDER">
                {backUrl &&<div className="text-[18px] leading-[25px] pb-[12px]">
                        <Button type="text" onClick={goBack}><ArrowLeftOutlined className="max-h-[14px]" />返回</Button>
                    </div>}
                <div className="flex justify-between">
                    <div className="flex items-center">
                        <p className="text-theme text-[26px] pr-[10px]">{pageTitle}</p>
                        {tagList && tagList?.length > 0 && tagList?.map((tag)=>{
                            return ( <Tag className="" key={tag.label as string} bordered={false} >{tag.label}</Tag>)
                        })}
                    </div>
                    {showBtn && <WithPermission access={btnAccess}><Button type="primary" onClick={()=> {
                        onBtnClick&&onBtnClick()
                    }}>{btnTitle}</Button></WithPermission>}
                </div>
                <p className="mb-[30px]">
                    {description}
                </p>
            </div>}
            <div className="h-full overflow-y-hidden">{children}</div>
        </div>
    )
}

export default InsidePage