import { useState } from 'react'
import { useCart } from '@context/CartContext'

export default function CheckoutPage() {
  const { state, totalPrice, clear } = useCart()
  const [placed, setPlaced] = useState(false)

  if (placed) {
    return (
      <div className="pastel-card" style={{ padding: 24, textAlign: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Order placed</h2>
        <p>Thank you for choosing TinyTales. A confirmation has been sent to your email.</p>
      </div>
    )
  }

  return (
    <section className="pastel-card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <form style={{ padding: 18 }} onSubmit={e => { e.preventDefault(); clear(); setPlaced(true) }}>
          <h2 style={{ marginTop: 0 }}>Checkout</h2>
          <div style={field}><label>Name</label><input required placeholder="Parent name" /></div>
          <div style={field}><label>Email</label><input required type="email" placeholder="you@example.com" /></div>
          <div style={field}><label>Address</label><input required placeholder="123 Pastel St" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={field}><label>City</label><input required /></div>
            <div style={field}><label>Postal code</label><input required /></div>
          </div>
          <button type="submit" style={payBtn}>Pay ${totalPrice.toFixed(2)}</button>
        </form>
        <div style={{ padding: 18, background: 'var(--cream)' }}>
          <h3 style={{ marginTop: 0 }}>Summary</h3>
          {state.items.map(i => (
            <div key={i.id + (i.size ?? '')} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>{i.name} × {i.quantity}</div>
              <div>${(i.price * i.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ borderTop: '1px dashed #d9d9d9', marginTop: 10, paddingTop: 10, fontWeight: 700 }}>Total ${totalPrice.toFixed(2)}</div>
        </div>
      </div>
    </section>
  )
}

const field: React.CSSProperties = { display: 'grid', gap: 6, marginBottom: 10 }
const payBtn: React.CSSProperties = {
  marginTop: 8,
  background: 'linear-gradient(135deg, var(--sky), var(--mint))',
  color: '#fff',
  border: 'none',
  padding: '12px 16px',
  borderRadius: 14,
  cursor: 'pointer',
  fontWeight: 800
}

const inputStyle: React.CSSProperties = {}

// globally style inputs via element selectors
const style = document.createElement('style')
style.innerHTML = `
  input { padding: 10px 12px; border: 1px solid #e1e1e1; border-radius: 10px; }
  input:focus { outline: 2px solid var(--sky); border-color: transparent; }
`
document.head.append(style)


