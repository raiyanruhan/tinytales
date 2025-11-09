import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createProduct, updateProduct, deleteProduct, reorderProducts, Product } from '@services/productApi';
import { getOrders, updateOrderStatus, approveOrder, refuseOrder, cancelOrder, Order } from '@services/orderApi';
import ProductList from '@components/ProductList';
import ProductForm from '@components/ProductForm';
import BulkImport from '@components/BulkImport';
import { useModal } from '@context/ModalContext';

type ViewMode = 'products' | 'orders';
type ProductViewMode = 'list' | 'add' | 'edit' | 'bulk-import';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [productViewMode, setProductViewMode] = useState<ProductViewMode>('list');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const handleAdd = () => {
    setEditingProduct(undefined);
    setProductViewMode('add');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductViewMode('edit');
  };

  const handleCancel = () => {
    setProductViewMode('list');
    setEditingProduct(undefined);
  };

  const handleSubmit = async (data: Partial<Product>) => {
    try {
      setError('');
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }
      await loadProducts();
      setProductViewMode('list');
      setEditingProduct(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  const handleReorder = async (productsWithOrder: Array<{ id: string; order: number }>) => {
    try {
      await reorderProducts(productsWithOrder);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder products');
    }
  };

  const handleOrderChange = async (id: string, order: number) => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        await updateProduct(id, { ...product, order });
        await loadProducts();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    }
  };

  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});
  const { showAlert, showConfirm, showPrompt } = useModal();

  const handleApproveOrder = async (id: string) => {
    if (loadingActions[`approve-${id}`]) return;
    setLoadingActions(prev => ({ ...prev, [`approve-${id}`]: true }));
    try {
      await approveOrder(id);
      await loadOrders();
      if (selectedOrder && selectedOrder.id === id) {
        const updated = await getOrders();
        setSelectedOrder(updated.find(o => o.id === id) || null);
      }
    } catch (err) {
      showAlert({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to approve order',
        type: 'error'
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`approve-${id}`]: false }));
    }
  };

  const handleRefuseOrder = async (id: string) => {
    if (loadingActions[`refuse-${id}`]) return;
    showPrompt({
      title: 'Refuse Order',
      message: 'Reason for refusal (optional):',
      placeholder: 'Enter reason...',
      confirmText: 'Refuse',
      cancelText: 'Cancel',
      onConfirm: async (reason) => {
        setLoadingActions(prev => ({ ...prev, [`refuse-${id}`]: true }));
        try {
          await refuseOrder(id, reason || undefined);
          await loadOrders();
          if (selectedOrder && selectedOrder.id === id) {
            const updated = await getOrders();
            setSelectedOrder(updated.find(o => o.id === id) || null);
          }
        } catch (err) {
          showAlert({
            title: 'Error',
            message: err instanceof Error ? err.message : 'Failed to refuse order',
            type: 'error'
          });
        } finally {
          setLoadingActions(prev => ({ ...prev, [`refuse-${id}`]: false }));
        }
      }
    });
  };

  const handleUpdateOrderStatus = async (id: string, status: string, adminStatus?: string, shipperName?: string) => {
    if (loadingActions[`update-${id}`]) return;
    setLoadingActions(prev => ({ ...prev, [`update-${id}`]: true }));
    try {
      await updateOrderStatus(id, status, adminStatus, shipperName);
      await loadOrders();
      if (selectedOrder && selectedOrder.id === id) {
        const updated = await getOrders();
        setSelectedOrder(updated.find(o => o.id === id) || null);
      }
    } catch (err) {
      showAlert({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to update order status',
        type: 'error'
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`update-${id}`]: false }));
    }
  };

  const handleCancelOrder = async (id: string) => {
    if (loadingActions[`cancel-${id}`]) return;
    showConfirm({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      confirmText: 'Cancel Order',
      cancelText: 'No',
      onConfirm: async () => {
        setLoadingActions(prev => ({ ...prev, [`cancel-${id}`]: true }));
        try {
          await cancelOrder(id, 'Cancelled by admin');
          await loadOrders();
          if (selectedOrder && selectedOrder.id === id) {
            const updated = await getOrders();
            setSelectedOrder(updated.find(o => o.id === id) || null);
          }
        } catch (err) {
          showAlert({
            title: 'Error',
            message: err instanceof Error ? err.message : 'Failed to cancel order',
            type: 'error'
          });
        } finally {
          setLoadingActions(prev => ({ ...prev, [`cancel-${id}`]: false }));
        }
      }
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const matchesSearch = !orderSearch || 
      order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.email.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading && products.length === 0 && viewMode === 'products') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        background: 'var(--cream)'
      }}>
        <div style={{ fontSize: 18, color: 'var(--navy)' }}>Loading products...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', background: 'var(--cream)', padding: '2rem' }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '2px solid var(--border-light)' }}>
          <button
            onClick={() => { setViewMode('products'); setSelectedOrder(null); }}
            style={{
              padding: '12px 24px',
              background: viewMode === 'products' ? 'var(--mint)' : 'transparent',
              color: viewMode === 'products' ? 'white' : 'var(--navy)',
              border: 'none',
              borderBottom: viewMode === 'products' ? '3px solid var(--mint)' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 16
            }}
          >
            Products
          </button>
          <button
            onClick={() => { setViewMode('orders'); setSelectedOrder(null); }}
            style={{
              padding: '12px 24px',
              background: viewMode === 'orders' ? 'var(--mint)' : 'transparent',
              color: viewMode === 'orders' ? 'white' : 'var(--navy)',
              border: 'none',
              borderBottom: viewMode === 'orders' ? '3px solid var(--mint)' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 16
            }}
          >
            Orders
          </button>
        </div>

        {viewMode === 'products' ? (
          productViewMode === 'list' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, color: 'var(--navy)' }}>Product Management</h1>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setProductViewMode('bulk-import')}
                    style={{
                      padding: '0.75rem 2rem',
                      background: 'var(--white)',
                      color: 'var(--navy)',
                      border: '2px solid var(--mint)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--mint)'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--white)'
                      e.currentTarget.style.color = 'var(--navy)'
                    }}
                  >
                    Bulk Import
                  </button>
                  <button
                    onClick={handleAdd}
                    className="btn-primary"
                    style={{ padding: '0.75rem 2rem' }}
                  >
                    Add New Product
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '1rem',
                  background: '#fee',
                  color: 'var(--coral)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.5rem'
                }}>
                  {error}
                </div>
              )}

              <ProductList
                products={products}
                onReorder={handleReorder}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onOrderChange={handleOrderChange}
              />
            </>
          ) : productViewMode === 'bulk-import' ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <BulkImport
                onImportComplete={() => {
                  loadProducts();
                  setProductViewMode('list');
                }}
                onCancel={() => setProductViewMode('list')}
              />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--cream)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                >
                  ← Back to List
                </button>
                <h1 style={{ margin: 0, color: 'var(--navy)' }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h1>
              </div>

              <ProductForm
                product={editingProduct}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </>
          )
        ) : selectedOrder ? (
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
            <OrderManagementDetail
              order={selectedOrder}
              onApprove={handleApproveOrder}
              onRefuse={handleRefuseOrder}
              onUpdateStatus={handleUpdateOrderStatus}
              onCancel={handleCancelOrder}
            />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <h1 style={{ margin: 0, color: 'var(--navy)' }}>Order Management</h1>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search by order # or email..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="refused">Refused</option>
                  <option value="awaiting_processing">Awaiting Processing</option>
                  <option value="order_confirmation">Order Confirmation</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '1rem',
                background: '#fee',
                color: 'var(--coral)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gap: 16 }}>
              {filteredOrders.length === 0 ? (
                <div className="pastel-card" style={{ padding: 48, textAlign: 'center' }}>
                  <p>No orders found</p>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  return (
                    <div
                      key={order.id}
                      className="pastel-card"
                      style={{
                        padding: 24,
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                      onClick={() => setSelectedOrder(order)}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                            Order #{order.orderNumber}
                          </div>
                          <div style={{ color: 'var(--navy)', fontSize: 14, marginBottom: 4 }}>
                            {order.email}
                          </div>
                          <div style={{ color: 'var(--navy)', fontSize: 14 }}>
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            background: order.status === 'pending' ? 'var(--sunshine)' :
                                      order.status === 'approved' ? 'var(--mint)' :
                                      order.status === 'shipped' ? 'var(--sky)' :
                                      order.status === 'delivered' ? '#44B090' :
                                      'var(--coral)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: 14,
                            textTransform: 'capitalize',
                            marginBottom: 8
                          }}>
                            {order.status.replace('_', ' ')}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--navy)' }}>
                            Tk {total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Order Management Detail Component
function OrderManagementDetail({
  order,
  onApprove,
  onRefuse,
  onUpdateStatus,
  onCancel
}: {
  order: Order;
  onApprove: (id: string) => void;
  onRefuse: (id: string) => void;
  onUpdateStatus: (id: string, status: string, adminStatus?: string, shipperName?: string) => void;
  onCancel: (id: string) => void;
}) {
  const [adminStatus, setAdminStatus] = useState(order.adminStatus || '');
  const [shipperName, setShipperName] = useState(order.shipperName || '');
  const [status, setStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const { showAlert, showConfirm } = useModal();
  
  // Check if order is delivered - lock all actions (use order.status to get latest)
  const isDelivered = order.status === 'delivered';
  
  // Update local state when order prop changes
  useEffect(() => {
    setStatus(order.status);
    setAdminStatus(order.adminStatus || '');
    setShipperName(order.shipperName || '');
  }, [order.status, order.adminStatus, order.shipperName]);
  
  // Check if anything has actually changed
  const hasChanges = 
    status !== order.status ||
    adminStatus !== (order.adminStatus || '') ||
    shipperName !== (order.shipperName || '');

  const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = order.shipping?.cost || 0;
  const grandTotal = total + shippingCost;

  const handleStatusChange = (newStatus: string) => {
    if (isDelivered || isUpdating) return;
    // Just update local state, don't save yet - wait for "Update Status" button
    setStatus(newStatus);
  };

  const statusOptions = [
    { value: 'awaiting_processing', label: 'Awaiting Processing' },
    { value: 'order_confirmation', label: 'Order Confirmation' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' }
  ];

  // Status progression - cannot go backwards
  const canChangeToStatus = (targetStatus: string) => {
    const statusOrder: { [key: string]: number } = {
      'pending': 0,
      'awaiting_processing': 1,
      'order_confirmation': 2,
      'shipped': 3,
      'delivered': 4
    };
    const currentOrder = statusOrder[status] || 0;
    const targetOrder = statusOrder[targetStatus] || 0;
    return targetOrder >= currentOrder;
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
          background: status === 'pending' ? 'var(--sunshine)' :
                    status === 'approved' ? 'var(--mint)' :
                    status === 'shipped' ? 'var(--sky)' :
                    status === 'delivered' ? '#44B090' :
                    'var(--coral)',
          color: 'white',
          fontWeight: 700,
          fontSize: 16,
          textTransform: 'capitalize'
        }}>
          {status.replace('_', ' ')}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16 }}>Customer Information</h3>
        <div style={{ padding: 16, background: 'var(--cream)', borderRadius: 8 }}>
          <p><strong>Email:</strong> {order.email}</p>
          <p><strong>Name:</strong> {order.address.firstName} {order.address.lastName}</p>
          <p><strong>Phone:</strong> {order.address.mobileNumber}</p>
        </div>
      </div>

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
                  Size: {item.size || 'One Size'} | Quantity: {item.quantity}
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
            {order.address.streetAddress}<br />
            {order.address.cityArea}, {order.address.regionState}<br />
            {order.address.zipPostalCode}<br />
            {order.address.country}
          </div>
          {order.address.deliveryInstructions && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--cream)', borderRadius: 8 }}>
              <strong>Instructions:</strong> {order.address.deliveryInstructions}
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
            <strong>Payment:</strong> {order.payment?.method || 'Cash on Delivery'}
          </div>
        </div>
      </div>

      <div style={{
        padding: 24,
        background: 'var(--cream)',
        borderRadius: 12,
        marginBottom: 24
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Order Actions</h3>
        
        {isDelivered ? (
          <div style={{
            padding: 20,
            background: '#E8F5E9',
            borderRadius: 12,
            textAlign: 'center',
            marginBottom: 16
          }}>
            <p style={{ margin: 0, color: '#44B090', fontWeight: 600, fontSize: 18 }}>
              ✅ Order Delivered - No further actions available
            </p>
          </div>
        ) : (
          <>
            {order.status === 'pending' && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={() => onApprove(order.id)}
                  className="btn-primary"
                  disabled={isUpdating}
                  style={{ opacity: isUpdating ? 0.6 : 1, cursor: isUpdating ? 'not-allowed' : 'pointer' }}
                >
                  {isUpdating ? 'Processing...' : 'Approve Order'}
                </button>
                <button
                  onClick={() => onRefuse(order.id)}
                  className="btn-3d"
                  disabled={isUpdating}
                  style={{
                    background: 'var(--white)',
                    color: 'var(--coral)',
                    opacity: isUpdating ? 0.6 : 1,
                    cursor: isUpdating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUpdating ? 'Processing...' : 'Refuse Order'}
                </button>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating || isDelivered}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: 8,
                  fontSize: 16,
                  marginBottom: 12,
                  opacity: isUpdating || isDelivered ? 0.6 : 1,
                  cursor: isUpdating || isDelivered ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="pending">Pending</option>
                {statusOptions.map(opt => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={!canChangeToStatus(opt.value) || isDelivered}
                  >
                    {opt.label} {!canChangeToStatus(opt.value) ? '(Cannot go backwards)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Admin Status (Optional)
              </label>
              <input
                type="text"
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value)}
                placeholder="e.g., Order confirmation, Awaiting processing"
                disabled={isDelivered}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: 8,
                  fontSize: 16,
                  marginBottom: 12,
                  opacity: isDelivered ? 0.6 : 1,
                  cursor: isDelivered ? 'not-allowed' : 'text'
                }}
              />
            </div>

            {status === 'shipped' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Shipper Name
                </label>
                <input
                  type="text"
                  value={shipperName}
                  onChange={(e) => setShipperName(e.target.value)}
                  placeholder="e.g., Sundarban"
                  disabled={isDelivered}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: 8,
                    fontSize: 16,
                    opacity: isDelivered ? 0.6 : 1,
                    cursor: isDelivered ? 'not-allowed' : 'text'
                  }}
                />
              </div>
            )}

            <button
              onClick={async () => {
                if (!hasChanges) {
                  showAlert({
                    title: 'No Changes',
                    message: 'Please modify the status, admin status, or shipper name first.',
                    type: 'info'
                  });
                  return;
                }
                
                showConfirm({
                  title: 'Update Order Status',
                  message: `Are you sure you want to update the order status to "${status.replace('_', ' ')}"?`,
                  confirmText: 'Update',
                  cancelText: 'Cancel',
                  onConfirm: async () => {
                    setIsUpdating(true);
                    setUpdateSuccess(false);
                    try {
                      await onUpdateStatus(order.id, status, adminStatus, shipperName);
                      setUpdateSuccess(true);
                      setTimeout(() => setUpdateSuccess(false), 3000);
                    } catch (err) {
                      // Error handled in parent
                    } finally {
                      setIsUpdating(false);
                    }
                  }
                });
              }}
              className="btn-primary"
              disabled={isUpdating || isDelivered || !hasChanges}
              style={{
                width: '100%',
                marginBottom: 12,
                opacity: (isUpdating || isDelivered || !hasChanges) ? 0.6 : 1,
                cursor: (isUpdating || isDelivered || !hasChanges) ? 'not-allowed' : 'pointer',
                background: updateSuccess ? '#44B090' : undefined
              }}
            >
              {isUpdating ? 'Updating...' : updateSuccess ? '✓ Updated Successfully!' : 'Update Status'}
            </button>
            {!hasChanges && !isDelivered && (
              <p style={{ 
                fontSize: 14, 
                color: '#666', 
                textAlign: 'center', 
                marginTop: -8, 
                marginBottom: 12,
                fontStyle: 'italic'
              }}>
                Make changes to enable update
              </p>
            )}

            <button
              onClick={() => onCancel(order.id)}
              className="btn-3d"
              disabled={isDelivered}
              style={{
                width: '100%',
                background: 'var(--white)',
                color: 'var(--coral)',
                opacity: isDelivered ? 0.6 : 1,
                cursor: isDelivered ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel Order (Admin)
            </button>
          </>
        )}
      </div>
    </div>
  );
}


