import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProducts } from '@services/productApi'
import { getByCategory, type Category, products as fallbackProducts } from '@data/products'
import ProductCard from '@components/ProductCard'
import { ShirtIcon } from '@components/Icons'
import { Product } from '@services/productApi'
import { useProgress } from '@components/TopProgressBar'

export default function CategoryPage() {
  const { cat } = useParams()
  const category = (cat as Category) ?? 'Onesies'
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { setProgress, completeProgress } = useProgress()

  useEffect(() => {
    loadProducts()
  }, [category])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setProgress(10)
      const data = await getProducts()
      setProgress(60)
      const categoryProducts = data.filter(p => p.category === category)
      setProgress(80)
      setProducts(categoryProducts)
      setProgress(90)
    } catch (error) {
      console.error('Failed to load products from API, using fallback:', error)
      setProgress(50)
      // Fallback to static data if API fails
      const fallback = getByCategory(category)
      setProducts(fallback as Product[])
      setProgress(90)
    } finally {
      setLoading(false)
      completeProgress()
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
    <section className="category-page" style={{ padding: '64px 0', background: 'var(--cream)' }}>
      <div className="container">
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 12 }}>{category}</h1>
          <p style={{ fontSize: 18, color: 'var(--navy)' }}>
            Discover our {category.toLowerCase()} collection
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
          <div className="product-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 28,
            alignItems: 'stretch'
          }}>
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 767px) {
          .category-page {
            padding: 32px 0 !important;
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
    </section>
  )
}
