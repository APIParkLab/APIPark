import { createContext, FC, ReactNode, useContext, useState } from "react";

export const PluginSlotHubContext = createContext<{
  addSlot: (name: string, content: unknown) => void;
  addSlotArr: (name: string, content: unknown[]) => void;
  removeSlot: (name: string) => void;
  getSlot: (name: string) => unknown;
} | undefined>(undefined);

export const PluginSlotHubProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [pluginSlotHub] = useState<Map<string, unknown>>(new Map());

  const pluginSlotHubService = {
    addSlot: (name: string, content: any) => { 
      pluginSlotHub.set(name, pluginSlotHub.get(name) ? [...(pluginSlotHub.get(name) as Array<unknown>), content] : [content] ); },
    addSlotArr: (name: string, content: any[]) => { pluginSlotHub.get(name) ? pluginSlotHub.set(name, (pluginSlotHub.get(name) as Array<unknown>).push(content)) : pluginSlotHub.set(name, content); },
    removeSlot: (name: string) => { pluginSlotHub.delete(name); },
    getSlot: (name: string) => {
      
      return pluginSlotHub.get(name) ; }
  };

  return (
    <PluginSlotHubContext.Provider value={pluginSlotHubService}>
      {children}
    </PluginSlotHubContext.Provider>
  );
};

export const usePluginSlotHub = () => {
  const context = useContext(PluginSlotHubContext);
  if (!context) {
    throw new Error('usePluginSlotHub must be used within a PluginSlotHubProvider');
  }
  return context;
};