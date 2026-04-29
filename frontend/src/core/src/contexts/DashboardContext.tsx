
import  { createContext, useContext, useState, ReactNode, FC } from 'react';
import {EntityItem} from "@common/const/type.ts";

interface DashboardContextProps {
    currentClusterList:EntityItem[]; 
    setCurrentClusterList: React.Dispatch<React.SetStateAction<EntityItem[]>>;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const useDashboardContext = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useArray must be used within a ArrayProvider');
    }
    return context;
};

export const DashboardProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [currentClusterList, setCurrentClusterList] = useState<EntityItem[]>([])
    return <DashboardContext.Provider value={{ currentClusterList, setCurrentClusterList }}>{children}</DashboardContext.Provider>;
};