import { EntityItem } from '@common/const/type';
import { AiServiceConfigFieldType } from '@core/const/ai-service/type';
import  {FC, createContext, useContext, useState, ReactNode } from 'react';

interface AiServiceContextProps {
    apiPrefix:string;
    setApiPrefix:React.Dispatch<React.SetStateAction<string>>;
    prefixForce:boolean;
    setPrefixForce:React.Dispatch<React.SetStateAction<boolean>>;
    aiServiceInfo:(AiServiceConfigFieldType & {provider:EntityItem })|undefined
    setAiServiceInfo:React.Dispatch<React.SetStateAction<AiServiceConfigFieldType|undefined>>;
}

const AiServiceContext = createContext<AiServiceContextProps | undefined>(undefined);

export const useAiServiceContext = () => {
    const context = useContext(AiServiceContext);
    if (!context) {
        throw new Error('useArray must be used within a ArrayProvider');
    }
    return context;
};

export const AiServiceProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [apiPrefix, setApiPrefix] = useState<string>('');
    const [prefixForce, setPrefixForce] = useState<boolean>(false);
    const [aiServiceInfo, setAiServiceInfo] = useState<AiServiceConfigFieldType>()

    return <AiServiceContext.Provider value={{apiPrefix,setApiPrefix,prefixForce,setPrefixForce,aiServiceInfo, setAiServiceInfo }}>{children}</AiServiceContext.Provider>;
};