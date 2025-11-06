import { Link, NavLink } from 'react-router-dom'
import { useCart } from '@context/CartContext'
import AnnouncementBar from './AnnouncementBar'
import { CartIcon } from './Icons'

export default function Header() {
  const { totalQty } = useCart()
  
  return (
    <>
      <AnnouncementBar />
      <header style={{
        background: 'var(--white)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                e.currentTarget.style.background = 'var(--mint)'
                e.currentTarget.style.transform = 'scale(1.1)'
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
                    color: '#1c1c1c',
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
      </header>
      <style>{`
        .nav-link {
          padding: 10px 20px;
          border-radius: 999px;
          color: var(--navy);
          font-weight: 600;
          font-size: 15px;
          transition: var(--transition-fast);
          position: relative;
        }
        .nav-link:hover {
          background: var(--cream);
          color: var(--mint);
        }
        .nav-link.active {
          background: var(--mint);
          color: #fff;
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </>
  )
}
