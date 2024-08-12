
import { Button, Tag } from "antd"
import {useNavigate} from "react-router-dom";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { FC, ReactNode } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";


class InsidePageProps {
    showBanner?:boolean = true
    pageTitle:string = ''
    tagList?:Array<{label:string|ReactNode}> = []
    children:React.ReactNode
    showBtn?:boolean = false
    btnTitle?:string = ''
    description?:string = ''
    onBtnClick?:()=>void
    backUrl:string = '/'
    btnAccess?:string
}

const InsidePageForHub:FC<InsidePageProps> = ({showBanner=true,pageTitle,tagList,showBtn,btnTitle,btnAccess,description,children,onBtnClick,backUrl})=>{
    const navigate = useNavigate();

    const goBack = () => {
        navigate(backUrl);
    };
    return (
        <div className="h-full flex flex-col flex-1 overflow-hidden max-w-[1500px] m-auto">
            { showBanner &&  <div className="p-btnbase  mx-[4px]">
                <div className="text-[18px] leading-[25px] pb-[12px]">
                        <Button type="text" onClick={goBack}><ArrowLeftOutlined className="max-h-[14px]" />返回</Button>
                    </div>
                <div className="flex justify-between">
                    <div className="">
                        <span className="text-[26px] text-theme">{pageTitle}</span>
                        {tagList && tagList?.length > 0 && tagList?.map((tag)=>{
                            return ( <Tag key={tag.label as string} bordered={false}>{tag.label}</Tag>)
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

export default InsidePageForHub