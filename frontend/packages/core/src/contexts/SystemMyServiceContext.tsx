
import  { createContext, useContext, useState, ReactNode, FC } from 'react';
import { MyServiceFieldType } from '../const/system/type.ts';

interface SystemMyServiceContextProps {
    serviceInfo:MyServiceFieldType|undefined
    setServiceInfo:React.Dispatch<React.SetStateAction<MyServiceFieldType|undefined>>;
}

const SystemMyServiceContext = createContext<SystemMyServiceContextProps | undefined>(undefined);

export const useSystemMyServiceContext = () => {
    const context = useContext(SystemMyServiceContext);
    if (!context) {
        throw new Error('useArray must be used within a ArrayProvider');
    }
    return context;
};

export const SystemMyServiceProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [serviceInfo, setServiceInfo] = useState<MyServiceFieldType>()
    return <SystemMyServiceContext.Provider value={{ serviceInfo, setServiceInfo }}>{children}</SystemMyServiceContext.Provider>;
};