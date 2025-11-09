import React from 'react'

interface ButtonLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export default function ButtonLoader({ size = 'md', color = 'currentColor' }: ButtonLoaderProps) {
  const sizeMap = {
    sm: 14,
    md: 18,
    lg: 22
  }

  const spinnerSize = sizeMap[size]
  const borderWidth = size === 'sm' ? 2.5 : size === 'lg' ? 3.5 : 3

  // Create a more visible spinner with better contrast
  const getBorderColor = () => {
    if (color === 'currentColor' || color === '#fff' || color === 'white') {
      return 'rgba(255, 255, 255, 0.3)'
    }
    // Convert hex to rgba with transparency
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, 0.3)`
    }
    // Handle CSS variables - use white as fallback
    if (color.includes('var(')) {
      return 'rgba(255, 255, 255, 0.3)'
    }
    return color.includes('rgba') ? color.replace(/[\d\.]+\)$/g, '0.3)') : `${color}4D`
  }

  const getTopColor = () => {
    if (color === 'currentColor' || color === '#fff' || color === 'white') {
      return '#fff'
    }
    if (color.startsWith('#')) {
      return color
    }
    // For CSS variables, use white
    if (color.includes('var(')) {
      return '#fff'
    }
    return color
  }

  return (
    <span
      style={{
        display: 'inline-block',
        width: spinnerSize,
        height: spinnerSize,
        border: `${borderWidth}px solid ${getBorderColor()}`,
        borderTopColor: getTopColor(),
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}
    />
  )
}

