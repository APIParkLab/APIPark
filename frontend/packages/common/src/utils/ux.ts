export const withMinimumDelay = <T>(fn: () => Promise<T>, delay: number = 100): Promise<T> => {
  const startTime = Date.now()
  return fn().then(async (result) => {
    const endTime = Date.now()
    const elapsed = endTime - startTime
    if (elapsed < delay) {
      await new Promise((resolve) => setTimeout(resolve, delay - elapsed))
    }
    return result
  })
}
