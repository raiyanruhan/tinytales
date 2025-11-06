import { useParams } from 'react-router-dom'
import { getProduct } from '@data/products'
import QuantitySelector from '@components/QuantitySelector'
import { useState } from 'react'
import { useCart } from '@context/CartContext'
import { Link } from 'react-router-dom'

export default function ProductPage() {
  const { id } = useParams()
  const product = getProduct(id!)
  const [qty, setQty] = useState(1)
  const [size, setSize] = useState(product?.sizes[0])
  const { addItem } = useCart()

  if (!product) {
    return (
      <section style={{ padding: '64px 0', textAlign: 'center' }}>
        <div className="container">
          <h2>Product not found</h2>
          <Link to="/" className="btn-primary" style={{ marginTop: 24, display: 'inline-block' }}>
            Back to Home
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding: '64px 0', background: 'var(--cream)' }}>
      <div className="container">
        <div className="pastel-card" style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 48
          }}>
            <div style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            
            <div style={{ padding: 32 }}>
              <div style={{
                fontSize: 14,
                color: 'var(--mint)',
                fontWeight: 700,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                {product.category}
              </div>
              
              <h1 style={{ marginBottom: 16 }}>{product.name}</h1>
              
              <div style={{
                fontSize: 36,
                fontWeight: 900,
                color: 'var(--navy)',
                marginBottom: 24
              }}>
                ${product.price.toFixed(2)}
              </div>
              
              <p style={{
                fontSize: 16,
                color: 'var(--navy)',
                lineHeight: 1.6,
                marginBottom: 32
              }}>
                {product.description}
              </p>

              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block',
                  fontWeight: 700,
                  marginBottom: 12,
                  color: 'var(--ink)'
                }}>
                  Size
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className="badge"
                      style={{
                        background: s === size ? 'var(--mint)' : 'var(--cream)',
                        color: s === size ? '#fff' : 'var(--navy)',
                        padding: '12px 20px',
                        fontSize: 15,
                        cursor: 'pointer'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                marginBottom: 32
              }}>
                <QuantitySelector value={qty} onChange={setQty} />
                <button
                  onClick={() => {
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      size
                    }, qty)
                  }}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Add to Cart
                </button>
              </div>

              <div style={{
                padding: 16,
                background: 'var(--cream)',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                color: 'var(--navy)'
              }}>
                <strong>Free shipping</strong> on orders over $50. Easy 30-day returns.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
