import { Dispatch, SetStateAction, useEffect, useState } from 'react'

type BasicInfoType = {
  selected_X_apibee_token: string
  tokenId: number | string
}

const subscriptions: Dispatch<SetStateAction<BasicInfoType>>[] = []

let tokenState: unknown = { selected_X_apibee_token: '', tokenId: '' }

const setTokenState = (newState: BasicInfoType | null) => {
  if (newState) {
    tokenState = { ...tokenState, ...newState }
  } else {
    tokenState = null
  }
  subscriptions.forEach((subscription) => {
    subscription(tokenState)
  })
}

export const useTokenBasicInfo = () => {
  const [_, newSubscription] = useState(tokenState)
  useEffect(() => {
    subscriptions.push(newSubscription)
  }, [])
  return [tokenState, setTokenState] as const
}
