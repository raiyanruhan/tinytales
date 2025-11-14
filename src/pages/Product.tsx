import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct as getProductFromApi } from '@services/productApi'
import { getProduct as getProductFromData, products as fallbackProducts } from '@data/products'
import QuantitySelector from '@components/QuantitySelector'
import { useCart } from '@context/CartContext'
import { useAuth } from '@context/AuthContext'
import { Link } from 'react-router-dom'
import { Product } from '@services/productApi'
import ImageZoom from '@components/ImageZoom'
import { TakaIcon, HeartIcon, HeartOutlineIcon } from '@components/Icons'
import LoadingButton from '@components/LoadingButton'
import { getImageUrl } from '@utils/imageUrl'
import { addToWishlist, removeFromWishlist, isInWishlist as checkInWishlist } from '@services/wishlistApi'
import { toast } from '@utils/toast'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [size, setSize] = useState<string | undefined>()
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const { addItem } = useCart()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    loadProduct()
  }, [id])

  useEffect(() => {
    if (product && user && isAuthenticated) {
      checkWishlistStatus()
    }
  }, [product, user, isAuthenticated])

  const loadProduct = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const data = await getProductFromApi(id)
      setProduct(data)
      setSize(data.sizes[0])
      
      // Set initial color
      if (Array.isArray(data.colors) && data.colors.length > 0) {
        const firstColor = data.colors[0]
        if (typeof firstColor === 'object' && 'name' in firstColor) {
          setSelectedColor(firstColor.name)
        } else if (typeof firstColor === 'string') {
          setSelectedColor(firstColor)
        }
      }
    } catch (error) {
      console.error('Failed to load product from API, using fallback:', error)
      const fallback = getProductFromData(id)
      if (fallback) {
        setProduct(fallback as Product)
        setSize(fallback.sizes[0])
        if (Array.isArray(fallback.colors) && fallback.colors.length > 0) {
          const firstColor = fallback.colors[0]
          if (typeof firstColor === 'object' && 'name' in firstColor) {
            setSelectedColor(firstColor.name)
          } else if (typeof firstColor === 'string') {
            setSelectedColor(firstColor)
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Get all images from all colors
  const getAllImages = () => {
    const images: Array<{ url: string; color: string; index: number }> = []
    
    if (product?.image) {
      images.push({ url: product.image, color: 'Main', index: 0 })
    }
    
    if (product?.colors) {
      product.colors.forEach((color, colorIndex) => {
        if (typeof color === 'object' && 'images' in color && Array.isArray(color.images)) {
          color.images.forEach((img, imgIndex) => {
            if (img && !images.some(i => i.url === img)) {
              images.push({ 
                url: img, 
                color: color.name || `Color ${colorIndex + 1}`, 
                index: images.length 
              })
            }
          })
        }
      })
    }
    
    return images.length > 0 ? images : [{ url: '', color: 'Default', index: 0 }]
  }

  const allImages = getAllImages()
  const currentImage = allImages[selectedImageIndex] || allImages[0]

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

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName)
    // Find first image of selected color
    const colorImages = allImages.filter(img => img.color === colorName)
    if (colorImages.length > 0) {
      setSelectedImageIndex(allImages.findIndex(img => img.url === colorImages[0].url))
    }
  }

  const checkWishlistStatus = async () => {
    if (!product || !user) return
    try {
      const status = await checkInWishlist(user.id, product.id)
      setInWishlist(status)
    } catch (error) {
      console.error('Error checking wishlist status:', error)
      // Set to false on error to prevent UI inconsistency
      setInWishlist(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || !user || !product) {
      return
    }

    setWishlistLoading(true)
    try {
      if (inWishlist) {
        const result = await removeFromWishlist(user.id, product.id)
        // Verify the product was actually removed
        if (result && !result.includes(product.id)) {
          setInWishlist(false)
          toast.info('Removed from wishlist', {
            description: product.name,
          })
        } else {
          // Re-check status if something went wrong
          await checkWishlistStatus()
          toast.error('Failed to remove from wishlist', {
            description: 'Please try again',
          })
        }
      } else {
        console.log('Adding to wishlist:', { userId: user.id, productId: product.id })
        const result = await addToWishlist(user.id, product.id)
        console.log('Wishlist API result:', result, 'Type:', typeof result, 'Is array:', Array.isArray(result))
        // Verify the product was actually added
        if (result && Array.isArray(result) && result.includes(product.id)) {
          setInWishlist(true)
          toast.success('Added to wishlist', {
            description: product.name,
          })
          console.log('Wishlist successfully added. Setting UI to true.')
          // Double-check by re-fetching status
          setTimeout(async () => {
            const status = await checkInWishlist(user.id, product.id)
            console.log('Double-check wishlist status:', status)
            setInWishlist(status)
          }, 500)
        } else {
          console.error('Wishlist result validation failed:', { result, productId: product.id })
          // Re-check status if something went wrong
          await checkWishlistStatus()
          toast.error('Failed to add to wishlist', {
            description: 'Please try again',
          })
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      // Re-check status on error to sync with server
      await checkWishlistStatus()
      toast.error('Failed to update wishlist', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setWishlistLoading(false)
    }
  }

  return (
    <section style={{ padding: '64px 0', background: 'var(--cream)' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
          alignItems: 'start'
        }}
        className="product-page-grid"
        >
          {/* Image Gallery */}
          <div>
            {/* Main Image with Zoom */}
            <div style={{
              position: 'relative',
              aspectRatio: '4/3',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: 'var(--white)',
              marginBottom: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
              <ImageZoom
                src={getImageUrl(currentImage.url)}
                alt={product.name}
                imagePosition={(product as any).imagePosition}
                style={{
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollbarWidth: 'thin'
              }}>
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      flexShrink: 0,
                      width: '80px',
                      height: '80px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: selectedImageIndex === index ? '3px solid var(--mint)' : '2px solid var(--border-light)',
                      background: 'var(--white)',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.2s ease-out'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedImageIndex !== index) {
                        e.currentTarget.style.borderColor = 'var(--mint)'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedImageIndex !== index) {
                        e.currentTarget.style.borderColor = 'var(--border-light)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }
                    }}
                  >
                    <img
                      src={getImageUrl(img.url)}
                      alt={`${product.name} - ${img.color}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        pointerEvents: 'none'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="product-details" style={{ padding: '0 0 0 32px' }}>
            <div style={{
              fontSize: 11,
              color: 'var(--sky)',
              fontWeight: 700,
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              {product.category}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              <h1 style={{ 
                margin: 0,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                color: 'var(--ink)',
                lineHeight: 1.3,
                fontWeight: 700
              }}>
                {product.name}
              </h1>
              <span style={{
                background: 'var(--mint)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'monospace',
                letterSpacing: '0.5px'
              }}>
                ID: {product.id}
              </span>
            </div>
            
            <div style={{
              fontSize: 24,
              fontWeight: 800,
              color: 'var(--navy)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <TakaIcon size="md" style={{ fontSize: '22px' }} />
              {product.price.toFixed(2)}
            </div>

            {/* Badges */}
            {product.badges && product.badges.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
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
            
            <p style={{
              fontSize: 14,
              color: 'var(--navy)',
              lineHeight: 1.6,
              marginBottom: 28,
              textAlign: 'justify',
              textAlignLast: 'left'
            }}>
              {product.description}
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ 
                marginBottom: 28,
                padding: '20px',
                background: 'var(--white)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14
                }}>
                  <label style={{
                    fontWeight: 700,
                    color: 'var(--ink)',
                    fontSize: 14,
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase'
                  }}>
                    Color
                  </label>
                  <span style={{
                    fontSize: 13,
                    color: 'var(--navy)',
                    fontWeight: 500
                  }}>
                    {selectedColor}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.colors.map((color, index) => {
                    const colorName = typeof color === 'object' && 'name' in color ? color.name : color
                    const isSelected = selectedColor === colorName
                    return (
                      <button
                        key={index}
                        onClick={() => handleColorSelect(colorName)}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--mint)' : '1.5px solid var(--border-medium)',
                          background: isSelected ? 'var(--mint)' : 'var(--white)',
                          color: isSelected ? '#fff' : 'var(--navy)',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          boxShadow: isSelected ? '0 2px 8px rgba(68, 176, 144, 0.2)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--mint)'
                            e.currentTarget.style.background = 'var(--paper)'
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-medium)'
                            e.currentTarget.style.background = 'var(--white)'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                          }
                        }}
                      >
                        {colorName}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div style={{ 
              marginBottom: 28,
              padding: '20px',
              background: 'var(--white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14
              }}>
                <label style={{
                  fontWeight: 700,
                  color: 'var(--ink)',
                  fontSize: 14,
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase'
                }}>
                  Size
                </label>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--mint)',
                    background: 'transparent',
                    color: 'var(--mint)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--mint)'
                    e.currentTarget.style.color = 'var(--white)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--mint)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Size Guide
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.sizes.map(s => {
                  const isSelected = s === size
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid var(--mint)' : '1.5px solid var(--border-medium)',
                        background: isSelected ? 'var(--mint)' : 'var(--white)',
                        color: isSelected ? '#fff' : 'var(--navy)',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        minWidth: '60px',
                        boxShadow: isSelected ? '0 2px 8px rgba(68, 176, 144, 0.2)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--mint)'
                          e.currentTarget.style.background = 'var(--paper)'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-medium)'
                          e.currentTarget.style.background = 'var(--white)'
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }
                      }}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Add to Cart and Wishlist */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginBottom: 24
            }}>
              <div style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center'
              }}>
                <QuantitySelector value={qty} onChange={setQty} />
                <LoadingButton
                  onClick={async () => {
                    // Small delay to show loader
                    await new Promise(resolve => setTimeout(resolve, 500))
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: currentImage.url,
                      size
                    }, qty)
                  }}
                  loadingKey={`add-to-cart-${product.id}`}
                  variant="primary"
                  size="md"
                  style={{ flex: 1 }}
                >
                  Add to Cart
                </LoadingButton>
              </div>
              {isAuthenticated ? (
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: inWishlist ? '2px solid var(--coral)' : '2px solid var(--border-medium)',
                    background: inWishlist ? 'var(--coral)' : 'var(--white)',
                    color: inWishlist ? 'var(--white)' : 'var(--navy)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: wishlistLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease-out',
                    opacity: wishlistLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!wishlistLoading) {
                      if (!inWishlist) {
                        e.currentTarget.style.borderColor = 'var(--coral)'
                        e.currentTarget.style.background = 'var(--cream)'
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!wishlistLoading) {
                      if (!inWishlist) {
                        e.currentTarget.style.borderColor = 'var(--border-medium)'
                        e.currentTarget.style.background = 'var(--white)'
                      }
                    }
                  }}
                >
                  {inWishlist ? (
                    <>
                      <HeartIcon size="sm" style={{ fontSize: '16px', color: 'var(--white)' }} />
                      Remove from Wishlist
                    </>
                  ) : (
                    <>
                      <HeartOutlineIcon size="sm" style={{ fontSize: '16px' }} />
                      Add to Wishlist
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to="/login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--border-medium)',
                    background: 'var(--white)',
                    color: 'var(--navy)',
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--coral)'
                    e.currentTarget.style.background = 'var(--cream)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-medium)'
                    e.currentTarget.style.background = 'var(--white)'
                  }}
                >
                  <HeartOutlineIcon size="sm" style={{ fontSize: '16px' }} />
                  Sign in to Add to Wishlist
                </Link>
              )}
            </div>

            {/* Shipping Info */}
            <div style={{
              padding: 18,
              background: 'var(--white)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              color: 'var(--navy)',
              border: '1px solid var(--border-light)',
              lineHeight: 1.6
            }}>
              <div style={{ marginBottom: 10, fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>
                Shipping & Returns
              </div>
              <div>
                <div style={{ marginBottom: 6 }}>Free shipping on orders over <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><TakaIcon size="xs" style={{ fontSize: '11px' }} />50</span></div>
                <div style={{ marginBottom: 6 }}>Easy 30-day returns</div>
                <div>Secure checkout</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '100px 20px 20px 20px'
          }}
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="pastel-card"
            style={{
              maxWidth: '600px',
              maxHeight: 'calc(100vh - 120px)',
              width: '90vw',
              padding: 0,
              position: 'relative',
              overflow: 'hidden',
              background: 'var(--white)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-light)',
              flexShrink: 0
            }}>
              <h2 style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--ink)'
              }}>
                Size Guide
              </h2>
              <button
                onClick={() => setShowSizeGuide(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'var(--cream)',
                  color: 'var(--navy)',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--coral)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--cream)'
                  e.currentTarget.style.color = 'var(--navy)'
                }}
              >
                ×
              </button>
            </div>

            {/* Image Container */}
            <div style={{
              padding: '24px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'auto',
              flex: 1,
              minHeight: 0
            }}>
              <img
                src="/size.jpeg"
                alt="Size Guide"
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 220px)',
                  width: 'auto',
                  height: 'auto',
                  borderRadius: 'var(--radius-sm)',
                  display: 'block',
                  margin: '0 auto',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3ESize Guide Not Found%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 767px) {
          .product-page-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .product-details {
            padding: 0 !important;
          }
          .product-page-grid > div:first-child {
            order: 1;
          }
          .product-page-grid > div:last-child {
            order: 2;
          }
          button {
            min-height: 44px !important;
          }
        }
      `}</style>
    </section>
  )
}
