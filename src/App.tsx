import { useEffect, useState } from 'react'
import { checkConnection } from './data/health'

export function App() {
  const [status, setStatus] = useState('Checking...')

  useEffect(() => {
    checkConnection().then(setStatus)
  }, [])

  return <h1 className="p-8 text-2xl font-bold">{status}</h1>
}