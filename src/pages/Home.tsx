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

      <section style={{ padding: '80px 0', background: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ marginBottom: 12 }}>Shop for Boys</h2>
            <p style={{ fontSize: 18, color: 'var(--navy)' }}>
              Comfortable, playful styles for active little ones
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 24
          }}>
            {getProductsByCategory('Sets').slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ marginBottom: 12 }}>Shop for Girls</h2>
            <p style={{ fontSize: 18, color: 'var(--navy)' }}>
              Adorable outfits for every adventure
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 24
          }}>
            {getProductsByCategory('Onesies').slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <PromotionalBanner />

      <section style={{ padding: '80px 0', background: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ marginBottom: 12 }}>Steal Deals</h2>
            <p style={{ fontSize: 18, color: 'var(--navy)' }}>
              Limited-time savings on favorites
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 24
          }}>
            {allProducts.slice(0, 6).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <SocialFeed />

      <Newsletter />
    </>
  )
}
