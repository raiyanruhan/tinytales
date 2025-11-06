import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section style={{
      minHeight: '70vh',
      background: 'linear-gradient(135deg, var(--cream) 0%, var(--paper) 100%)',
      padding: '64px 0',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: 64,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div>
          <h1 style={{
            marginBottom: 24,
            lineHeight: 1.1,
            fontSize: 'clamp(2.5rem, 5vw, 4rem)'
          }}>
            <span style={{ color: 'var(--mint)' }}>Clothing</span>{' '}
            <span style={{ color: 'var(--sky)' }}>for</span>{' '}
            <span style={{ color: 'var(--coral)' }}>Tiny</span>{' '}
            <span style={{ color: 'var(--sunshine)' }}>Stories</span>
          </h1>
          <p style={{
            fontSize: 20,
            color: 'var(--navy)',
            marginBottom: 32,
            lineHeight: 1.6,
            maxWidth: '90%'
          }}>
            Discover playful, comfortable clothing that celebrates every moment of childhood. 
            From first cuddles to big adventures.
          </p>
          <Link to="/category/Newborn" className="btn-primary" style={{ display: 'inline-block' }}>
            Shop Now →
          </Link>
        </div>
        
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '4/3'
        }}>
          <img 
            src="https://res.cloudinary.com/dzjrhl1vi/image/upload/v1762445984/uploads/1762445974326-pexels-photo-929435-removebg-preview.png.png"
            alt="Happy children in TinyTales clothing"
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
      </div>
      
      <div aria-hidden style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: 120,
        height: 120,
        background: 'var(--sunshine)',
        borderRadius: '50%',
        opacity: 0.15,
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }} />
      <div aria-hidden style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        width: 100,
        height: 100,
        background: 'var(--blush)',
        borderRadius: '50%',
        opacity: 0.15,
        animation: 'float 8s ease-in-out infinite',
        zIndex: 0
      }} />
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @media (max-width: 768px) {
          section > div {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  )
}
