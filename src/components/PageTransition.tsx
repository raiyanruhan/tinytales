import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div
      key={location.pathname}
      className={`page-transition ${isAnimating ? 'animating' : ''}`}
      style={{
        width: '100%',
        minHeight: '100%'
      }}
    >
      {children}
      <style>{`
        .page-transition {
          width: 100%;
          min-height: 100%;
          animation: pageFadeIn 0.3s ease-in-out;
        }
        
        @keyframes pageFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
