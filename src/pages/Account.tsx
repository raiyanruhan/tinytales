import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { useCart } from '@context/CartContext';
import { getOrdersByEmail, Order } from '@services/orderApi';
import { getSavedCart, CartItem } from '@services/cartApi';
import OrderHistory from '@components/OrderHistory';
import OrderDetailComponent from '@components/OrderDetail';
import { useModal } from '@context/ModalContext';

type Tab = 'information' | 'addresses' | 'orders' | 'carts';

export default function AccountPage() {
  const { user } = useAuth();
  const { state: cartState, clear, addItem } = useCart();
  const { showAlert } = useModal();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [savedCart, setSavedCart] = useState<CartItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadAccountData();
    }
  }, [user]);

  const loadAccountData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Load orders
      const ordersData = await getOrdersByEmail(user.email);
      setOrders(ordersData);

      // Load saved cart
      const cart = await getSavedCart(user.id);
      setSavedCart(cart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreCart = () => {
    if (!savedCart || savedCart.length === 0) return;

    clear();
    savedCart.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size
      }, item.quantity);
    });
    showAlert({
      title: 'Success',
      message: 'Cart restored successfully!',
      type: 'success'
    });
  };

  const handleCancelOrder = async (orderId: string) => {
    await loadAccountData();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
    }
  };


  return (
    <section className="account-page" style={{ padding: '64px 0', minHeight: '60vh', background: 'var(--cream)' }}>
      <div className="container">
        <h1 style={{ marginBottom: 32 }}>My Account</h1>

        <div className="account-layout" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 32 }}>
          {/* Sidebar */}
          <div className="account-sidebar pastel-card" style={{ padding: 24, height: 'fit-content' }}>
            <nav className="account-nav" style={{ display: 'grid', gap: 8 }}>
              <button
                onClick={() => { setActiveTab('information'); setSelectedOrder(null); }}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  background: activeTab === 'information' ? 'var(--mint)' : 'transparent',
                  color: activeTab === 'information' ? 'white' : 'var(--navy)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Information
              </button>
              <button
                onClick={() => { setActiveTab('addresses'); setSelectedOrder(null); }}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  background: activeTab === 'addresses' ? 'var(--mint)' : 'transparent',
                  color: activeTab === 'addresses' ? 'white' : 'var(--navy)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Addresses
              </button>
              <button
                onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  background: activeTab === 'orders' ? 'var(--mint)' : 'transparent',
                  color: activeTab === 'orders' ? 'white' : 'var(--navy)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Order History
              </button>
              <button
                onClick={() => { setActiveTab('carts'); setSelectedOrder(null); }}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  background: activeTab === 'carts' ? 'var(--mint)' : 'transparent',
                  color: activeTab === 'carts' ? 'white' : 'var(--navy)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Saved Carts
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="account-content">
            {selectedOrder ? (
              <div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn-3d"
                  style={{
                    background: 'var(--white)',
                    color: 'var(--navy)',
                    marginBottom: 16
                  }}
                >
                  ← Back to Orders
                </button>
                <OrderDetailComponent
                  order={selectedOrder}
                  onCancel={handleCancelOrder}
                  showCancelButton={true}
                />
              </div>
            ) : (
              <>
                {activeTab === 'information' && (
                  <div className="pastel-card" style={{ padding: 32 }}>
                    <h2 style={{ marginTop: 0, marginBottom: 24 }}>Account Information</h2>
                    <div style={{ display: 'grid', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid var(--border-light)',
                            borderRadius: 8,
                            backgroundColor: 'var(--cream)'
                          }}
                        />
                      </div>
                      <p style={{ color: 'var(--navy)', fontSize: 14 }}>
                        Account information management coming soon.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="pastel-card" style={{ padding: 32 }}>
                    <h2 style={{ marginTop: 0, marginBottom: 24 }}>Saved Addresses</h2>
                    <p style={{ color: 'var(--navy)' }}>
                      Address management coming soon. Your addresses will be saved here after checkout.
                    </p>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <h2 style={{ marginBottom: 24 }}>Order History</h2>
                    {loading ? (
                      <div style={{ textAlign: 'center', padding: 48 }}>
                        <p>Loading orders...</p>
                      </div>
                    ) : error ? (
                      <div className="pastel-card" style={{ padding: 24, background: '#FFE8E8', color: 'var(--coral)' }}>
                        {error}
                      </div>
                    ) : (
                      <OrderHistory
                        orders={orders}
                        onCancel={handleCancelOrder}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'carts' && (
                  <div className="pastel-card" style={{ padding: 32 }}>
                    <h2 style={{ marginTop: 0, marginBottom: 24 }}>Saved Carts</h2>
                    {loading ? (
                      <p>Loading...</p>
                    ) : savedCart && savedCart.length > 0 ? (
                      <div>
                        <p style={{ marginBottom: 16, color: 'var(--navy)' }}>
                          You have {savedCart.length} item{savedCart.length !== 1 ? 's' : ''} in your saved cart.
                        </p>
                        <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
                          {savedCart.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                gap: 12,
                                padding: 12,
                                background: 'var(--cream)',
                                borderRadius: 8
                              }}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  width: 60,
                                  height: 60,
                                  objectFit: 'cover',
                                  borderRadius: 6
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: 14, color: 'var(--navy)' }}>
                                  Size: {item.size || 'One Size'} × {item.quantity}
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--navy)' }}>
                                  Tk {(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleRestoreCart}
                          className="btn-primary"
                        >
                          Restore Cart
                        </button>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--navy)' }}>No saved carts</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .account-page {
            padding: 32px 0 !important;
          }
          .account-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .account-sidebar {
            order: 1;
          }
          .account-nav {
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto;
            gap: 8px !important;
            padding-bottom: 8px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .account-nav::-webkit-scrollbar {
            display: none;
          }
          .account-nav button {
            white-space: nowrap;
            padding: 12px 20px !important;
            min-width: auto;
            flex-shrink: 0;
          }
          .account-content {
            order: 2;
          }
        }
      `}</style>
    </section>
  );
}

