import { StarIcon } from './Icons'

export default function TrustMarquee() {
  const partners = [
    'Trusted by 10,000+ families',
    'Free shipping in India',
    '30-day easy returns',
    '100% natural fabrics',
    'Safe for sensitive skin',
    'Made with love'
  ]

  return (
    <section style={{
      background: 'var(--cream)',
      padding: '32px 0',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        gap: 48,
        animation: 'marquee 30s linear infinite',
        whiteSpace: 'nowrap'
      }}>
        {[...partners, ...partners].map((text, i) => (
          <div
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--navy)'
            }}
          >
            <StarIcon size="sm" style={{ fontSize: 16 }} />
            <span>{text}</span>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}

