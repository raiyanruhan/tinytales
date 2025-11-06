import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="pastel-card" style={{ padding: 24, textAlign: 'center' }}>
      <h2 style={{ marginTop: 0 }}>Page not found</h2>
      <p>Let’s bring you back to something adorable.</p>
      <Link className="badge" to="/" style={{ background: 'var(--mint)' }}>Go home</Link>
    </div>
  )
}


