const galleryImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541534401786-2077eed87a1c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526815463689-194d4463ccbf?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1491349174775-aaafddd81942?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520975693416-35a38f3a33ee?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520700014745-cb9b952ebfdb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464347744102-11db6282f854?q=80&w=800&auto=format&fit=crop'
]

export default function SocialFeed() {
  const getRandomRotation = () => Math.random() * 6 - 3

  return (
    <section style={{ padding: '80px 0', background: 'var(--white)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ marginBottom: 12 }}>
            <span style={{ color: 'var(--mint)' }}>#</span>
            <span style={{ color: 'var(--sky)' }}>TinyTales</span>
            <span style={{ color: 'var(--coral)' }}>Family</span>
          </h2>
          <p style={{ fontSize: 18, color: 'var(--navy)' }}>
            Real moments from our loving community
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 24
        }}>
          {galleryImages.map((src, i) => {
            const rotation = getRandomRotation()
            const accentColors = ['var(--mint)', 'var(--sky)', 'var(--coral)', 'var(--sunshine)', 'var(--blush)']
            const accentColor = accentColors[i % accentColors.length]

            return (
              <div
                key={i}
                style={{
                  background: 'var(--white)',
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'var(--transition)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'
                  e.currentTarget.style.zIndex = '10'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1)`
                  e.currentTarget.style.zIndex = '1'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 12,
                  height: 12,
                  background: accentColor,
                  borderRadius: '50%',
                  border: '2px solid var(--white)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
                <div style={{
                  aspectRatio: '1/1',
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 12
                }}>
                  <img
                    src={src}
                    alt={`Community photo ${i + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  fontSize: 12,
                  color: 'var(--navy)',
                  textAlign: 'center',
                  fontWeight: 600
                }}>
                  @tinytales_family
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

