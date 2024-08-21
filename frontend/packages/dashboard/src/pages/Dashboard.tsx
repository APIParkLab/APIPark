
import { useEffect } from "react";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext";
import DashboardPage from "./DashboardTabPage";
import { $t } from "@common/locales";

export default function Dashboard(){
    const { setBreadcrumb } = useBreadcrumb()

    useEffect(() => {
        setBreadcrumb([
            {
                title:$t('运行视图')
            },
        ])

    }, []);

    return (
        <>
            <div className="h-full w-full pr-PAGE_INSIDE_X pb-PAGE_INSIDE_B ">
                <DashboardPage />
            </div>
        </>
    )
}