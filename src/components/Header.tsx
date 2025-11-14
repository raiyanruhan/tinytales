import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '@context/CartContext'
import { useAuth } from '@context/AuthContext'
import { CartIcon, PersonIcon, HeartIcon, MenuIcon, CloseIcon } from './Icons'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const { totalQty } = useCart()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement
        if (!target.closest('.mobile-menu-button')) {
          setShowMobileMenu(false)
        }
      }
    }

    if (showMenu || showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu, showMobileMenu])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMobileMenu(false)
        setShowMenu(false)
      }
    }

    if (showMobileMenu || showMenu) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showMobileMenu, showMenu])

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [showMobileMenu])

  const handlePersonClick = () => {
    if (isAuthenticated) {
      setShowMenu(!showMenu)
    } else {
      navigate('/login')
    }
  }

  const handleLogout = () => {
    logout()
    setShowMenu(false)
    setShowMobileMenu(false)
    navigate('/')
  }

  const handleMobileMenuClose = () => {
    setShowMobileMenu(false)
  }
  
  return (
    <header style={{
      background: 'var(--white)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      width: '100%',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'box-shadow 0.3s'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="mobile-menu-button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--cream)',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            {showMobileMenu ? (
              <CloseIcon size="lg" style={{ fontSize: 20, color: 'var(--navy)' }} />
            ) : (
              <MenuIcon size="lg" style={{ fontSize: 20, color: 'var(--navy)' }} />
            )}
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/image.png" 
              alt="Tiny Tales" 
              className="header-logo"
              style={{ height: 52, width: 'auto' }}
            />
          </Link>
        </div>
        
        <nav className="desktop-nav" style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center'
        }}>
          <NavLink 
            to="/products" 
            className="nav-link"
          >
            All Products
          </NavLink>
          <NavLink 
            to="/category/Newborn" 
            className="nav-link"
          >
            Newborn
          </NavLink>
          <NavLink 
            to="/category/Onesies" 
            className="nav-link"
          >
            Onesies
          </NavLink>
          <NavLink 
            to="/category/Sets" 
            className="nav-link"
          >
            Sets
          </NavLink>
          <NavLink 
            to="/category/Sleepwear" 
            className="nav-link"
          >
            Sleepwear
          </NavLink>
          <NavLink 
            to="/category/Accessories" 
            className="nav-link"
          >
            Accessories
          </NavLink>
          {isAuthenticated && user?.email.toLowerCase() === 'raiyanbinrashid0@gmail.com' && (
            <NavLink 
              to="/dashboard" 
              className="nav-link"
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          {isAuthenticated && (
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--cream)',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--paper)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--cream)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <HeartIcon size="lg" style={{ fontSize: 20 }} />
            </Link>
          )}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={handlePersonClick}
              aria-label={isAuthenticated ? 'User menu' : 'Login'}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: isAuthenticated ? 'var(--mint)' : 'var(--cream)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                color: isAuthenticated ? 'var(--white)' : 'var(--navy)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--mint)'
                e.currentTarget.style.color = 'var(--white)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isAuthenticated ? 'var(--mint)' : 'var(--cream)'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.color = isAuthenticated ? 'var(--white)' : 'var(--navy)'
              }}
            >
              <PersonIcon size="lg" style={{ fontSize: 20 }} />
            </button>

            {isAuthenticated && showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'var(--white)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                minWidth: '200px',
                padding: '0.5rem 0',
                zIndex: 10000,
                border: '1px solid var(--border-light)'
              }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border-light)',
                  color: 'var(--ink)',
                  fontSize: '0.9rem'
                }}>
                  {user?.email}
                </div>
                <Link
                  to="/account"
                  onClick={() => setShowMenu(false)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--navy)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--cream)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none'
                  }}
                >
                  My Account
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setShowMenu(false)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--navy)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--cream)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none'
                  }}
                >
                  My Wishlist
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--coral)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--cream)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none'
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <Link 
            to="/cart" 
            aria-label="Shopping cart"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--cream)',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--paper)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--cream)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <CartIcon size="lg" style={{ fontSize: 20 }} />
            {totalQty > 0 && (
              <span
                className="badge"
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: 'var(--sunshine)',
                  color: 'var(--ink)',
                  minWidth: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: totalQty > 0 ? 'bounce 0.5s' : 'none'
                }}
              >
                {totalQty}
              </span>
            )}
          </Link>
        </div>
      </div>
      <style>{`
        .nav-link {
          padding: 10px 20px;
          border-radius: 999px;
          color: var(--bg);
          font-weight: 600;
          font-size: 15px;
          transition: var(--transition-fast);
          position: relative;
        }
        .nav-link:hover {
          background: var(--cream);
          color: var(--bg);
        }
        .nav-link.active {
          background: var(--bg);
          color: #fff;
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @media (max-width: 767px) {
          .mobile-menu-button {
            display: flex !important;
          }
          .desktop-nav {
            display: none !important;
          }
          .header-logo {
            height: 40px !important;
          }
        }

        @media (min-width: 768px) {
          .mobile-menu-button {
            display: none !important;
          }
          .mobile-menu-drawer {
            display: none !important;
          }
        }

        .mobile-menu-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: min(320px, 85vw);
          height: 100vh;
          background: var(--white);
          z-index: 10000;
          box-shadow: 4px 0 24px rgba(0,0,0,0.15);
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }

        .mobile-menu-drawer.open {
          transform: translateX(0);
        }

        .mobile-menu-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .mobile-menu-backdrop.open {
          opacity: 1;
          pointer-events: all;
        }
      `}</style>
      {showMobileMenu && (
        <>
          <div 
            className={`mobile-menu-backdrop ${showMobileMenu ? 'open' : ''}`}
            onClick={handleMobileMenuClose}
          />
          <div 
            ref={mobileMenuRef}
            className={`mobile-menu-drawer ${showMobileMenu ? 'open' : ''}`}
          >
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <img 
                src="/image.png" 
                alt="Tiny Tales" 
                style={{ height: 40, width: 'auto' }}
              />
              <button
                onClick={handleMobileMenuClose}
                aria-label="Close menu"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--cream)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CloseIcon size="lg" style={{ fontSize: 18, color: 'var(--navy)' }} />
              </button>
            </div>
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 0'
            }}>
              <NavLink 
                to="/products" 
                className="mobile-nav-link"
                onClick={handleMobileMenuClose}
              >
                All Products
              </NavLink>
              <NavLink 
                to="/category/Newborn" 
                className="mobile-nav-link"
                onClick={handleMobileMenuClose}
              >
                Newborn
              </NavLink>
              <NavLink 
                to="/category/Onesies" 
                className="mobile-nav-link"
                onClick={handleMobileMenuClose}
              >
                Onesies
              </NavLink>
              <NavLink 
                to="/category/Sets" 
                className="mobile-nav-link"
                onClick={handleMobileMenuClose}
              >
                Sets
              </NavLink>
              <NavLink 
                to="/category/Sleepwear" 
                className="mobile-nav-link"
                onClick={handleMobileMenuClose}
              >
                Sleepwear
              </NavLink>
              <NavLink 
                to="/category/Accessories" 
                className="mobile-nav-link"
                onClick={handleMobileMenuClose}
              >
                Accessories
              </NavLink>
              {isAuthenticated && user?.email.toLowerCase() === 'raiyanbinrashid0@gmail.com' && (
                <NavLink 
                  to="/dashboard" 
                  className="mobile-nav-link"
                  onClick={handleMobileMenuClose}
                >
                  Dashboard
                </NavLink>
              )}
              {isAuthenticated && (
                <>
                  <div style={{
                    height: 1,
                    background: 'var(--border-light)',
                    margin: '12px 20px'
                  }} />
                  <Link
                    to="/account"
                    onClick={() => {
                      handleMobileMenuClose()
                      setShowMenu(false)
                    }}
                    className="mobile-nav-link"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => {
                      handleMobileMenuClose()
                      setShowMenu(false)
                    }}
                    className="mobile-nav-link"
                  >
                    My Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      handleMobileMenuClose()
                    }}
                    className="mobile-nav-link"
                    style={{
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      color: 'var(--coral)',
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        </>
      )}
      <style>{`
        .mobile-nav-link {
          display: block;
          padding: 16px 20px;
          color: var(--navy);
          font-weight: 600;
          font-size: 16px;
          text-decoration: none;
          transition: var(--transition-fast);
          border: none;
          width: 100%;
          text-align: left;
        }
        .mobile-nav-link:hover,
        .mobile-nav-link:active {
          background: var(--cream);
          color: var(--navy);
        }
        .mobile-nav-link.active {
          background: var(--mint);
          color: var(--white);
        }
      `}</style>
    </header>
  )
}
