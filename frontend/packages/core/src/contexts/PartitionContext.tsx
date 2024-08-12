
import  {FC, createContext, useContext, useState, ReactNode } from 'react';
import { PartitionConfigFieldType } from '../const/partitions/types.ts';

interface PartitionContextProps {
    partitionInfo:PartitionConfigFieldType|undefined
    setPartitionInfo:React.Dispatch<React.SetStateAction<PartitionConfigFieldType|undefined>>;
}

const PartitionContext = createContext<PartitionContextProps | undefined>(undefined);

export const usePartitionContext = () => {
    const context = useContext(PartitionContext);
    if (!context) {
        throw new Error('useArray must be used within a ArrayProvider');
    }
    return context;
};

export const PartitionProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [partitionInfo, setPartitionInfo] = useState<PartitionConfigFieldType>()
    return <PartitionContext.Provider value={{ partitionInfo, setPartitionInfo }}>{children}</PartitionContext.Provider>;
};