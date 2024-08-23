import JoyRide, { Props } from 'react-joyride'

const Tour = (props: Partial<Props>) => {
  return (
    <>
      <JoyRide
        continuous={true}
        showSkipButton={false}
        showProgress={true}
        scrollToFirstStep
        scrollOffset={400}
        {...props}
      />
    </>
  )
}

export default Tour
