import { createContext, useContext, useState, ReactNode } from 'react'

interface AlertOptions {
  title?: string
  message: string
  type?: 'info' | 'success' | 'error' | 'warning'
  onClose?: () => void
}

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
}

interface PromptOptions {
  title?: string
  message: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
  onConfirm: (value: string) => void
  onCancel?: () => void
}

interface ModalContextType {
  showAlert: (options: AlertOptions) => void
  showConfirm: (options: ConfirmOptions) => void
  showPrompt: (options: PromptOptions) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertOptions | null>(null)
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null)
  const [prompt, setPrompt] = useState<PromptOptions | null>(null)

  const showAlert = (options: AlertOptions) => {
    setAlert(options)
  }

  const showConfirm = (options: ConfirmOptions) => {
    setConfirm(options)
  }

  const showPrompt = (options: PromptOptions) => {
    setPrompt(options)
  }

  const closeAlert = () => {
    if (alert?.onClose) alert.onClose()
    setAlert(null)
  }

  const handleConfirm = () => {
    if (confirm) {
      confirm.onConfirm()
      setConfirm(null)
    }
  }

  const handleCancel = () => {
    if (confirm?.onCancel) confirm.onCancel()
    setConfirm(null)
  }

  const handlePromptConfirm = (value: string) => {
    if (prompt) {
      prompt.onConfirm(value)
      setPrompt(null)
    }
  }

  const handlePromptCancel = () => {
    if (prompt?.onCancel) prompt.onCancel()
    setPrompt(null)
  }

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      
      {/* Alert Modal */}
      {alert && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 20
          }}
          onClick={closeAlert}
        >
          <div
            className="pastel-card"
            style={{
              maxWidth: 400,
              width: '100%',
              padding: 24,
              maxHeight: '90vh',
              overflow: 'auto',
              background: 'var(--white)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {alert.title && (
              <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
                {alert.title}
              </h2>
            )}
            <p style={{ marginBottom: 24, color: 'var(--navy)', lineHeight: 1.6 }}>
              {alert.message}
            </p>
            <button
              onClick={closeAlert}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'var(--mint)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--navy)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--mint)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 20
          }}
          onClick={handleCancel}
        >
          <div
            className="pastel-card"
            style={{
              maxWidth: 400,
              width: '100%',
              padding: 24,
              background: 'var(--white)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {confirm.title && (
              <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
                {confirm.title}
              </h2>
            )}
            <p style={{ marginBottom: 24, color: 'var(--navy)', lineHeight: 1.6 }}>
              {confirm.message}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  background: 'var(--white)',
                  color: 'var(--navy)',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--cream)'
                  e.currentTarget.style.borderColor = 'var(--mint)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--white)'
                  e.currentTarget.style.borderColor = 'var(--border-medium)'
                }}
              >
                {confirm.cancelText || 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  padding: '10px 20px',
                  background: 'var(--mint)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--navy)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--mint)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {confirm.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      {prompt && (
        <PromptModal
          options={prompt}
          onConfirm={handlePromptConfirm}
          onCancel={handlePromptCancel}
        />
      )}
    </ModalContext.Provider>
  )
}

function PromptModal({ 
  options, 
  onConfirm, 
  onCancel 
}: { 
  options: PromptOptions
  onConfirm: (value: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(options.defaultValue || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(value)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 20
      }}
      onClick={onCancel}
    >
      <div
        className="pastel-card"
        style={{
          maxWidth: 400,
          width: '100%',
          padding: 24,
          background: 'var(--white)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {options.title && (
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
            {options.title}
          </h2>
        )}
        <form onSubmit={handleSubmit}>
          <p style={{ marginBottom: 12, color: 'var(--navy)', lineHeight: 1.6 }}>
            {options.message}
          </p>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={options.placeholder}
            autoFocus
            style={{
              width: '100%',
              padding: '12px',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              marginBottom: 24,
              boxSizing: 'border-box'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onCancel()
              }
            }}
          />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                background: 'var(--white)',
                color: 'var(--navy)',
                border: '1.5px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--cream)'
                e.currentTarget.style.borderColor = 'var(--mint)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--white)'
                e.currentTarget.style.borderColor = 'var(--border-medium)'
              }}
            >
              {options.cancelText || 'Cancel'}
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: 'var(--mint)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--navy)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--mint)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {options.confirmText || 'OK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

