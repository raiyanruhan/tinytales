import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '@context/CartContext'
import { useAuth } from '@context/AuthContext'
import { CartIcon, PersonIcon } from './Icons'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const { totalQty } = useCart()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

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
    navigate('/')
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
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/image.png" 
            alt="Tiny Tales" 
            style={{ height: 52, width: 'auto' }}
          />
        </Link>
        
        <nav style={{
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
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
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
      `}</style>
    </header>
  )
}
