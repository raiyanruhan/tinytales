import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section
      className="hero-section"
      style={{
        background: 'linear-gradient(135deg, var(--cream) 0%, var(--paper) 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '0 5%',
        marginBottom: 0,
        marginTop: '-160px',
        display: 'block',
      }}
    >
      {/* Floating Decorative Circles */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '140px',
          height: '140px',
          background: 'var(--sunshine)',
          borderRadius: '50%',
          opacity: 0.2,
          animation: 'float 7s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          width: '100px',
          height: '100px',
          background: 'var(--blush)',
          borderRadius: '50%',
          opacity: 0.2,
          animation: 'float 9s ease-in-out infinite reverse',
          zIndex: 0,
        }}
      />

      <div
        className="container"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'start',
          position: 'relative',
          zIndex: 1,
          paddingBottom: 0,
          paddingTop: 0,
        }}
      >
        {/* Text Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: '15rem 0 0 0',
            alignSelf: 'flex-start',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ color: 'var(--mint)' }}>Clothing</span>{' '}
            <span style={{ color: 'var(--sky)' }}>for</span>{' '}
            <span style={{ color: 'var(--coral)' }}>Tiny</span>{' '}
            <span style={{ color: 'var(--sunshine)' }}>Stories</span>
          </h1>

          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--navy)',
              lineHeight: 1.7,
              marginBottom: '2rem',
              maxWidth: '95%',
            }}
          >
            Discover playful, comfortable clothing that celebrates every moment of
            childhood. From first cuddles to big adventures.
          </p>

           <Link
             to="/category/Newborn"
             className="btn-primary"
             style={{
               display: 'inline-block',
               width: 'fit-content',
             }}
           >
             Shop Now →
           </Link>
        </div>

        {/* Image */}
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: 0,
            alignSelf: 'flex-start',
            marginTop: 0,
          }}
        >
          <img
            src="https://res.cloudinary.com/dzjrhl1vi/image/upload/v1762488120/uploads/1762488118792-headless.png.png"
            alt="Happy baby in TinyTales clothing"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              display: 'block',
              verticalAlign: 'top',
            }}
            loading="eager"
          />
        </div>
      </div>

      {/* Floating Animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-25px);
          }
        }

        /* Responsive Adjustments */
        @media (max-width: 992px) {
          .hero-section > div > div {
            grid-template-columns: 1fr !important;
            text-align: center;
          }

          .hero-section > div > div > div:first-child {
            order: 2;
            padding: 1.5rem 0;
          }

          .hero-section > div > div > div:last-child {
            order: 1;
            max-height: 500px;
            aspect-ratio: 1 / 1;
          }

          h1 {
            font-size: clamp(2.2rem, 6vw, 3.5rem) !important;
          }

          p {
            max-width: 100% !important;
            font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 0 1rem;
          }

          .hero-section > div > div {
            gap: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}