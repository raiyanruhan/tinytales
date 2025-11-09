import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, cancelOrder, Order } from '@services/orderApi';
import { useAuth } from '@context/AuthContext';
import OrderDetailComponent from '@components/OrderDetail';
import { useModal } from '@context/ModalContext';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAlert } = useModal();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError('');
      const orderData = await getOrder(id);
      setOrder(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder(orderId, 'Cancelled by user', user?.email);
      await loadOrder();
    } catch (err) {
      showAlert({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to cancel order',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <section style={{ padding: '64px 0', minHeight: '60vh' }}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: 48 }}>
            <p>Loading order details...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section style={{ padding: '64px 0', minHeight: '60vh' }}>
        <div className="container">
          <div className="pastel-card" style={{ padding: 48, textAlign: 'center' }}>
            <h2>Order Not Found</h2>
            <p style={{ marginBottom: 24 }}>{error || 'The order you are looking for does not exist.'}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Go Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Check if user can view this order
  const canView = !user || user.email.toLowerCase() === order.email.toLowerCase();

  if (!canView) {
    return (
      <section style={{ padding: '64px 0', minHeight: '60vh' }}>
        <div className="container">
          <div className="pastel-card" style={{ padding: 48, textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>You don't have permission to view this order.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '64px 0', minHeight: '60vh', background: 'var(--cream)' }}>
      <div className="container">
        <button
          onClick={() => navigate(user ? '/account' : '/')}
          className="btn-3d"
          style={{
            background: 'var(--white)',
            color: 'var(--navy)',
            marginBottom: 24
          }}
        >
          ← Back
        </button>
        <OrderDetailComponent
          order={order}
          onCancel={handleCancel}
          showCancelButton={user?.email.toLowerCase() === order.email.toLowerCase()}
        />
      </div>
    </section>
  );
}

