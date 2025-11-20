import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '@services/productApi'
import { getByCategory, products as fallbackProducts } from '@data/products'
import ProductCard from '@components/ProductCard'
import { Product } from '@services/productApi'

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    loadProducts()
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setAllProducts(data)
    } catch (error) {
      console.error('Failed to load products from API, using fallback:', error)
      setAllProducts(fallbackProducts as Product[])
    }
  }

  const getProductsByCategory = (category: string) => {
    return allProducts.filter(p => p.category === category)
  }

  // Image Placeholder Component - Can be replaced with actual images later
  const ImagePlaceholder = ({ 
    aspectRatio = '16/9', 
    className = '', 
    style = {} 
  }: { 
    aspectRatio?: string
    className?: string
    style?: React.CSSProperties
  }) => (
    <div
      className={`image-placeholder ${className}`}
      style={{
        width: '100%',
        aspectRatio,
        background: 'linear-gradient(135deg, var(--cream) 0%, var(--paper) 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed var(--border-light)',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(59, 101, 159, 0.03) 10px, rgba(59, 101, 159, 0.03) 20px)'
      }} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '20px',
        color: 'var(--navy)',
        opacity: 0.4,
        fontSize: '0.875rem',
        fontWeight: 500
      }}>
        Image Placeholder
      </div>
    </div>
  )

  // Mobile Design - Clean, Typography-Focused
  if (isMobile) {
    return (
      <div className="home-mobile">
        {/* Mobile Hero - Typography Focused */}
        <section className="mobile-hero" style={{
          background: 'linear-gradient(180deg, var(--white) 0%, var(--cream) 100%)',
          padding: '120px 24px 60px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '20px',
              color: 'var(--navy)',
              letterSpacing: '-0.02em'
            }}>
              <span style={{ color: 'var(--mint)' }}>Tiny</span>{' '}
              <span style={{ color: 'var(--coral)' }}>Tales</span>
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--navy)',
              marginBottom: '32px',
              lineHeight: 1.6,
              opacity: 0.8,
              fontWeight: 400
            }}>
              Playful clothing that celebrates every moment of childhood. 
              Designed with love for your little ones.
            </p>
            <Link
              to="/products"
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: 'var(--navy)',
                color: 'var(--white)',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 16px rgba(59, 101, 159, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              Explore Collection
            </Link>
          </div>

          {/* Image Placeholder - Can be replaced */}
          <div style={{ marginTop: '48px' }}>
            <ImagePlaceholder aspectRatio="4/3" />
          </div>
        </section>

        {/* Mobile Trust Indicators */}
        <section style={{
          background: 'var(--white)',
          padding: '32px 24px',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            textAlign: 'center'
          }}>
            {[
              { title: 'Free Shipping', desc: 'In Dhaka' },
              { title: 'Easy Returns', desc: '30 Days' },
              { title: '100% Safe', desc: 'Natural Fabrics' }
            ].map((item, i) => (
              <div key={i}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--navy)',
                  marginBottom: '4px'
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--navy)',
                  opacity: 0.6
                }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Categories - Clean Grid */}
        <section style={{
          background: 'var(--white)',
          padding: '48px 24px'
        }}>
          <div style={{
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--navy)',
              marginBottom: '8px',
              letterSpacing: '-0.01em'
            }}>
              Shop by Category
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--navy)',
              opacity: 0.7
            }}>
              Curated collections for every stage
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {[
              { name: 'Newborn', color: 'var(--mint)', key: 'Newborn' },
              { name: 'Onesies', color: 'var(--sky)', key: 'Onesies' },
              { name: 'Sets', color: 'var(--coral)', key: 'Sets' },
              { name: 'Sleepwear', color: 'var(--blush)', key: 'Sleepwear' }
            ].map((cat) => (
              <Link
                key={cat.key}
                to={`/category/${cat.key}`}
                style={{
                  padding: '32px 24px',
                  background: `linear-gradient(135deg, ${cat.color}15 0%, ${cat.color}08 100%)`,
                  borderRadius: '16px',
                  border: `2px solid ${cat.color}30`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none'
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98)'
                  e.currentTarget.style.background = `linear-gradient(135deg, ${cat.color}25 0%, ${cat.color}15 100%)`
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.background = `linear-gradient(135deg, ${cat.color}15 0%, ${cat.color}08 100%)`
                }}
              >
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: cat.color,
                  textAlign: 'center'
                }}>
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Mobile Featured Products - Horizontal Scroll */}
        <section style={{
          background: 'var(--cream)',
          padding: '48px 0'
        }}>
          <div style={{
            padding: '0 24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--navy)',
              marginBottom: '8px',
              letterSpacing: '-0.01em'
            }}>
              Featured Products
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--navy)',
              opacity: 0.7
            }}>
              Handpicked for you
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            padding: '0 24px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {allProducts.slice(0, 6).map(p => (
              <div key={p.id} style={{
                minWidth: '200px',
                scrollSnapAlign: 'start'
              }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Shop Sections */}
        <section style={{
          background: 'var(--white)',
          padding: '48px 0'
        }}>
          <div style={{
            padding: '0 24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--navy)',
              marginBottom: '8px',
              letterSpacing: '-0.01em'
            }}>
              Shop for Boys
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--navy)',
              opacity: 0.7
            }}>
              Comfortable styles for active little ones
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            padding: '0 24px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory'
          }}>
            {getProductsByCategory('Sets').slice(0, 4).map(p => (
              <div key={p.id} style={{
                minWidth: '200px',
                scrollSnapAlign: 'start'
              }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

        <section style={{
          background: 'var(--cream)',
          padding: '48px 0'
        }}>
          <div style={{
            padding: '0 24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--navy)',
              marginBottom: '8px',
              letterSpacing: '-0.01em'
            }}>
              Shop for Girls
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--navy)',
              opacity: 0.7
            }}>
              Adorable outfits for every adventure
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            padding: '0 24px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory'
          }}>
            {getProductsByCategory('Onesies').slice(0, 4).map(p => (
              <div key={p.id} style={{
                minWidth: '200px',
                scrollSnapAlign: 'start'
              }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

        {/* Mobile CTA */}
        <section style={{
          background: 'var(--navy)',
          padding: '60px 24px',
          textAlign: 'center',
          color: 'var(--white)'
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '12px',
            letterSpacing: '-0.01em'
          }}>
            Discover More
          </h2>
          <p style={{
            fontSize: '0.875rem',
            marginBottom: '32px',
            opacity: 0.9
          }}>
            Browse our complete collection
          </p>
          <Link
            to="/products"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'var(--white)',
              color: 'var(--navy)',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            View All Products
          </Link>
        </section>

        <style>{`
          .home-mobile section {
            scroll-margin-top: 80px;
          }
          .home-mobile ::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    )
  }

  // Desktop Design - World-Class Typography & UX
  return (
    <div className="home-desktop">
      {/* Desktop Hero - Typography Masterpiece */}
      <section className="desktop-hero" style={{
        background: 'linear-gradient(180deg, var(--white) 0%, var(--cream) 50%, var(--paper) 100%)',
        padding: '200px 5% 120px',
        position: 'relative',
        marginTop: '-80px'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 80px'
          }}>
            <h1 style={{
              fontSize: 'clamp(3.5rem, 8vw, 6rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '32px',
              letterSpacing: '-0.03em',
              color: 'var(--navy)'
            }}>
              <span style={{ color: 'var(--mint)' }}>Clothing</span>{' '}
              <span style={{ color: 'var(--sky)' }}>for</span>{' '}
              <span style={{ color: 'var(--coral)' }}>Tiny</span>{' '}
              <span style={{ color: 'var(--sunshine)' }}>Stories</span>
            </h1>
            <p style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
              color: 'var(--navy)',
              lineHeight: 1.7,
              marginBottom: '48px',
              opacity: 0.8,
              fontWeight: 400,
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Discover playful, comfortable clothing that celebrates every moment of
              childhood. From first cuddles to big adventures.
            </p>
            <Link
              to="/products"
              style={{
                display: 'inline-block',
                padding: '18px 48px',
                background: 'var(--navy)',
                color: 'var(--white)',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1.125rem',
                boxShadow: '0 8px 24px rgba(59, 101, 159, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 101, 159, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 101, 159, 0.25)'
              }}
            >
              Explore Collection →
            </Link>
          </div>

          {/* Image Placeholder - Can be replaced with hero image */}
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <ImagePlaceholder aspectRatio="16/9" />
          </div>
        </div>
      </section>

      {/* Desktop Trust Bar - Minimalist */}
      <section style={{
        background: 'var(--white)',
        padding: '32px 5%',
        borderTop: '1px solid var(--border-light)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '40px'
        }}>
          {[
            'Trusted by 10,000+ families',
            'Free shipping in Dhaka',
            '30-day easy returns',
            '100% natural fabrics'
          ].map((text, i) => (
            <div key={i} style={{
              fontSize: '0.9375rem',
              color: 'var(--navy)',
              fontWeight: 500,
              textAlign: 'center'
            }}>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Desktop Category Grid - Clean & Spacious */}
      <section style={{
        padding: '120px 5%',
        background: 'var(--white)'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--navy)',
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}>
              Shop by Category
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--navy)',
              opacity: 0.7,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Find joyfully curated picks for every stage of your child's journey
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {[
              { name: 'Newborn', color: 'var(--mint)', key: 'Newborn' },
              { name: 'Onesies', color: 'var(--sky)', key: 'Onesies' },
              { name: 'Sets', color: 'var(--coral)', key: 'Sets' },
              { name: 'Sleepwear', color: 'var(--blush)', key: 'Sleepwear' },
              { name: 'Accessories', color: 'var(--sunshine)', key: 'Accessories' }
            ].map((cat) => (
              <Link
                key={cat.key}
                to={`/category/${cat.key}`}
                style={{
                  padding: '48px 32px',
                  background: `linear-gradient(135deg, ${cat.color}12 0%, ${cat.color}06 100%)`,
                  borderRadius: '20px',
                  border: `2px solid ${cat.color}25`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '180px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.borderColor = cat.color
                  e.currentTarget.style.background = `linear-gradient(135deg, ${cat.color}20 0%, ${cat.color}12 100%)`
                  e.currentTarget.style.boxShadow = `0 12px 32px ${cat.color}25`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = `${cat.color}25`
                  e.currentTarget.style.background = `linear-gradient(135deg, ${cat.color}12 0%, ${cat.color}06 100%)`
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: cat.color,
                  textAlign: 'center',
                  letterSpacing: '-0.01em'
                }}>
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop Product Sections - Clean Grids */}
      <section style={{
        padding: '120px 5%',
        background: 'var(--cream)'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--navy)',
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}>
              Shop for Boys
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--navy)',
              opacity: 0.7,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Comfortable, playful styles for active little ones
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '32px'
          }}>
            {getProductsByCategory('Sets').slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section style={{
        padding: '120px 5%',
        background: 'var(--white)'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--navy)',
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}>
              Shop for Girls
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--navy)',
              opacity: 0.7,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Adorable outfits for every adventure
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '32px'
          }}>
            {getProductsByCategory('Onesies').slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section style={{
        padding: '120px 5%',
        background: 'var(--cream)'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--navy)',
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}>
              Steal Deals
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--navy)',
              opacity: 0.7,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Limited-time savings on favorites
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '32px'
          }}>
            {allProducts.slice(0, 6).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Desktop CTA - Minimalist */}
      <section style={{
        background: 'var(--navy)',
        padding: '100px 5%',
        textAlign: 'center',
        color: 'var(--white)'
      }}>
        <div className="container" style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            marginBottom: '24px',
            letterSpacing: '-0.02em'
          }}>
            Discover More
          </h2>
          <p style={{
            fontSize: '1.125rem',
            marginBottom: '40px',
            opacity: 0.9,
            lineHeight: 1.7
          }}>
            Browse our complete collection of thoughtfully designed clothing
            for your little ones
          </p>
          <Link
            to="/products"
            style={{
              display: 'inline-block',
              padding: '18px 48px',
              background: 'var(--white)',
              color: 'var(--navy)',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1.125rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,255,255,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            View All Products →
          </Link>
        </div>
      </section>

      <style>{`
        .home-desktop section {
          scroll-margin-top: 80px;
        }
        .image-placeholder {
          transition: all 0.3s ease;
        }
        .image-placeholder:hover {
          border-color: var(--navy);
          opacity: 0.9;
        }
      `}</style>
    </div>
  )
}
