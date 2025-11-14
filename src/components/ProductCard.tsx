import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '@context/CartContext'
import type { Product as DataProduct } from '@data/products'
import type { Product as ApiProduct } from '@services/productApi'
import { HeartIcon, HeartOutlineIcon, TakaIcon } from './Icons'
import LoadingButton from './LoadingButton'
import { getImageUrl } from '@utils/imageUrl'

type Product = DataProduct | ApiProduct;

export default function ProductCard({ product }: { product: Product }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>('')
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

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.sizes && product.sizes.length > 0) {
      setShowSizeSelector(true)
      if (product.sizes.length === 1) {
        setSelectedSize(product.sizes[0])
      }
    }
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
  }

  const handleConfirmAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (selectedSize) {
      // Simulate a small delay for better UX - enough time to see the loader
      await new Promise(resolve => setTimeout(resolve, 500))
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: getProductImage(),
        size: selectedSize
      }, 1)
      setShowSizeSelector(false)
      setSelectedSize('')
    }
  }

  const handleCancelSizeSelect = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowSizeSelector(false)
    setSelectedSize('')
  }

  return (
    <div
      className="pastel-card product-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Link to={`/product/${product.id}`} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', textDecoration: 'none', color: 'inherit', minHeight: 0 }}>
        <div style={{ 
          position: 'relative', 
          aspectRatio: '4/3', 
          overflow: 'hidden',
          backgroundColor: 'var(--paper)',
          flexShrink: 0
        }}>
          <img 
            src={getImageUrl(getProductImage())} 
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: (product as any).imagePosition 
                ? `${(product as any).imagePosition.x}% ${(product as any).imagePosition.y}%`
                : 'center center',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          />
          
          {product.badges && (
            <div style={{
              position: 'absolute',
              top: 16,
              left: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              zIndex: 2
            }}>
              {product.badges.map(badge => (
                <span
                  key={badge}
                  className={badge === 'Sale' ? 'badge badge-sale' : 'badge'}
                  style={{
                    background: badge === 'Sale' ? 'var(--coral)' : 'var(--mint)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
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
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isFavorite ? 'scale(1.1)' : 'scale(1)',
              zIndex: 2,
              color: isFavorite ? 'var(--coral)' : 'var(--navy)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = isFavorite ? 'scale(1.15)' : 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.18)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = isFavorite ? 'scale(1.1)' : 'scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.12)'
            }}
          >
            {isFavorite ? (
              <HeartIcon size="lg" style={{ color: 'var(--coral)' }} />
            ) : (
              <HeartOutlineIcon size="lg" style={{ color: 'var(--navy)', opacity: 0.8 }} />
            )}
          </button>
        </div>

        <div style={{ 
          padding: '20px 20px 12px',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          minHeight: 0,
          gap: 12
        }}>
          <div style={{ flex: '1 1 auto', minHeight: 0 }}>
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
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--ink)',
              marginBottom: 12,
              lineHeight: 1.4,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              textAlign: 'justify',
              textAlignLast: 'left',
              textJustify: 'inter-word',
              hyphens: 'auto',
              minHeight: '44px'
            }}>
              {product.name}
            </h3>
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 800,
            color: 'var(--navy)',
            letterSpacing: '-0.5px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <TakaIcon size="sm" style={{ fontSize: '18px' }} />
            {product.price.toFixed(2)}
          </div>
        </div>
      </Link>

      <div style={{
        padding: '0 20px 16px',
        flexShrink: 0,
        marginTop: 'auto'
      }}>
        {!showSizeSelector ? (
          <button
            onClick={handleAddToCartClick}
            style={{
              width: '100%',
              background: 'var(--mint)',
              color: 'var(--white)',
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s ease-out',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--navy)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--mint)'
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Add to Cart
          </button>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--navy)',
              marginBottom: '4px'
            }}>
              Select Size
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '4px'
            }}>
              {product.sizes && product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSizeSelect(size)
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedSize === size ? '2px solid var(--mint)' : '1px solid var(--border-light)',
                    background: selectedSize === size ? 'var(--mint)' : 'var(--white)',
                    color: selectedSize === size ? 'var(--white)' : 'var(--navy)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out',
                    minWidth: '50px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSize !== size) {
                      e.currentTarget.style.borderColor = 'var(--mint)'
                      e.currentTarget.style.background = 'var(--cream)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSize !== size) {
                      e.currentTarget.style.borderColor = 'var(--border-light)'
                      e.currentTarget.style.background = 'var(--white)'
                    }
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <LoadingButton
                onClick={handleConfirmAdd}
                disabled={!selectedSize}
                loadingKey={`add-to-cart-${product.id}`}
                variant="mint"
                size="sm"
                style={{
                  flex: 1
                }}
              >
                Confirm
              </LoadingButton>
              <button
                onClick={handleCancelSizeSelect}
                style={{
                  padding: '8px 16px',
                  background: 'var(--white)',
                  color: 'var(--navy)',
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--cream)'
                  e.currentTarget.style.borderColor = 'var(--mint)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--white)'
                  e.currentTarget.style.borderColor = 'var(--border-light)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 767px) {
          .product-card {
            width: 100% !important;
          }
          .product-card button {
            min-height: 44px !important;
            font-size: 14px !important;
            padding: 12px 16px !important;
          }
          .product-card .size-selector button {
            min-height: 44px !important;
            padding: 10px 16px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  )
}
