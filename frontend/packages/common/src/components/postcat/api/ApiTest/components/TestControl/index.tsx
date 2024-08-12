// import { TabRouteObject, useTabStore } from '@/stores/tab'
import { Button, Typography } from '@mui/material'
import { TouchRippleActions } from '@mui/material/ButtonBase/TouchRipple'
import { useEffect, useRef, useState } from 'react'
// import { useKey } from 'react-use'

interface TestControlProps {
  onTest: () => Promise<void> | void
  onAbort: () => void
  loading: boolean
}

export function TestControl({ onTest, onAbort, loading }: TestControlProps) {
  const testRippleRef = useRef<TouchRippleActions>(null)

  const [loadingTime, setLoadingTime] = useState(0)

  // const { params: tabParams } = useContext<Partial<TabRouteObject>>(TabContext)

  // const activeTab = useTabStore((state) => state.activeTab)

  // const theme = useTheme()
  // useKey((event: KeyboardEvent) => {
  //   if (event.key === 'Enter') {
  //     event.preventDefault()
  //     triggerSaveRipple()
  //     //console.log('JK', activeTab?.params)
  //     //console.log('tabParams:', tabParams)
  //     // TODO 全等
  //     onTest()
  //   }
  //   return true
  // })

  // const rippleDuration = theme.transitions.duration.short

  // const triggerSaveRipple = (): void => {
  //   if (testRippleRef.current) {
  //     const ripple = testRippleRef.current
  //     ripple.start()
  //     setTimeout(() => {
  //       ripple.stop()
  //     }, rippleDuration)
  //   }
  // }

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (loading) {
      setLoadingTime(0)
      timer = setInterval(() => {
        setLoadingTime((prevTime) => prevTime + 1)
      }, 1000)
    } else {
      if (timer) clearInterval(timer)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [loading])


  return (
    <>
      {!loading ? (
        <Button touchRippleRef={testRippleRef} variant="contained" onClick={onTest}>
        发送(Enter)
        </Button>
      ) : (
        <Button variant="outlined" color="warning" onClick={onAbort}>
          <Typography>中止</Typography>
          {loadingTime ? (
            <Typography sx={{ paddingLeft: 1 }}>
              {' '}
              ({loadingTime} {'秒'}){' '}
            </Typography>
          ) : null}
        </Button>
      )}
    </>
  )
}
