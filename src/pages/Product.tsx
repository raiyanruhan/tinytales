import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct as getProductFromApi } from '@services/productApi'
import { getProduct as getProductFromData, products as fallbackProducts } from '@data/products'
import QuantitySelector from '@components/QuantitySelector'
import { useCart } from '@context/CartContext'
import { Link } from 'react-router-dom'
import { Product } from '@services/productApi'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [size, setSize] = useState<string | undefined>()
  const { addItem } = useCart()

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const data = await getProductFromApi(id)
      setProduct(data)
      setSize(data.sizes[0])
    } catch (error) {
      console.error('Failed to load product from API, using fallback:', error)
      // Fallback to static data if API fails
      const fallback = getProductFromData(id)
      if (fallback) {
        setProduct(fallback as Product)
        setSize(fallback.sizes[0])
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section style={{ padding: '64px 0', background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 18, color: 'var(--navy)' }}>Loading product...</div>
          </div>
        </div>
      </section>
    )
  }

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

  // Handle both old format (string[]) and new format (ProductColor[])
  const getProductImage = () => {
    if (product.image) return product.image
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      const firstColor = product.colors[0]
      if (typeof firstColor === 'object' && 'images' in firstColor && firstColor.images.length > 0) {
        return firstColor.images[0]
      }
    }
    return ''
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
                src={getProductImage().startsWith('http') ? getProductImage() : `http://localhost:3001${getProductImage()}`}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
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
                      className="btn-3d"
                      style={{
                        background: s === size ? 'var(--mint)' : 'var(--white)',
                        color: s === size ? '#fff' : 'var(--navy)',
                        padding: '12px 24px',
                        fontSize: 16,
                        minWidth: 'auto'
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
                      image: getProductImage(),
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
