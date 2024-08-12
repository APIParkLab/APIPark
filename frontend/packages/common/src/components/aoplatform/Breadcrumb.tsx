import { Breadcrumb } from "antd"
import { useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {FC,useEffect} from "react";


const TopBreadcrumb: FC = () => {
     const { breadcrumb } = useBreadcrumb()
    useEffect(() => {
    }, [breadcrumb]);
    return (
        <Breadcrumb items={breadcrumb} />
    )
}

export default TopBreadcrumb