import { useState, useEffect } from 'react'
function ErrorBoundary({ children }) {
  const [error, setError] = useState(null)

  useEffect(() => {
    window.addEventListener('error', (event) => {
      setError(event.error)
    })
  }, [])

  if (error) {
    return (
      <div>
        <h1>An error occurred</h1>
        <pre>{error.message}</pre>
      </div>
    )
  }

  return children
}

export default ErrorBoundary
