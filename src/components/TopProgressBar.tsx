import { useEffect, useState, createContext, useContext } from 'react'
import { useLocation } from 'react-router-dom'

interface ProgressContextType {
  setProgress: (progress: number) => void
  startProgress: () => void
  completeProgress: () => void
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within TopProgressBar provider')
  }
  return context
}

export default function TopProgressBar({ children }: { children?: React.ReactNode }) {
  const [progress, setProgressState] = useState(0)
  const [show, setShow] = useState(false)
  const location = useLocation()

  const setProgress = (value: number) => {
    setProgressState(Math.min(100, Math.max(0, value)))
    if (value > 0 && !show) {
      setShow(true)
    }
  }

  const startProgress = () => {
    setShow(true)
    setProgressState(0)
  }

  const completeProgress = () => {
    setProgressState(100)
    setTimeout(() => {
      setShow(false)
      setProgressState(0)
    }, 300)
  }

  useEffect(() => {
    // Reset and start progress on route change
    startProgress()

    // Simulate initial progress
    const timer1 = setTimeout(() => setProgress(20), 50)
    const timer2 = setTimeout(() => setProgress(40), 150)
    const timer3 = setTimeout(() => setProgress(70), 300)

    // Complete progress after navigation
    const timer4 = setTimeout(() => {
      completeProgress()
    }, 500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [location.pathname])

  return (
    <ProgressContext.Provider value={{ setProgress, startProgress, completeProgress }}>
      {children}
      {show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            zIndex: 10000,
            background: 'transparent',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--mint), var(--sky), var(--coral))',
              transition: progress < 100 ? 'width 0.3s ease-out' : 'width 0.2s ease-in',
              boxShadow: '0 0 10px rgba(68, 176, 144, 0.5)',
              borderRadius: '0 0 2px 2px'
            }}
          />
        </div>
      )}
    </ProgressContext.Provider>
  )
}

