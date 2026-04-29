
import  {FC, createContext, useContext, useState, ReactNode } from 'react';
import { SystemConfigFieldType } from '../const/system/type.ts';

interface SystemContextProps {
    apiPrefix:string;
    setApiPrefix:React.Dispatch<React.SetStateAction<string>>;
    prefixForce:boolean;
    setPrefixForce:React.Dispatch<React.SetStateAction<boolean>>;
    systemInfo:SystemConfigFieldType|undefined
    setSystemInfo:React.Dispatch<React.SetStateAction<SystemConfigFieldType|undefined>>;
}

const SystemContext = createContext<SystemContextProps | undefined>(undefined);

export const useSystemContext = () => {
    const context = useContext(SystemContext);
    if (!context) {
        throw new Error('useArray must be used within a ArrayProvider');
    }
    return context;
};

export const SystemProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [apiPrefix, setApiPrefix] = useState<string>('');
    const [prefixForce, setPrefixForce] = useState<boolean>(false);
    const [systemInfo, setSystemInfo] = useState<SystemConfigFieldType>()

    return <SystemContext.Provider value={{apiPrefix,setApiPrefix,prefixForce,setPrefixForce,systemInfo, setSystemInfo }}>{children}</SystemContext.Provider>;
};