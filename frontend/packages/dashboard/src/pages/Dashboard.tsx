
import { useEffect } from "react";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext";
import DashboardPage from "./DashboardTabPage";

export default function Dashboard(){
    const { setBreadcrumb } = useBreadcrumb()

    useEffect(() => {
        setBreadcrumb([
            {
                title:'运行视图'
            },
        ])

    }, []);

    return (
        <>
            <DashboardPage />
            
        </>
    )
}