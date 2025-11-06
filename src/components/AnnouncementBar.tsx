import { useState } from 'react'

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)
  
  if (dismissed) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--mint), var(--sky))',
      color: '#fff',
      padding: '10px 0',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            Use code <strong style={{ background: 'rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: 4 }}>TTNEW10</strong> to get 20% off your first purchase
          </span>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss announcement"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              width: 24,
              height: 24,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

