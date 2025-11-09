import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, cancelOrder } from '@services/orderApi';
import { useAuth } from '@context/AuthContext';
import { useModal } from '@context/ModalContext';

interface OrderHistoryProps {
  orders: Order[];
  onCancel?: (orderId: string) => void;
}

export default function OrderHistory({ orders, onCancel }: OrderHistoryProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAlert, showConfirm } = useModal();

  const handleCancel = async (order: Order) => {
    showConfirm({
      title: 'Cancel Order',
      message: `Are you sure you want to cancel order ${order.orderNumber}?`,
      confirmText: 'Cancel Order',
      cancelText: 'No',
      onConfirm: async () => {
        setCancellingId(order.id);
        try {
          await cancelOrder(order.id, 'Cancelled by user', user?.email);
          if (onCancel) {
            onCancel(order.id);
          }
        } catch (error) {
          showAlert({
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to cancel order',
            type: 'error'
          });
        } finally {
          setCancellingId(null);
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--sunshine)';
      case 'approved': return 'var(--mint)';
      case 'shipped': return 'var(--sky)';
      case 'delivered': return '#44B090';
      case 'cancelled': return 'var(--coral)';
      case 'refused': return 'var(--coral)';
      default: return 'var(--navy)';
    }
  };

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ color: 'var(--navy)', fontSize: 18 }}>No orders found</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {orders.map(order => {
        const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const canCancel = order.status === 'pending';

        return (
          <div
            key={order.id}
            className="pastel-card"
            style={{
              padding: 24,
              display: 'grid',
              gap: 16
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                  Order #{order.orderNumber}
                </div>
                <div style={{ color: 'var(--navy)', fontSize: 14 }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: getStatusColor(order.status),
                color: 'white',
                fontWeight: 700,
                fontSize: 14,
                textTransform: 'capitalize'
              }}>
                {order.status.replace('_', ' ')}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              padding: 16,
              background: 'var(--cream)',
              borderRadius: 8
            }}>
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8 }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: 'cover',
                      borderRadius: 6
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--navy)' }}>
                      Qty: {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
              {order.items.length > 3 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--navy)',
                  fontSize: 14
                }}>
                  +{order.items.length - 3} more
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 16,
              borderTop: '1px solid var(--cream)'
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>
                Total: Tk {total.toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {canCancel && (
                  <button
                    onClick={() => handleCancel(order)}
                    disabled={cancellingId === order.id}
                    className="btn-3d"
                    style={{
                      background: 'var(--white)',
                      color: 'var(--coral)',
                      padding: '10px 20px',
                      fontSize: 14,
                      opacity: cancellingId === order.id ? 0.6 : 1
                    }}
                  >
                    {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
                <button
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="btn-primary"
                  style={{
                    padding: '10px 20px',
                    fontSize: 14
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

