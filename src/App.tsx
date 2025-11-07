import { Routes, Route, Navigate } from 'react-router-dom'
import Header from '@components/Header'
import { CartProvider } from '@context/CartContext'
import Home from '@pages/Home'
import CategoryPage from '@pages/Category'
import ProductPage from '@pages/Product'
import CartPage from '@pages/Cart'
import CheckoutPage from '@pages/Checkout'
import NotFound from '@pages/NotFound'

export default function App() {
  return (
    <CartProvider>
      <Header />
      <main style={{ paddingTop: '80px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:cat" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer style={{
        background: 'var(--navy)',
        color: '#fff',
        padding: '64px 0 32px'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 48,
            marginBottom: 48
          }}>
            <div>
              <div style={{ marginBottom: 16 }}>
                <img src="/image.png" alt="Tiny Tales" style={{ height: 40, width: 'auto', filter: 'brightness(0) invert(1)' }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                Cheerful clothing crafted for comfort and play. Made with love for tiny families.
              </p>
            </div>
            
            <div>
              <h4 style={{ marginBottom: 16, color: '#fff' }}>Shop</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                {['Newborn', 'Onesies', 'Sets', 'Sleepwear', 'Accessories'].map(item => (
                  <li key={item}>
                    <a href={`/category/${item}`} style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ marginBottom: 16, color: '#fff' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                {['About Us', 'Careers', 'Contact', 'Blog'].map(item => (
                  <li key={item}>
                    <a href="/" style={{ color: 'rgba(255,255,255,0.8)' }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ marginBottom: 16, color: '#fff' }}>Help</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                {['Shipping', 'Returns', 'Size Guide', 'FAQs'].map(item => (
                  <li key={item}>
                    <a href="/" style={{ color: 'rgba(255,255,255,0.8)' }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>
              © {new Date().getFullYear()} TinyTales. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Privacy', 'Terms', 'Cookies'].map(item => (
                <a key={item} href="/" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </CartProvider>
  )
}
