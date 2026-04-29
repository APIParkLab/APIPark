import { FC, ReactNode, createContext, useContext, useState } from 'react'
import { TeamConfigType } from '../const/team/type'

interface TeamContextProps {
  teamInfo?: TeamConfigType
  setTeamInfo?: React.Dispatch<React.SetStateAction<TeamConfigType | undefined>>
}

const TeamContext = createContext<TeamContextProps | undefined>(undefined)

export const useTeamContext = () => {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useArray must be used within a ArrayProvider')
  }
  return context
}

export const TeamProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [teamInfo, setTeamInfo] = useState<TeamConfigType>()

  return <TeamContext.Provider value={{ teamInfo, setTeamInfo }}>{children}</TeamContext.Provider>
}
