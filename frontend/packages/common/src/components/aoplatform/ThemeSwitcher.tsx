import React, { useEffect, useState } from 'react'

const ThemeSwitcher = () => {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const isDarkMode = localStorage.getItem('dark-mode')
    if (isDarkMode !== undefined && isDarkMode !== null) {
      setDarkMode(isDarkMode === 'true')
    } else {
      localStorage.setItem('dark-mode', darkMode.toString())
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    localStorage.setItem('dark-mode', (!darkMode).toString())
    document.documentElement.classList.toggle('dark', !darkMode)
  }

  return (
    // <button onClick={toggleDarkMode}>
    //   {darkMode ? '切换到白天模式' : '切换到黑夜模式'}
    // </button>
    <></>
  )
}

export default ThemeSwitcher
