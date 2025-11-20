import React from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Base Skeleton component with shimmer animation
 */
export function Skeleton({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px',
  className = '',
  style = {}
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s ease-in-out infinite',
        ...style
      }}
    />
  )
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        border: '1px solid var(--border-light)'
      }}
    >
      <Skeleton width="100%" height="200px" borderRadius="var(--radius-sm)" />
      <Skeleton width="80%" height="20px" />
      <Skeleton width="60%" height="16px" />
      <Skeleton width="40%" height="24px" />
    </div>
  )
}

/**
 * Order Card Skeleton
 */
export function OrderCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid var(--border-light)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="150px" height="20px" />
        <Skeleton width="80px" height="24px" borderRadius="8px" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <Skeleton width="100%" height="60px" borderRadius="6px" />
        <Skeleton width="100%" height="60px" borderRadius="6px" />
        <Skeleton width="100%" height="60px" borderRadius="6px" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
        <Skeleton width="100px" height="24px" />
        <Skeleton width="120px" height="36px" borderRadius="6px" />
      </div>
    </div>
  )
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton() {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '12px', alignItems: 'center' }}>
      <Skeleton width="60px" height="60px" borderRadius="6px" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="60%" height="16px" />
        <Skeleton width="40%" height="14px" />
      </div>
      <Skeleton width="80px" height="32px" borderRadius="6px" />
    </div>
  )
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={{ padding: '12px' }}>
          <Skeleton width="80%" height="16px" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Page Skeleton - for full page loading
 */
export function PageSkeleton() {
  return (
    <div style={{ padding: '2rem', background: 'var(--cream)' }}>
      <Skeleton width="200px" height="32px" style={{ marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Add CSS animation
const style = document.createElement('style')
style.textContent = `
  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`
document.head.appendChild(style)

