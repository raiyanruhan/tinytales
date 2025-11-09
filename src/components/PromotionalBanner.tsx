import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { products } from '@data/products'
import { TakaIcon } from './Icons'

export default function PromotionalBanner() {
  const [count, setCount] = useState(0)
  const targetCount = 30

  useEffect(() => {
    if (count < targetCount) {
      const timer = setTimeout(() => setCount(count + 1), 50)
      return () => clearTimeout(timer)
    }
  }, [count, targetCount])

  const saleProducts = products.slice(0, 3)

  return (
    <section style={{
      background: 'linear-gradient(135deg, var(--coral) 0%, var(--sunshine) 100%)',
      padding: '80px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48,
          alignItems: 'center'
        }}>
          <div style={{ color: '#fff' }}>
            <div style={{
              fontSize: 120,
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: 16,
              textShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}>
              {count}%
            </div>
            <h2 style={{
              fontSize: 42,
              marginBottom: 16,
              color: '#fff'
            }}>
              Off Everything
            </h2>
            <p style={{
              fontSize: 20,
              marginBottom: 32,
              opacity: 0.95
            }}>
              Limited time only! Stock up on essentials for your little ones.
            </p>
            <Link
              to="/category/Sets"
              className="btn-primary"
              style={{
                background: 'var(--white)',
                color: 'var(--coral)',
                display: 'inline-block'
              }}
            >
              Shop Sale →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 16
          }}>
            {saleProducts.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                style={{
                  background: 'var(--white)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
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
                <div style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--coral)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    <TakaIcon size="sm" style={{ fontSize: '16px' }} />
                    {product.price.toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div aria-hidden style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: 120,
        height: 120,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
    </section>
  )
}

