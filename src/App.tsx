import { Routes, Route, Navigate } from 'react-router-dom'
import Header from '@components/Header'
import { CartProvider } from '@context/CartContext'
import { AuthProvider, useAuth } from '@context/AuthContext'
import { LoadingProvider } from '@context/LoadingContext'
import { ModalProvider } from '@context/ModalContext'
import AdminRoute from '@components/AdminRoute'
import ProtectedRoute from '@components/ProtectedRoute'
import CartMergeDialog from '@components/CartMergeDialog'
import TopProgressBar from '@components/TopProgressBar'
import { useCart } from '@context/CartContext'
import { getSavedCart, saveCartToServer, CartItem } from '@services/cartApi'
import { useState, useEffect } from 'react'
import Home from '@pages/Home'
import CategoryPage from '@pages/Category'
import AllProducts from '@pages/AllProducts'
import ProductPage from '@pages/Product'
import CartPage from '@pages/Cart'
import CheckoutPage from '@pages/Checkout'
import Login from '@pages/Login'
import Signup from '@pages/Signup'
import EmailVerification from '@pages/EmailVerification'
import Dashboard from '@pages/Dashboard'
import Account from '@pages/Account'
import OrderDetailPage from '@pages/OrderDetail'
import NotFound from '@pages/NotFound'

function AppContent() {
  const { cartMergeDecision, resolveCartMerge, user } = useAuth();
  const { state: cartState, setItems } = useCart();
  const [serverCart, setServerCart] = useState<CartItem[]>([]);
  const [loadingMerge, setLoadingMerge] = useState(false);

  useEffect(() => {
    if (cartMergeDecision?.needsDecision && user) {
      loadServerCart();
    }
  }, [cartMergeDecision, user]);

  const loadServerCart = async () => {
    if (!user) return;
    try {
      const cart = await getSavedCart(user.id);
      if (cart) {
        setServerCart(cart);
      }
    } catch (error) {
      console.error('Error loading server cart:', error);
    }
  };

  const handleCartChoice = async (useLocal: boolean) => {
    setLoadingMerge(true);
    try {
      if (useLocal) {
        // Use local cart - save to server
        if (user && cartState.items.length > 0) {
          await saveCartToServer(user.id, cartState.items);
        }
      } else {
        // Use server cart - replace local
        setItems(serverCart);
      }
      resolveCartMerge(useLocal);
    } catch (error) {
      console.error('Error merging cart:', error);
    } finally {
      setLoadingMerge(false);
    }
  };

  return (
    <>
      <TopProgressBar>
        <Header />
        <main style={{ paddingTop: '80px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/category/:cat" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
              <Route path="/account" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </TopProgressBar>
      {cartMergeDecision?.needsDecision && (
        <CartMergeDialog
          localCart={cartState.items}
          serverCart={serverCart}
          onChoose={handleCartChoice}
        />
      )}
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
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LoadingProvider>
          <ModalProvider>
            <AppContent />
          </ModalProvider>
        </LoadingProvider>
      </CartProvider>
    </AuthProvider>
  );
}
