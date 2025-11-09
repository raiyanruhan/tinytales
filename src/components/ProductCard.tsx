import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '@context/CartContext'
import type { Product as DataProduct } from '@data/products'
import type { Product as ApiProduct } from '@services/productApi'
import { HeartIcon, HeartOutlineIcon } from './Icons'

type Product = DataProduct | ApiProduct;

export default function ProductCard({ product }: { product: Product }) {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const { addItem } = useCart()

  // Get image from product - handle both formats
  const getProductImage = () => {
    if (product.image) return product.image;
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      const firstColor = product.colors[0];
      if (typeof firstColor === 'object' && 'images' in firstColor && firstColor.images.length > 0) {
        return firstColor.images[0];
      }
    }
    return '';
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: getProductImage(),
      size: product.sizes[0]
    }, 1)
    setShowQuickAdd(false)
  }

  return (
    <div
      className="pastel-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'var(--transition)'
      }}
      onMouseEnter={() => setShowQuickAdd(true)}
      onMouseLeave={() => setShowQuickAdd(false)}
    >
      <Link to={`/product/${product.id}`} style={{ display: 'block' }}>
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
          <img 
            src={getProductImage()} 
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          />
          
          {product.badges && (
            <div style={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              {product.badges.map(badge => (
                <span
                  key={badge}
                  className={badge === 'Sale' ? 'badge badge-sale' : 'badge'}
                  style={{
                    background: badge === 'Sale' ? 'var(--coral)' : 'var(--mint)'
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFavorite(!isFavorite)
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="btn-3d-small"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 44,
              height: 44,
              background: 'rgba(255,255,255,0.95)',
              transform: isFavorite ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            {isFavorite ? <HeartIcon size="lg" /> : <HeartOutlineIcon size="lg" />}
          </button>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{
            fontSize: 12,
            color: 'var(--navy)',
            marginBottom: 6,
            fontWeight: 600
          }}>
            {product.category}
          </div>
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--ink)',
            marginBottom: 8,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.name}
          </h3>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--navy)'
          }}>
            ${product.price.toFixed(2)}
          </div>
        </div>
      </Link>

      {showQuickAdd && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--mint)',
            padding: 12,
            transform: 'translateY(0)',
            transition: 'transform 0.3s',
            zIndex: 10
          }}
        >
          <button
            onClick={handleQuickAdd}
            className="btn-3d"
            style={{
              width: '100%',
              background: 'var(--white)',
              color: 'var(--mint)',
              fontSize: 16
            }}
          >
            Quick Add to Cart
          </button>
        </div>
      )}
    </div>
  )
}
