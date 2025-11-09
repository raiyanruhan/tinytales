import { createContext, useContext, useState, ReactNode } from 'react'

interface LoadingContextType {
  buttonLoading: { [key: string]: boolean }
  setButtonLoading: (key: string, loading: boolean) => void
  isLoading: (key: string) => boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [buttonLoading, setButtonLoadingState] = useState<{ [key: string]: boolean }>({})

  const setButtonLoading = (key: string, loading: boolean) => {
    setButtonLoadingState(prev => ({
      ...prev,
      [key]: loading
    }))
  }

  const isLoading = (key: string) => {
    return buttonLoading[key] || false
  }

  return (
    <LoadingContext.Provider value={{ buttonLoading, setButtonLoading, isLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

