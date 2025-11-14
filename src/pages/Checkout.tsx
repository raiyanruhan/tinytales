import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@context/CartContext';
import { useAuth } from '@context/AuthContext';
import { createOrder, OrderAddress } from '@services/orderApi';
import LocationSelector from '@components/LocationSelector';
import LoadingButton from '@components/LoadingButton';

export default function CheckoutPage() {
  const { state, totalPrice, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Form fields
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [regionState, setRegionState] = useState('');
  const [cityArea, setCityArea] = useState('');
  const [zipPostalCode, setZipPostalCode] = useState('');
  const [sameAddress, setSameAddress] = useState(true);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const shippingCost = 100; // Tk 100.00
  const grandTotal = totalPrice + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate cart
      if (state.items.length === 0) {
        setError('Your cart is empty');
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!email || !firstName || !lastName || !mobileNumber || !streetAddress || !regionState || !cityArea) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare address
      const address: OrderAddress = {
        firstName,
        lastName,
        mobileNumber,
        streetAddress,
        country: 'Bangladesh',
        regionState,
        cityArea,
        zipPostalCode,
        sameAddress,
        deliveryInstructions
      };

      // Prepare order items
      const items = state.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || 'One Size',
        color: 'default', // Default color, can be enhanced later
        image: item.image
      }));

      // Create order
      const order = await createOrder({
        email: email.toLowerCase(),
        userId: user?.id,
        items,
        shipping: {
          method: 'Standard Shipping',
          cost: shippingCost
        },
        payment: {
          method: paymentMethod
        },
        address
      });

      // Clear cart
      clear();
      
      // Show success
      setOrderNumber(order.orderNumber);
      setPlaced(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <section style={{ padding: '64px 0', minHeight: '60vh' }}>
        <div className="container">
          <div className="pastel-card" style={{ padding: 48, textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ fontSize: 64, marginBottom: 24, color: 'var(--mint)' }}>✓</div>
            <h2 style={{ marginTop: 0, marginBottom: 16, color: 'var(--navy)' }}>Order Placed Successfully!</h2>
            <p style={{ fontSize: 18, color: 'var(--ink)', marginBottom: 24 }}>
              Thank you for choosing TinyTales. Your order has been confirmed.
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #44B090 0%, #6CB1DA 100%)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: 12,
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 32
            }}>
              Order #{orderNumber}
            </div>
            <p style={{ color: 'var(--navy)', marginBottom: 24 }}>
              A confirmation email has been sent to <strong>{email}</strong>
            </p>
            {!user && (
              <div style={{
                padding: 16,
                background: 'var(--cream)',
                borderRadius: 12,
                marginBottom: 24
              }}>
                <p style={{ marginBottom: 12, color: 'var(--ink)' }}>
                  Don't have an account? Create one to track your orders easily!
                </p>
                <button
                  onClick={() => navigate('/signup', { state: { email } })}
                  className="btn-primary"
                  style={{ marginTop: 8 }}
                >
                  Create Account
                </button>
              </div>
            )}
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (state.items.length === 0) {
    return (
      <section style={{ padding: '64px 0', minHeight: '60vh' }}>
        <div className="container">
          <div className="pastel-card" style={{ padding: 48, textAlign: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Your cart is empty</h2>
            <p style={{ marginBottom: 24 }}>Add some items to your cart before checkout.</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Start Shopping
            </button>
          </div>
        </div>
      </section>
    );
  }

  const fieldStyle: React.CSSProperties = { display: 'grid', gap: 6, marginBottom: 10 };

  return (
    <section className="checkout-page" style={{ padding: '64px 0', background: 'var(--cream)', minHeight: '60vh' }}>
      <div className="container">
        <h1 style={{ marginBottom: 32 }}>Checkout</h1>
        
        <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
          <div className="pastel-card" style={{ padding: 24 }}>
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>Shipping Information</h2>
            
            {error && (
              <div style={{
                padding: 12,
                background: '#FFE8E8',
                borderRadius: 8,
                marginBottom: 20,
                color: 'var(--coral)',
                border: '1px solid var(--coral)'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={fieldStyle}>
                <label style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="You can create an account after checkout"
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    fontSize: 16
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}>
                  <label style={{ fontWeight: 600, color: 'var(--navy)' }}>First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="First Name"
                    style={{
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '10px',
                      fontSize: 16
                    }}
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={{ fontWeight: 600, color: 'var(--navy)' }}>Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Last Name"
                    style={{
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '10px',
                      fontSize: 16
                    }}
                  />
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={{ fontWeight: 600, color: 'var(--navy)' }}>Mobile Number *</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  placeholder="Mobile Number"
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    fontSize: 16
                  }}
                />
              </div>

              <div style={fieldStyle}>
                <label style={{ fontWeight: 600, color: 'var(--navy)' }}>Street Address *</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                  placeholder="Street Address"
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    fontSize: 16
                  }}
                />
              </div>

              <div style={fieldStyle}>
                <label style={{ fontWeight: 600, color: 'var(--navy)' }}>Country *</label>
                <input
                  type="text"
                  value="Bangladesh"
                  disabled
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    fontSize: 16,
                    backgroundColor: 'var(--cream)',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <LocationSelector
                selectedDistrict={regionState}
                selectedCity={cityArea}
                onDistrictChange={setRegionState}
                onCityChange={setCityArea}
              />

              <div style={fieldStyle}>
                <label style={{ fontWeight: 600, color: 'var(--navy)' }}>Zip/Postal Code</label>
                <input
                  type="text"
                  value={zipPostalCode}
                  onChange={(e) => setZipPostalCode(e.target.value)}
                  placeholder="Zip/Postal Code"
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    fontSize: 16
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sameAddress}
                    onChange={(e) => setSameAddress(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span style={{ color: 'var(--navy)' }}>My billing and shipping address are the same</span>
                </label>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 8 }}>
                  Shipping Method *
                </label>
                <div style={{
                  padding: 12,
                  background: 'var(--cream)',
                  borderRadius: 8,
                  border: '1px solid var(--border-light)'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      defaultChecked
                      style={{ cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>Standard Shipping</div>
                      <div style={{ fontSize: 14, color: 'var(--navy)', opacity: 0.8 }}>
                        Within 3-4 days inside Dhaka, within 4-7 days outside Dhaka
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', marginTop: 4 }}>
                        Tk {shippingCost.toFixed(2)}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  Additional Instructions for Delivery
                </label>
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Add Instructions for Delivery"
                  rows={4}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    fontSize: 16,
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 8 }}>
                  Payment Method *
                </label>
                <div style={{
                  padding: 12,
                  background: 'var(--cream)',
                  borderRadius: 8,
                  border: '1px solid var(--border-light)'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="payment"
                      value="Cash on Delivery"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 600 }}>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <LoadingButton
                type="submit"
                loading={loading}
                loadingKey="checkout-submit"
                variant="primary"
                size="lg"
                style={{
                  width: '100%',
                  marginTop: 8
                }}
              >
                {loading ? 'Placing Order...' : `Place Order - Tk ${grandTotal.toFixed(2)}`}
              </LoadingButton>
            </form>
          </div>

          <div style={{ position: 'sticky', top: 100, height: 'fit-content' }}>
            <div className="pastel-card" style={{ padding: 24 }}>
              <h3 style={{ marginTop: 0, marginBottom: 24 }}>Order Summary</h3>
              
              <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
                {state.items.map(item => (
                  <div
                    key={item.id + (item.size ?? '')}
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
                        borderRadius: 8
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: 14, color: 'var(--navy)', marginBottom: 4 }}>
                        Size: {item.size || 'One Size'} × {item.quantity}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)' }}>
                        Tk {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                borderTop: '2px solid var(--cream)',
                paddingTop: 16,
                marginTop: 16
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  color: 'var(--navy)'
                }}>
                  <span>Subtotal</span>
                  <span>Tk {totalPrice.toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  color: 'var(--navy)'
                }}>
                  <span>Shipping</span>
                  <span>Tk {shippingCost.toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 20,
                  fontWeight: 800,
                  color: 'var(--navy)',
                  paddingTop: 16,
                  borderTop: '2px solid var(--cream)'
                }}>
                  <span>Total</span>
                  <span>Tk {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .checkout-page {
            padding: 32px 0 !important;
          }
          .checkout-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .checkout-layout > div:last-child {
            position: static !important;
            order: -1;
          }
          .checkout-layout > div:first-child {
            order: 1;
          }
          .checkout-layout input[type="text"],
          .checkout-layout input[type="email"],
          .checkout-layout input[type="tel"] {
            font-size: 16px !important;
            padding: 12px 16px !important;
            min-height: 44px !important;
          }
          .checkout-layout > div:first-child > form > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
