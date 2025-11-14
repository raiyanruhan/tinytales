import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { useCart } from '@context/CartContext'
import { getWishlist, removeFromWishlist } from '@services/wishlistApi'
import { getProduct } from '@services/productApi'
import { Product } from '@services/productApi'
import { HeartIcon, TakaIcon } from '@components/Icons'
import { getImageUrl } from '@utils/imageUrl'
import LoadingButton from '@components/LoadingButton'
import ProtectedRoute from '@components/ProtectedRoute'
import { toast } from '@utils/toast'

function WishlistContent() {
  const { user } = useAuth()
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (user) {
      loadWishlist()
    }
  }, [user])

  const loadWishlist = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError('')
      const productIds = await getWishlist(user.id)
      
      if (productIds.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      const productPromises = productIds.map(id => 
        getProduct(id).catch(() => null)
      )
      
      const loadedProducts = await Promise.all(productPromises)
      const validProducts = loadedProducts.filter((p): p is Product => p !== null)
      setProducts(validProducts)
    } catch (err) {
      console.error('Error loading wishlist:', err)
      setError('Failed to load wishlist. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId: string) => {
    if (!user) return
    
    const product = products.find(p => p.id === productId)
    try {
      await removeFromWishlist(user.id, productId)
      setProducts(products.filter(p => p.id !== productId))
      toast.info('Removed from wishlist', {
        description: product?.name || 'Product',
      })
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      setError('Failed to remove item. Please try again.')
      toast.error('Failed to remove from wishlist', {
        description: 'Please try again',
      })
    }
  }

  const getProductImage = (product: Product) => {
    if (product.image) return product.image
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      const firstColor = product.colors[0]
      if (typeof firstColor === 'object' && 'images' in firstColor && firstColor.images.length > 0) {
        return firstColor.images[0]
      }
    }
    return ''
  }

  if (loading) {
    return (
      <section style={{ padding: '64px 0', background: 'var(--cream)', minHeight: '60vh' }}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 18, color: 'var(--navy)' }}>Loading wishlist...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="wishlist-page" style={{ padding: '64px 0', background: 'var(--cream)', minHeight: '60vh' }}>
      <div className="container">
        <div className="wishlist-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ margin: 0 }}>My Wishlist</h1>
          {products.length > 0 && (
            <div style={{ fontSize: 14, color: 'var(--navy)', fontWeight: 600 }}>
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </div>
          )}
        </div>

        {error && (
          <div className="pastel-card" style={{
            padding: '16px 24px',
            background: 'var(--coral)',
            color: 'var(--white)',
            marginBottom: 24,
            borderRadius: 'var(--radius-md)'
          }}>
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="pastel-card" style={{
            padding: '64px 32px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: 24, color: 'var(--coral)' }}>
              <HeartIcon size="4x" style={{ fontSize: 64 }} />
            </div>
            <h2 style={{ marginBottom: 16 }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--navy)', marginBottom: 32 }}>
              Start adding items to your wishlist to see them here!
            </p>
            <Link to="/products" className="btn-primary">
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24
          }}>
            {products.map(product => {
              const imageUrl = getProductImage(product)
              return (
                <div
                  key={product.id}
                  className="pastel-card"
                  style={{
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    position: 'relative'
                  }}
                >
                  <button
                    onClick={() => handleRemove(product.id)}
                    aria-label="Remove from wishlist"
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 40,
                      height: 40,
                      background: 'rgba(255, 255, 255, 0.98)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
                      border: 'none',
                      cursor: 'pointer',
                      zIndex: 2,
                      color: 'var(--coral)',
                      transition: 'all 0.3s ease-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.18)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.12)'
                    }}
                  >
                    <HeartIcon size="lg" />
                  </button>

                  <Link
                    to={`/product/${product.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{
                      aspectRatio: '4/3',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--paper)',
                      marginBottom: 12
                    }}>
                      <img
                        src={getImageUrl(imageUrl)}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>

                    <div>
                      <div style={{
                        fontSize: 11,
                        color: 'var(--sky)',
                        marginBottom: 8,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {product.category}
                      </div>
                      <h3 style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: 'var(--ink)',
                        marginBottom: 12,
                        lineHeight: 1.4
                      }}>
                        {product.name}
                      </h3>
                      <div style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: 'var(--navy)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <TakaIcon size="sm" style={{ fontSize: '18px' }} />
                        {product.price.toFixed(2)}
                      </div>
                    </div>
                  </Link>

                  <LoadingButton
                    onClick={async () => {
                      await new Promise(resolve => setTimeout(resolve, 500))
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: imageUrl,
                        size: product.sizes?.[0]
                      }, 1)
                    }}
                    loadingKey={`add-to-cart-wishlist-${product.id}`}
                    variant="primary"
                    size="md"
                    style={{ width: '100%' }}
                  >
                    Add to Cart
                  </LoadingButton>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 767px) {
          .wishlist-page {
            padding: 32px 0 !important;
          }
          .wishlist-header {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .wishlist-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .wishlist-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  )
}

export default function Wishlist() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  )
}

