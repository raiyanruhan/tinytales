import { useState, useEffect, useMemo } from 'react'
import { getProducts } from '@services/productApi'
import { products as fallbackProducts } from '@data/products'
import ProductCard from '@components/ProductCard'
import { ShirtIcon } from '@components/Icons'
import { Product } from '@services/productApi'
import { useProgress } from '@components/TopProgressBar'
import { ProductCardSkeleton } from '@components/Skeleton'
import { useSearchParams } from 'react-router-dom'

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { setProgress, completeProgress } = useProgress()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setProgress(10)
      const data = await getProducts()
      setProgress(70)
      setProducts(data)
      setProgress(90)
    } catch (error) {
      console.error('Failed to load products from API, using fallback:', error)
      setProgress(50)
      // Fallback to static data if API fails
      setProducts(fallbackProducts as Product[])
      setProgress(90)
    } finally {
      setLoading(false)
      completeProgress()
    }
  }

  const searchQuery = (searchParams.get('search') || '').trim().toLowerCase()

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products
    return products.filter((product) => {
      const haystacks: Array<string | string[] | undefined> = [
        product.name,
        product.category,
        product.description,
        product.badges,
        product.colors?.map((color) => (typeof color === 'string' ? color : color.name)),
      ]

      return haystacks.some((value) => {
        if (!value) return false
        if (Array.isArray(value)) {
          return value.some((item) => item?.toLowerCase().includes(searchQuery))
        }
        return value.toLowerCase().includes(searchQuery)
      })
    })
  }, [products, searchQuery])

  if (loading) {
    return (
      <section style={{ padding: '64px 0', background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '1.5rem',
            padding: '2rem 0'
          }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="products-page" style={{ padding: '64px 0', background: 'var(--cream)' }}>
      <div className="container">
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ 
            fontFamily: "'Barriecito', cursive",
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            marginBottom: 12,
            color: 'var(--navy)'
          }}>
            All Products
          </h1>
          <p style={{ fontSize: 18, color: 'var(--navy)', opacity: 0.8 }}>
            {searchQuery
              ? `Searching for “${searchParams.get('search') || ''}”`
              : 'Discover our complete collection of baby clothing'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchParams({}, { replace: true })}
              style={{
                marginTop: 12,
                background: 'none',
                border: '1px solid var(--border-light)',
                borderRadius: 999,
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Clear search
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
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
            <p style={{ color: 'var(--navy)' }}>
              {searchQuery ? 'Try using a different keyword or clearing the search.' : 'Check back soon for new arrivals!'}
            </p>
          </div>
        ) : (
          <div className="product-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 28,
            alignItems: 'stretch'
          }}>
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 767px) {
          .products-page {
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


