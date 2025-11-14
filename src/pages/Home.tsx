import { useState, useEffect } from 'react'
import { getProducts } from '@services/productApi'
import { getByCategory, products as fallbackProducts } from '@data/products'
import Hero from '@components/Hero'
import CategoryGrid from '@components/CategoryGrid'
import ProductCard from '@components/ProductCard'
import TrustMarquee from '@components/TrustMarquee'
import PromotionalBanner from '@components/PromotionalBanner'
import SocialFeed from '@components/SocialFeed'
import Newsletter from '@components/Newsletter'
import { Product } from '@services/productApi'

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

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

  return (
    <>
      <Hero />
      
      <TrustMarquee />

      <CategoryGrid />

      <section style={{ padding: '80px 0', background: 'var(--white)' }} className="home-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ marginBottom: 12 }}>Shop for Boys</h2>
            <p style={{ fontSize: 18, color: 'var(--navy)' }}>
              Comfortable, playful styles for active little ones
            </p>
          </div>
          <div className="product-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 28,
            alignItems: 'stretch'
          }}>
            {getProductsByCategory('Sets').slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'var(--cream)' }} className="home-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ marginBottom: 12 }}>Shop for Girls</h2>
            <p style={{ fontSize: 18, color: 'var(--navy)' }}>
              Adorable outfits for every adventure
            </p>
          </div>
          <div className="product-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 28,
            alignItems: 'stretch'
          }}>
            {getProductsByCategory('Onesies').slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <PromotionalBanner />

      <section style={{ padding: '80px 0', background: 'var(--white)' }} className="home-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ marginBottom: 12 }}>Steal Deals</h2>
            <p style={{ fontSize: 18, color: 'var(--navy)' }}>
              Limited-time savings on favorites
            </p>
          </div>
          <div className="product-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 28,
            alignItems: 'stretch'
          }}>
            {allProducts.slice(0, 6).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <SocialFeed />

      <Newsletter />
      <style>{`
        @media (max-width: 767px) {
          .home-section {
            padding: 40px 0 !important;
          }
          .product-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </>
  )
}
