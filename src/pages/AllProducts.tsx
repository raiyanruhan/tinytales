import { useState, useEffect } from 'react'
import { getProducts } from '@services/productApi'
import { products as fallbackProducts } from '@data/products'
import ProductCard from '@components/ProductCard'
import { ShirtIcon } from '@components/Icons'
import { Product } from '@services/productApi'

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products from API, using fallback:', error)
      // Fallback to static data if API fails
      setProducts(fallbackProducts as Product[])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section style={{ padding: '64px 0', background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 18, color: 'var(--navy)' }}>Loading products...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding: '64px 0', background: 'var(--cream)' }}>
      <div className="container">
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ 
            fontFamily: "'Barriecito', cursive",
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            marginBottom: 12,
            color: 'var(--navy)'
          }}>
            All Products
          </h1>
          <p style={{ fontSize: 18, color: 'var(--navy)', opacity: 0.8 }}>
            Discover our complete collection of baby clothing
          </p>
        </div>

        {products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 0',
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ marginBottom: 16, color: 'var(--mint)' }}>
              <ShirtIcon size="3x" style={{ fontSize: 48 }} />
            </div>
            <h3 style={{ marginBottom: 8 }}>No products found</h3>
            <p style={{ color: 'var(--navy)' }}>Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 24
          }}>
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}


