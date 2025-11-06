import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setEmail('')
      }, 3000)
    }
  }

  return (
    <section style={{
      background: 'linear-gradient(135deg, var(--mint) 0%, var(--sky) 100%)',
      padding: '80px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: 600,
          margin: '0 auto',
          textAlign: 'center',
          color: '#fff'
        }}>
          <h2 style={{
            fontSize: 48,
            marginBottom: 16,
            color: '#fff'
          }}>
            Join the Tiny Club
          </h2>
          <p style={{
            fontSize: 20,
            marginBottom: 32,
            opacity: 0.95
          }}>
            Get 20% off your first order plus exclusive updates and early access to new collections.
          </p>

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            gap: 12,
            maxWidth: 400,
            margin: '0 auto'
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontSize: 16,
                fontFamily: 'inherit'
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                background: 'var(--white)',
                color: 'var(--mint)',
                padding: '16px 32px',
                whiteSpace: 'nowrap'
              }}
            >
              {submitted ? '✓ Joined!' : 'Subscribe'}
            </button>
          </form>

          {submitted && (
            <div style={{
              marginTop: 16,
              fontSize: 16,
              animation: 'fadeIn 0.3s'
            }}>
              Welcome to the Tiny Club! Check your email for your discount code.
            </div>
          )}
        </div>
      </div>

      <div aria-hidden style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: 150,
        height: 150,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div aria-hidden style={{
        position: 'absolute',
        bottom: '15%',
        right: '8%',
        width: 100,
        height: 100,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
    </section>
  )
}

