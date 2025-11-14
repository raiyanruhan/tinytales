import { Link } from 'react-router-dom'
import { categories } from '@data/products'
import { CategoryIcon } from './Icons'

export default function CategoryGrid() {
  return (
    <section style={{ padding: '64px 0', background: 'var(--white)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ marginBottom: 12 }}>Shop by Category</h2>
          <p style={{ fontSize: 18, color: 'var(--navy)' }}>
            Find joyfully curated picks for every stage
          </p>
        </div>
        
        <div className="category-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24
        }}>
          {categories.map(category => (
            <Link
              key={category.key}
              to={`/category/${category.key}`}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                aspectRatio: '4/3',
                display: 'block',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg, ${category.bg} 0%, ${category.color}20 100%)`,
                zIndex: 1
              }} />
              
              <div style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, ${category.color}40, ${category.bg})`,
                opacity: 0.5
              }} />
              
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                padding: 24
              }}>
                <div style={{
                  marginBottom: 16,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  color: category.color
                }}>
                  <CategoryIcon category={category.key} size="4x" />
                </div>
                <h3 style={{
                  color: category.color,
                  fontSize: 28,
                  fontWeight: 800,
                  textShadow: '0 2px 4px rgba(255,255,255,0.8)',
                  marginBottom: 8
                }}>
                  {category.key}
                </h3>
                <div style={{
                  color: 'var(--navy)',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.9)',
                  padding: '6px 16px',
                  borderRadius: 999,
                  fontSize: 14
                }}>
                  Explore →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .category-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  )
}

