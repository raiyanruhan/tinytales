import React from 'react'
import { useLoading } from '@context/LoadingContext'
import ButtonLoader from './ButtonLoader'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingKey?: string
  loading?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'mint' | 'navy'
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingButton({
  loadingKey,
  loading: externalLoading,
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  onClick,
  style,
  ...props
}: LoadingButtonProps) {
  const { isLoading, setButtonLoading } = useLoading()
  
  const internalLoading = loadingKey ? isLoading(loadingKey) : false
  const isDisabled = disabled || externalLoading || internalLoading
  const showLoader = externalLoading || internalLoading

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || !onClick) return
    
    if (loadingKey) {
      setButtonLoading(loadingKey, true)
      try {
        await onClick(e)
      } finally {
        setButtonLoading(loadingKey, false)
      }
    } else {
      onClick(e)
    }
  }

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, var(--mint), var(--sky))',
      color: '#fff'
    },
    secondary: {
      background: 'var(--white)',
      color: 'var(--navy)',
      border: '2px solid var(--navy)'
    },
    mint: {
      background: 'var(--mint)',
      color: 'var(--white)'
    },
    navy: {
      background: 'var(--navy)',
      color: 'var(--white)'
    }
  }

  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: 13 },
    md: { padding: '14px 28px', fontSize: 15 },
    lg: { padding: '20px 40px', fontSize: 18 }
  }

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={isDisabled}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        border: variant === 'secondary' ? '2px solid var(--navy)' : 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease-out',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: isDisabled ? 0.7 : 1,
        ...style
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {showLoader && (
        <ButtonLoader 
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} 
          color={variant === 'primary' || variant === 'mint' || variant === 'navy' ? '#fff' : variantStyles[variant].color} 
        />
      )}
      {children}
    </button>
  )
}

