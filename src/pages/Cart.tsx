import { Link } from 'react-router-dom'
import { useCart } from '@context/CartContext'
import { CartIcon, TakaIcon } from '@components/Icons'

export default function CartPage() {
  const { state, removeItem, setQuantity, totalPrice, clear } = useCart()
  const empty = state.items.length === 0

  return (
    <section style={{ padding: '64px 0', background: 'var(--cream)', minHeight: '60vh' }}>
      <div className="container">
        <h1 style={{ marginBottom: 32 }}>Your Cart</h1>
        
        {empty ? (
          <div className="pastel-card" style={{
            padding: '64px 32px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: 24, color: 'var(--mint)' }}>
              <CartIcon size="4x" style={{ fontSize: 64 }} />
            </div>
            <h2 style={{ marginBottom: 16 }}>Your cart is empty</h2>
            <p style={{ color: 'var(--navy)', marginBottom: 32 }}>
              Start adding items to see them here!
            </p>
            <Link to="/" className="btn-primary">
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 32
          }}>
            <div className="pastel-card" style={{ padding: 24 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '2px solid var(--cream)'
              }}>
                <h2 style={{ margin: 0 }}>Items ({state.items.length})</h2>
                <button
                  onClick={clear}
                  className="btn-3d"
                  style={{
                    background: 'var(--white)',
                    color: 'var(--coral)',
                    fontWeight: 700,
                    fontSize: 16,
                    padding: '12px 24px',
                    minWidth: 'auto'
                  }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ display: 'grid', gap: 24 }}>
                {state.items.map(item => (
                  <div
                    key={item.id + (item.size ?? '')}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr auto',
                      gap: 16,
                      padding: 16,
                      background: 'var(--cream)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '100%',
                        aspectRatio: '1/1',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    />
                    
                    <div>
                      <h3 style={{ fontSize: 18, marginBottom: 8 }}>{item.name}</h3>
                      <div style={{
                        fontSize: 14,
                        color: 'var(--navy)',
                        marginBottom: 12
                      }}>
                        Size: {item.size ?? 'One Size'}
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center'
                      }}>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => setQuantity(item.id, Math.max(1, Number(e.target.value)), item.size)}
                          style={{
                            width: 80,
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: 16,
                            fontWeight: 600
                          }}
                        />
                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="btn-3d"
                          style={{
                            background: 'var(--white)',
                            color: 'var(--coral)',
                            padding: '10px 20px',
                            fontSize: 14,
                            fontWeight: 700,
                            minWidth: 'auto'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: 'var(--navy)',
                        marginBottom: 8
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <TakaIcon size="xs" style={{ fontSize: '14px' }} />
                          {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 14,
                        color: 'var(--navy)',
                        opacity: 0.7,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <TakaIcon size="xs" style={{ fontSize: '12px' }} />
                        {item.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: 'sticky', top: 100, height: 'fit-content' }}>
              <div className="pastel-card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 24 }}>Order Summary</h3>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  color: 'var(--navy)'
                }}>
                  <span>Subtotal</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <TakaIcon size="xs" style={{ fontSize: '14px' }} />
                    {totalPrice.toFixed(2)}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  color: 'var(--navy)'
                }}>
                  <span>Shipping</span>
                  <span>{totalPrice > 50 ? 'Free' : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <TakaIcon size="xs" style={{ fontSize: '14px' }} />
                      5.99
                    </span>
                  )}</span>
                </div>

                <div style={{
                  borderTop: '2px solid var(--cream)',
                  paddingTop: 16,
                  marginTop: 16,
                  marginBottom: 24
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 20,
                    fontWeight: 800,
                    color: 'var(--navy)'
                  }}>
                    <span>Total</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TakaIcon size="sm" style={{ fontSize: '18px' }} />
                      {(totalPrice + (totalPrice > 50 ? 0 : 5.99)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    display: 'block'
                  }}
                >
                  Proceed to Checkout →
                </Link>

                {totalPrice < 50 && (
                  <div style={{
                    marginTop: 16,
                    padding: 12,
                    background: 'var(--sunshine)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 14,
                    textAlign: 'center',
                    color: 'var(--ink)',
                    fontWeight: 600
                  }}>
                    Add <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><TakaIcon size="xs" style={{ fontSize: '12px' }} />{(50 - totalPrice).toFixed(2)}</span> more for free shipping!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
