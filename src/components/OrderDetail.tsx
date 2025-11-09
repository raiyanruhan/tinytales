import { Order } from '@services/orderApi';

interface OrderDetailProps {
  order: Order;
  onCancel?: (orderId: string) => void;
  showCancelButton?: boolean;
}

export default function OrderDetail({ order, onCancel, showCancelButton = false }: OrderDetailProps) {
  const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = order.shipping?.cost || 0;
  const grandTotal = total + shippingCost;
  const canCancel = order.status === 'pending' && showCancelButton;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--sunshine)';
      case 'approved': return 'var(--mint)';
      case 'awaiting_processing': return 'var(--sky)';
      case 'order_confirmation': return 'var(--mint)';
      case 'shipped': return 'var(--sky)';
      case 'delivered': return '#44B090';
      case 'cancelled': return 'var(--coral)';
      case 'refused': return 'var(--coral)';
      default: return 'var(--navy)';
    }
  };

  return (
    <div className="pastel-card" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Order #{order.orderNumber}</h2>
          <div style={{ color: 'var(--navy)', fontSize: 14 }}>
            Placed on {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <div style={{
          padding: '12px 24px',
          borderRadius: 12,
          background: getStatusColor(order.status),
          color: 'white',
          fontWeight: 700,
          fontSize: 16,
          textTransform: 'capitalize'
        }}>
          {order.status.replace('_', ' ')}
        </div>
      </div>

      {order.adminStatus && (
        <div style={{
          padding: 12,
          background: 'var(--cream)',
          borderRadius: 8,
          marginBottom: 24
        }}>
          <strong>Status:</strong> {order.adminStatus}
          {order.shipperName && <div><strong>Shipper:</strong> {order.shipperName}</div>}
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16 }}>Order Items</h3>
        <div style={{ display: 'grid', gap: 16 }}>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 16,
                padding: 16,
                background: 'var(--cream)',
                borderRadius: 8
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 8
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                  {item.name}
                </div>
                <div style={{ color: 'var(--navy)', marginBottom: 4 }}>
                  Size: {item.size || 'One Size'}
                </div>
                <div style={{ color: 'var(--navy)', marginBottom: 8 }}>
                  Quantity: {item.quantity}
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--navy)' }}>
                  Tk {(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        <div>
          <h3 style={{ marginBottom: 12 }}>Shipping Address</h3>
          <div style={{ color: 'var(--navy)', lineHeight: 1.8 }}>
            {order.address.firstName} {order.address.lastName}<br />
            {order.address.streetAddress}<br />
            {order.address.cityArea}, {order.address.regionState}<br />
            {order.address.zipPostalCode}<br />
            {order.address.country}
          </div>
          {order.address.mobileNumber && (
            <div style={{ marginTop: 8 }}>
              <strong>Phone:</strong> {order.address.mobileNumber}
            </div>
          )}
          {order.address.deliveryInstructions && (
            <div style={{ marginTop: 8, padding: 12, background: 'var(--cream)', borderRadius: 8 }}>
              <strong>Delivery Instructions:</strong><br />
              {order.address.deliveryInstructions}
            </div>
          )}
        </div>

        <div>
          <h3 style={{ marginBottom: 12 }}>Order Summary</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>Tk {total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <span>Tk {shippingCost.toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: '2px solid var(--cream)',
              fontSize: 20,
              fontWeight: 800
            }}>
              <span>Total</span>
              <span>Tk {grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--cream)', borderRadius: 8 }}>
            <strong>Payment Method:</strong> {order.payment?.method || 'Cash on Delivery'}
          </div>
        </div>
      </div>

      {canCancel && onCancel && (
        <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid var(--cream)' }}>
          <button
            onClick={() => onCancel(order.id)}
            className="btn-3d"
            style={{
              background: 'var(--white)',
              color: 'var(--coral)',
              padding: '12px 24px',
              fontSize: 16
            }}
          >
            Cancel Order
          </button>
        </div>
      )}

      {order.cancelledAt && (
        <div style={{
          padding: 12,
          background: '#FFE8E8',
          borderRadius: 8,
          marginTop: 24,
          color: 'var(--coral)'
        }}>
          <strong>Order Cancelled</strong> on {new Date(order.cancelledAt).toLocaleString()}
          {order.cancelledBy && (
            <div>Cancelled by: {order.cancelledBy === 'admin' ? 'Admin' : 'You'}</div>
          )}
        </div>
      )}
    </div>
  );
}

