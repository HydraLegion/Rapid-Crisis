import { useEffect } from 'react'
import useStore from '../store/useStore'
import ToastProvider from '../components/shared/ToastProvider'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  const seed = useStore(s => s.seed)

  // Seed mock data once on first load
  useEffect(() => { seed() }, [seed])

  return (
    <ToastProvider>
      <Component {...pageProps} />
    </ToastProvider>
  )
}
