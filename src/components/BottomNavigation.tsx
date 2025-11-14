import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '@context/CartContext'
import { HomeIcon, CartIcon, ProductsIcon, CategoriesIcon } from './Icons'
import { useState } from 'react'
import { categories } from '@data/products'

export default function BottomNavigation() {
  const location = useLocation()
  const { totalQty } = useCart()
  const navigate = useNavigate()
  const [showCategories, setShowCategories] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleCategoryClick = (categoryKey: string) => {
    navigate(`/category/${categoryKey}`)
    handleCloseCategories()
  }

  const handleOpenCategories = () => {
    setIsClosing(false)
    setShowCategories(true)
  }

  const handleCloseCategories = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowCategories(false)
      setIsClosing(false)
    }, 300)
  }

  return (
    <>
      <nav
        className="bottom-navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--white)',
          borderTop: '1px solid var(--border-light)',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          zIndex: 9998,
          paddingBottom: 'env(safe-area-inset-bottom)',
          display: 'none'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '6px 0',
          maxWidth: '100%'
        }}>
          <Link
            to="/"
            aria-label="Home"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              minWidth: 55,
              textDecoration: 'none',
              color: isActive('/') ? 'var(--mint)' : 'var(--navy)',
              transition: 'var(--transition-fast)',
              borderRadius: 'var(--radius-sm)'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.opacity = '0.7'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <HomeIcon size="lg" style={{ fontSize: 20, marginBottom: 3 }} />
            <span style={{ fontSize: 10, fontWeight: 600 }}>Home</span>
          </Link>

          <Link
            to="/products"
            aria-label="Products"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              minWidth: 55,
              textDecoration: 'none',
              color: isActive('/products') ? 'var(--mint)' : 'var(--navy)',
              transition: 'var(--transition-fast)',
              borderRadius: 'var(--radius-sm)'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.opacity = '0.7'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <ProductsIcon size="lg" style={{ fontSize: 20, marginBottom: 3 }} />
            <span style={{ fontSize: 10, fontWeight: 600 }}>Products</span>
          </Link>

          <button
            onClick={() => showCategories ? handleCloseCategories() : handleOpenCategories()}
            aria-label="Categories"
            className="categories-button"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              minWidth: 55,
              background: showCategories || location.pathname.startsWith('/category/') 
                ? 'var(--mint)' 
                : 'var(--cream)',
              border: showCategories || location.pathname.startsWith('/category/')
                ? 'none'
                : '2px solid var(--mint)',
              cursor: 'pointer',
              color: showCategories || location.pathname.startsWith('/category/') 
                ? 'var(--white)' 
                : 'var(--navy)',
              transition: 'var(--transition-fast)',
              borderRadius: 'var(--radius-md)',
              boxShadow: showCategories || location.pathname.startsWith('/category/')
                ? '0 2px 8px rgba(68, 176, 144, 0.3)'
                : '0 1px 4px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
              e.currentTarget.style.opacity = '0.9'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.opacity = '1'
            }}
            onMouseEnter={(e) => {
              if (!showCategories && !location.pathname.startsWith('/category/')) {
                e.currentTarget.style.background = 'var(--mint)'
                e.currentTarget.style.color = 'var(--white)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(68, 176, 144, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!showCategories && !location.pathname.startsWith('/category/')) {
                e.currentTarget.style.background = 'var(--cream)'
                e.currentTarget.style.color = 'var(--navy)'
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <CategoriesIcon size="lg" style={{ fontSize: 20, marginBottom: 3 }} />
            <span style={{ fontSize: 10, fontWeight: 600 }}>Categories</span>
            {(showCategories || location.pathname.startsWith('/category/')) && (
              <span 
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--white)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              />
            )}
          </button>

          <Link
            to="/cart"
            aria-label="Cart"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              minWidth: 55,
              textDecoration: 'none',
              color: isActive('/cart') ? 'var(--mint)' : 'var(--navy)',
              transition: 'var(--transition-fast)',
              borderRadius: 'var(--radius-sm)',
              position: 'relative'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.opacity = '0.7'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <div style={{ position: 'relative' }}>
              <CartIcon size="lg" style={{ fontSize: 20, marginBottom: 3 }} />
              {totalQty > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -8,
                    background: 'var(--coral)',
                    color: 'var(--white)',
                    borderRadius: '50%',
                    minWidth: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '0 4px'
                  }}
                >
                  {totalQty > 99 ? '99+' : totalQty}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600 }}>Cart</span>
          </Link>

        </div>
      </nav>

      {showCategories && (
        <>
          <div
            className={`categories-backdrop ${isClosing ? 'closing' : 'opening'}`}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              zIndex: 9997,
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)'
            }}
            onClick={handleCloseCategories}
          />
          <div
            className={`categories-panel ${isClosing ? 'closing' : 'opening'}`}
            style={{
              position: 'fixed',
              bottom: 'calc(60px + env(safe-area-inset-bottom))',
              left: 0,
              right: 0,
              background: 'var(--white)',
              borderTop: '1px solid var(--border-light)',
              boxShadow: '0 -4px 16px rgba(0,0,0,0.12)',
              zIndex: 9998,
              padding: '16px',
              maxHeight: '50vh',
              overflowY: 'auto',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)'
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12
            }}>
              {categories.map(category => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryClick(category.key)}
                  style={{
                    padding: '16px',
                    background: `linear-gradient(135deg, ${category.color}20, ${category.bg}20)`,
                    border: `2px solid ${category.color}40`,
                    borderRadius: 'var(--radius-md)',
                    color: category.color,
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    textAlign: 'center'
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)'
                    e.currentTarget.style.opacity = '0.8'
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  {category.key}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 767px) {
          .bottom-navigation {
            display: block !important;
          }
        }

        @media (min-width: 768px) {
          .bottom-navigation {
            display: none !important;
          }
        }

        /* Backdrop animations */
        .categories-backdrop.opening {
          animation: backdropFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .categories-backdrop.closing {
          animation: backdropFadeOut 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Panel animations */
        .categories-panel.opening {
          animation: panelSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .categories-panel.closing {
          animation: panelSlideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes backdropFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes backdropFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes panelSlideUp {
          from {
            transform: translateY(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes panelSlideDown {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(100%) scale(0.95);
            opacity: 0;
          }
        }

        /* Stagger animation for category buttons */
        .categories-panel.opening button {
          animation: buttonFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
          transform: translateY(10px);
        }

        .categories-panel.opening button:nth-child(1) { animation-delay: 0.05s; }
        .categories-panel.opening button:nth-child(2) { animation-delay: 0.1s; }
        .categories-panel.opening button:nth-child(3) { animation-delay: 0.15s; }
        .categories-panel.opening button:nth-child(4) { animation-delay: 0.2s; }
        .categories-panel.opening button:nth-child(5) { animation-delay: 0.25s; }

        @keyframes buttonFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}




