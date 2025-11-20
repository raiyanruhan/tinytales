import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createProduct, updateProduct, deleteProduct, reorderProducts, Product } from '@services/productApi';
import { getOrders, updateOrderStatus, approveOrder, refuseOrder, cancelOrder, Order } from '@services/orderApi';
import ProductList from '@components/ProductList';
import ProductForm from '@components/ProductForm';
import BulkImport from '@components/BulkImport';
import { useModal } from '@context/ModalContext';
import { GiCardboardBox } from 'react-icons/gi';
import { MdAssignment, MdCloudUpload, MdWarning, MdArrowBack, MdSearch, MdClose, MdEmail, MdLocationOn, MdCalendarToday, MdCheckCircle } from 'react-icons/md';
import { ProductsIcon } from '@components/Icons';
import { OrderCardSkeleton, ProductCardSkeleton } from '@components/Skeleton';
import { toast } from '@utils/toast';

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

  // Reload orders when switching to orders view
  useEffect(() => {
    if (viewMode === 'orders') {
      loadOrders();
    }
  }, [viewMode]);

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
      setLoading(true);
      setError('');
      const data = await getOrders();
      console.log('Orders loaded:', data);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      setError(errorMessage);
      setOrders([]);
      
      // If it's an authentication error, show a more helpful message
      if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('permission')) {
        setError('You need admin permissions to view all orders. Please ensure you are logged in as an admin.');
      }
    } finally {
      setLoading(false);
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
    const product = products.find(p => p.id === id);
    const toastId = toast.loading('Deleting product...');
    
    try {
      await deleteProduct(id);
      toast.dismiss(toastId);
      toast.success('Product deleted', {
        description: `${product?.name || 'Product'} has been removed`,
      });
      await loadProducts();
    } catch (err) {
      toast.dismiss(toastId);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      toast.error('Failed to delete product', {
        description: errorMessage,
      });
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
    
    // Optimistic update - update UI immediately
    const previousOrder = orders.find(o => o.id === id);
    if (previousOrder) {
      const optimisticOrder = { ...previousOrder, status, adminStatus, shipperName };
      setOrders(prev => prev.map(o => o.id === id ? optimisticOrder : o));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(optimisticOrder);
      }
    }
    
    setLoadingActions(prev => ({ ...prev, [`update-${id}`]: true }));
    
    try {
      await updateOrderStatus(id, status, adminStatus, shipperName);
      // Reload to get server state (in case of any differences)
      await loadOrders();
      if (selectedOrder && selectedOrder.id === id) {
        const updated = await getOrders();
        setSelectedOrder(updated.find(o => o.id === id) || null);
      }
      toast.success('Order status updated', {
        description: `Order #${previousOrder?.orderNumber} status changed to ${status}`,
      });
    } catch (err) {
      // Revert optimistic update on error
      if (previousOrder) {
        setOrders(prev => prev.map(o => o.id === id ? previousOrder : o));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(previousOrder);
        }
      }
      toast.error('Failed to update order status', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`update-${id}`]: false }));
    }
  };

  const handleCancelOrder = async (id: string) => {
    if (loadingActions[`cancel-${id}`]) return;
    
    const orderToCancel = orders.find(o => o.id === id);
    
    showConfirm({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      confirmText: 'Cancel Order',
      cancelText: 'No',
      onConfirm: async () => {
        // Optimistic update
        if (orderToCancel) {
          const optimisticOrder = { ...orderToCancel, status: 'cancelled' };
          setOrders(prev => prev.map(o => o.id === id ? optimisticOrder : o));
          if (selectedOrder && selectedOrder.id === id) {
            setSelectedOrder(optimisticOrder);
          }
        }
        
        setLoadingActions(prev => ({ ...prev, [`cancel-${id}`]: true }));
        try {
          await cancelOrder(id, 'Cancelled by admin');
          await loadOrders();
          if (selectedOrder && selectedOrder.id === id) {
            const updated = await getOrders();
            setSelectedOrder(updated.find(o => o.id === id) || null);
          }
          toast.success('Order cancelled', {
            description: `Order #${orderToCancel?.orderNumber} has been cancelled`,
          });
        } catch (err) {
          // Revert optimistic update on error
          if (orderToCancel) {
            setOrders(prev => prev.map(o => o.id === id ? orderToCancel : o));
            if (selectedOrder && selectedOrder.id === id) {
              setSelectedOrder(orderToCancel);
            }
          }
          toast.error('Failed to cancel order', {
            description: err instanceof Error ? err.message : 'Please try again',
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
        padding: '2rem',
        background: 'var(--cream)',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '1.5rem'
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page" style={{ 
      minHeight: 'calc(100vh - 80px)', 
      background: '#f5f7fa', 
      padding: '0'
    }}>
      <div className="dashboard-container" style={{ 
        maxWidth: '1600px', 
        margin: '0 auto',
        background: '#ffffff',
        minHeight: 'calc(100vh - 80px)',
        boxShadow: '0 0 1px rgba(0,0,0,0.1)'
      }}>
        {/* Professional Tabs with Enhanced Visual Hierarchy */}
        <div className="dashboard-tabs" style={{ 
          display: 'flex', 
          gap: '4px', 
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
          padding: '8px 2rem 0 2rem',
          overflowX: 'hidden',
          position: 'relative',
          minHeight: '56px'
        }}>
          <button
            onClick={() => { setViewMode('products'); setSelectedOrder(null); }}
            className={`dashboard-tab ${viewMode === 'products' ? 'active' : ''}`}
            style={{
              padding: '12px 24px',
              background: viewMode === 'products' ? '#ffffff' : 'transparent',
              color: viewMode === 'products' ? '#1f2937' : '#6b7280',
              border: 'none',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              borderBottom: viewMode === 'products' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: viewMode === 'products' ? 600 : 500,
              fontSize: '14px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '-1px',
              boxShadow: viewMode === 'products' ? '0 -2px 8px rgba(0,0,0,0.04)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'products') {
                e.currentTarget.style.color = '#1f2937';
                e.currentTarget.style.background = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'products') {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <ProductsIcon 
              size="lg" 
              style={{ 
                fontSize: '16px',
                opacity: viewMode === 'products' ? 1 : 0.7
              }} 
            />
            <span>Products</span>
            {viewMode === 'products' && (
              <span style={{
                marginLeft: '4px',
                padding: '2px 8px',
                background: '#2563eb',
                color: '#ffffff',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                lineHeight: '16px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {products.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setViewMode('orders'); setSelectedOrder(null); }}
            className={`dashboard-tab ${viewMode === 'orders' ? 'active' : ''}`}
            style={{
              padding: '12px 24px',
              background: viewMode === 'orders' ? '#ffffff' : 'transparent',
              color: viewMode === 'orders' ? '#1f2937' : '#6b7280',
              border: 'none',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              borderBottom: viewMode === 'orders' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: viewMode === 'orders' ? 600 : 500,
              fontSize: '14px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '-1px',
              boxShadow: viewMode === 'orders' ? '0 -2px 8px rgba(0,0,0,0.04)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'orders') {
                e.currentTarget.style.color = '#1f2937';
                e.currentTarget.style.background = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'orders') {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <MdAssignment 
              size={16} 
              style={{ 
                opacity: viewMode === 'orders' ? 1 : 0.7
              }} 
            />
            <span>Orders</span>
            {viewMode === 'orders' && (
              <span style={{
                marginLeft: '4px',
                padding: '2px 8px',
                background: '#2563eb',
                color: '#ffffff',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                lineHeight: '16px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="dashboard-content" style={{ padding: '2rem' }}>

        {viewMode === 'products' ? (
          productViewMode === 'list' ? (
            <>
              <div className="dashboard-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem',
                flexWrap: 'wrap', 
                gap: 16 
              }}>
                <div>
                  <h2 style={{ 
                    margin: 0, 
                    color: '#1f2937',
                    fontSize: '20px',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }}>
                    Product Management
                  </h2>
                  <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: 400
                  }}>
                    Manage your product catalog and inventory
                  </p>
                </div>
                <div className="dashboard-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setProductViewMode('bulk-import')}
                    className="btn-secondary"
                    style={{
                      padding: '16px 32px',
                      fontSize: '16px',
                      minWidth: 'auto'
                    }}
                  >
                    <MdCloudUpload size={18} style={{ marginRight: '4px' }} /> Bulk Import
                  </button>
                  <button
                    onClick={handleAdd}
                    className="btn-primary"
                    style={{
                      padding: '16px 32px',
                      fontSize: '16px',
                      minWidth: 'auto'
                    }}
                  >
                    <span>+</span> Add Product
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '12px 16px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  border: '1px solid #fecaca',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <MdWarning size={18} /> {error}
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
            <>
              {/* Breadcrumb Navigation */}
              <div style={{ marginBottom: '1.5rem' }}>
                <nav style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '1rem',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <button
                    onClick={() => setProductViewMode('list')}
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2563eb';
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <MdArrowBack size={18} style={{ marginRight: '4px' }} /> Products
                  </button>
                  <span style={{ color: '#d1d5db' }}>/</span>
                  <span style={{ color: '#1f2937', fontWeight: 500 }}>
                    Bulk Import Products
                  </span>
                </nav>
                <h2 style={{ 
                  margin: 0, 
                  color: '#1f2937',
                  fontSize: '24px',
                  fontWeight: 600,
                  letterSpacing: '-0.025em'
                }}>
                  Bulk Import Products
                </h2>
                <p style={{
                  margin: '4px 0 0 0',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: 400
                }}>
                  Import multiple products at once using a CSV file
                </p>
              </div>
              <BulkImport
                onImportComplete={() => {
                  loadProducts();
                  setProductViewMode('list');
                }}
                onCancel={() => setProductViewMode('list')}
              />
            </>
          ) : (
            <>
              {/* Breadcrumb Navigation */}
              <div style={{ marginBottom: '1.5rem' }}>
                <nav style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '1rem',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <button
                    onClick={handleCancel}
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2563eb';
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <MdArrowBack size={18} style={{ marginRight: '4px' }} /> Products
                  </button>
                  <span style={{ color: '#d1d5db' }}>/</span>
                  <span style={{ color: '#1f2937', fontWeight: 500 }}>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </span>
                </nav>
                <h2 style={{ 
                  margin: 0, 
                  color: '#1f2937',
                  fontSize: '24px',
                  fontWeight: 600,
                  letterSpacing: '-0.025em'
                }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p style={{
                  margin: '4px 0 0 0',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: 400
                }}>
                  {editingProduct ? 'Update product information and settings' : 'Create a new product for your catalog'}
                </p>
              </div>

              <ProductForm
                product={editingProduct}
                products={products}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </>
          )
        ) : selectedOrder ? (
          <div>
            {/* Breadcrumb Navigation for Order Detail */}
            <nav style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '1.5rem',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                  e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <MdArrowBack size={18} style={{ marginRight: '4px' }} /> Orders
              </button>
              <span style={{ color: '#d1d5db' }}>/</span>
              <span style={{ color: '#1f2937', fontWeight: 500 }}>
                Order #{selectedOrder.orderNumber}
              </span>
            </nav>
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
            <div className="order-management-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: 24, 
              flexWrap: 'wrap', 
              gap: 16 
            }}>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  color: '#1f2937',
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '4px'
                }}>
                  Order Management
                </h2>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: 400
                }}>
                  Track and manage customer orders
                </p>
              </div>
              <div className="order-filters" style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                width: '100%'
              }}>
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search by order # or email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="order-search-input"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: '#ffffff',
                      transition: 'all 0.15s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '16px'
                  }}>
                    <MdSearch size={16} />
                  </span>
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="order-filter-select"
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: '#ffffff',
                    cursor: 'pointer',
                    minWidth: '180px',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
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
                {(orderSearch || orderStatusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setOrderSearch('');
                      setOrderStatusFilter('all');
                    }}
                    className="btn-3d"
                    style={{
                      padding: '12px 20px',
                      fontSize: '14px',
                      minWidth: 'auto'
                    }}
                  >
                    <MdClose size={16} style={{ marginRight: '4px' }} /> Clear Filters
                  </button>
                )}
                <div style={{
                  padding: '8px 12px',
                  background: '#ffffff',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}>
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '12px 16px',
                background: '#fef2f2',
                color: '#dc2626',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid #fecaca',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MdWarning size={18} /> {error}
              </div>
            )}

            {/* Orders List */}
            <div style={{ display: 'grid', gap: '12px' }}>
              {loading && orders.length === 0 ? (
                <div style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#6b7280' }}>
                    Loading orders...
                  </div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                    <MdAssignment size={48} style={{ color: '#9ca3af' }} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px', color: '#1f2937' }}>
                    {orderSearch || orderStatusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                    {orderSearch || orderStatusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'Orders will appear here when customers place them'}
                  </div>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  const shippingCost = order.shipping?.cost || 0;
                  const grandTotal = total + shippingCost;
                  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  
                  const getStatusColor = (status: string) => {
                    const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                      'pending': { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
                      'approved': { bg: '#dbeafe', text: '#2563eb', border: '#bfdbfe' },
                      'refused': { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
                      'awaiting_processing': { bg: '#e0e7ff', text: '#6366f1', border: '#c7d2fe' },
                      'order_confirmation': { bg: '#ddd6fe', text: '#7c3aed', border: '#c4b5fd' },
                      'shipped': { bg: '#cffafe', text: '#0891b2', border: '#a5f3fc' },
                      'delivered': { bg: '#d1fae5', text: '#059669', border: '#a7f3d0' },
                      'cancelled': { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' }
                    };
                    return statusColors[status] || { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
                  };
                  
                  const statusStyle = getStatusColor(order.status);
                  
                  return (
                    <div
                      key={order.id}
                      className="order-card"
                      style={{
                        padding: '20px',
                        background: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        gap: '20px',
                        alignItems: 'center'
                      }}
                      onClick={() => setSelectedOrder(order)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Order Number & Status */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                        <div style={{ 
                          fontWeight: 600, 
                          fontSize: '16px', 
                          color: '#1f2937',
                          marginBottom: '4px'
                        }}>
                          Order #{order.orderNumber}
                        </div>
                        <div style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'inline-block',
                          width: 'fit-content',
                          background: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                          textTransform: 'capitalize'
                        }}>
                          {order.status.replace('_', ' ')}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                        <div style={{ 
                          display: 'flex', 
                          gap: '16px', 
                          flexWrap: 'wrap',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MdEmail size={14} style={{ color: '#9ca3af' }} />
                            <span style={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px'
                            }}>
                              {order.email}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MdCalendarToday size={14} style={{ color: '#9ca3af' }} />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <GiCardboardBox size={14} style={{ color: '#9ca3af' }} />
                            <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                          </div>
                        </div>
                        {order.address && (
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#9ca3af',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            <MdLocationOn size={14} style={{ display: 'inline-block', marginRight: '4px', color: '#9ca3af' }} />
                            {order.address.cityArea}, {order.address.regionState}
                          </div>
                        )}
                      </div>

                      {/* Total Amount */}
                      <div style={{ textAlign: 'right', minWidth: '120px' }}>
                        <div style={{ 
                          fontWeight: 700, 
                          fontSize: '18px', 
                          color: '#1f2937',
                          marginBottom: '4px'
                        }}>
                          Tk {grandTotal.toFixed(2)}
                        </div>
                        {shippingCost > 0 && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#9ca3af'
                          }}>
                            + Tk {shippingCost.toFixed(2)} shipping
                          </div>
                        )}
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginTop: '4px'
                        }}>
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      <style>{`
        @media (max-width: 767px) {
          .dashboard-page {
            padding: 0 !important;
          }
          .dashboard-container {
            box-shadow: none !important;
            min-height: calc(100vh - 80px) !important;
          }
          .dashboard-tabs {
            padding: 8px 1rem 0 1rem !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            gap: 2px !important;
            min-height: 52px !important;
          }
          .dashboard-tabs::-webkit-scrollbar {
            display: none !important;
          }
          .dashboard-tab {
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            padding: 10px 16px !important;
            font-size: 13px !important;
            min-height: 44px !important;
            gap: 6px !important;
          }
          .dashboard-tab span:first-child {
            font-size: 14px !important;
          }
          .dashboard-content {
            padding: 1rem !important;
          }
          .dashboard-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            margin-bottom: 1rem !important;
            gap: 12px !important;
          }
          .dashboard-header h2 {
            font-size: 18px !important;
            margin-bottom: 4px !important;
          }
          .dashboard-header p {
            font-size: 13px !important;
          }
          .dashboard-actions {
            width: 100% !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .dashboard-actions button {
            width: 100% !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
            font-size: 14px !important;
            justify-content: center !important;
          }
          /* Breadcrumb Navigation */
          nav {
            flex-wrap: wrap !important;
            gap: 6px !important;
            font-size: 13px !important;
          }
          nav button {
            padding: 8px 12px !important;
            font-size: 13px !important;
            min-height: 44px !important;
          }
          nav span {
            font-size: 13px !important;
          }
          /* Section Headers */
          h2 {
            font-size: 20px !important;
            margin-bottom: 0.75rem !important;
          }
          /* Order Management Header */
          .order-management-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            margin-bottom: 16px !important;
            gap: 12px !important;
          }
          .order-management-header h2 {
            font-size: 18px !important;
            margin-bottom: 8px !important;
          }
          .order-management-header p {
            font-size: 13px !important;
          }
          /* Order Filters */
          .order-filters {
            width: 100% !important;
            flex-direction: column !important;
            gap: 12px !important;
          }
          .order-filters > div:first-child {
            width: 100% !important;
            min-width: 100% !important;
          }
          .order-search-input,
          .order-filter-select {
            width: 100% !important;
            min-height: 44px !important;
            font-size: 16px !important;
            padding: 12px 16px 12px 40px !important;
          }
          .order-search-input + span {
            left: 12px !important;
          }
          .order-filters > div:last-child {
            width: 100% !important;
            text-align: center !important;
          }
          .order-filters button {
            width: 100% !important;
            min-height: 44px !important;
            justify-content: center !important;
            font-size: 14px !important;
          }
          /* Order Cards Mobile */
          .order-card {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 16px !important;
          }
          .order-card > div:first-child {
            min-width: 100% !important;
          }
          .order-card > div:last-child {
            min-width: 100% !important;
            text-align: left !important;
            margin-top: 8px !important;
            padding-top: 12px !important;
            border-top: 1px solid #e5e7eb !important;
          }
          .order-card .order-info-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            font-size: 13px !important;
          }
          /* General Inputs and Selects */
          .dashboard-page input[type="text"],
          .dashboard-page input[type="number"],
          .dashboard-page select,
          .dashboard-page textarea {
            font-size: 16px !important;
            padding: 12px 16px !important;
            min-height: 44px !important;
            width: 100% !important;
          }
          /* Error Messages */
          .dashboard-page [role="alert"] {
            padding: 12px 16px !important;
            font-size: 14px !important;
          }
          /* Breadcrumb Sections */
          .dashboard-content > div:first-child {
            margin-bottom: 1rem !important;
          }
          .dashboard-content nav {
            margin-bottom: 0.75rem !important;
          }
          .dashboard-content h2 {
            font-size: 20px !important;
            margin-bottom: 0.5rem !important;
          }
          .dashboard-content p {
            font-size: 13px !important;
          }
          /* Empty States */
          .dashboard-content > div[style*="textAlign: center"] {
            padding: 2rem 1rem !important;
          }
          .dashboard-content > div[style*="textAlign: center"] > div {
            font-size: 36px !important;
            margin-bottom: 12px !important;
          }
          /* Order Count Badge */
          .order-count-badge {
            font-size: 12px !important;
            padding: 6px 10px !important;
          }
          /* Status Badges in Order Cards */
          .order-card .status-badge {
            font-size: 11px !important;
            padding: 4px 10px !important;
          }
        }
      `}</style>
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
    <div className="pastel-card order-management-detail" style={{ padding: 32 }}>
      <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="order-title-section">
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Order #{order.orderNumber}</h2>
          <div style={{ color: 'var(--navy)', fontSize: 14 }}>
            Placed on {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="order-status-badge" style={{
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

      <div className="customer-info-section" style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16 }}>Customer Information</h3>
        <div className="customer-info-card" style={{ padding: 16, background: 'var(--cream)', borderRadius: 8 }}>
          <p><strong>Email:</strong> {order.email}</p>
          <p><strong>Name:</strong> {order.address.firstName} {order.address.lastName}</p>
          <p><strong>Phone:</strong> {order.address.mobileNumber}</p>
        </div>
      </div>

      <div className="order-items-section" style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16 }}>Order Items</h3>
        <div className="order-items-list" style={{ display: 'grid', gap: 16 }}>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="order-item"
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
                className="order-item-image"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 8
                }}
              />
              <div className="order-item-details" style={{ flex: 1 }}>
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

      <div className="order-info-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        <div className="shipping-address-section">
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

        <div className="order-summary-section">
          <h3 style={{ marginBottom: 12 }}>Order Summary</h3>
          <div className="summary-rows" style={{ display: 'grid', gap: 8 }}>
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>Tk {total.toFixed(2)}</span>
            </div>
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <span>Tk {shippingCost.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row" style={{
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

      <div className="order-actions-section" style={{
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
              <MdCheckCircle size={18} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
              Order Delivered - No further actions available
            </p>
          </div>
        ) : (
          <>
            {order.status === 'pending' && (
              <div className="approve-refuse-buttons" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={() => onApprove(order.id)}
                  className="btn-primary approve-btn"
                  disabled={isUpdating}
                  style={{ opacity: isUpdating ? 0.6 : 1, cursor: isUpdating ? 'not-allowed' : 'pointer' }}
                >
                  {isUpdating ? 'Processing...' : 'Approve Order'}
                </button>
                <button
                  onClick={() => onRefuse(order.id)}
                  className="btn-3d refuse-btn"
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

            <div className="form-field" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating || isDelivered}
                className="status-select"
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

            <div className="form-field" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Admin Status (Optional)
              </label>
              <input
                type="text"
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value)}
                placeholder="e.g., Order confirmation, Awaiting processing"
                disabled={isDelivered}
                className="admin-status-input"
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
              <div className="form-field" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Shipper Name
                </label>
                <input
                  type="text"
                  value={shipperName}
                  onChange={(e) => setShipperName(e.target.value)}
                  placeholder="e.g., Sundarban"
                  disabled={isDelivered}
                  className="shipper-name-input"
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
              className="btn-primary update-status-btn"
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
              className="btn-3d cancel-order-admin-btn"
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
      <style>{`
        @media (max-width: 767px) {
          .order-management-detail {
            padding: 20px !important;
          }
          .order-management-detail .order-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .order-management-detail .order-title-section h2 {
            font-size: 1.5rem !important;
          }
          .order-management-detail .order-status-badge {
            width: 100% !important;
            text-align: center !important;
            padding: 12px 16px !important;
            font-size: 14px !important;
          }
          .order-management-detail .customer-info-section h3,
          .order-management-detail .order-items-section h3 {
            font-size: 1.25rem !important;
          }
          .order-management-detail .customer-info-card {
            padding: 12px !important;
          }
          .order-management-detail .order-item {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px !important;
          }
          .order-management-detail .order-item-image {
            width: 100% !important;
            height: 200px !important;
            align-self: center !important;
          }
          .order-management-detail .order-item-details {
            text-align: center !important;
          }
          .order-management-detail .order-info-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .order-management-detail .order-title-section h2 {
            font-size: 1.25rem !important;
          }
          .order-management-detail .order-title-section > div {
            font-size: 12px !important;
          }
          .order-management-detail .customer-info-card p {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
          .order-management-detail .order-item-details > div:first-child {
            font-size: 16px !important;
          }
          .order-management-detail .order-item-details > div:nth-child(2) {
            font-size: 13px !important;
          }
          .order-management-detail .order-item-details > div:last-child {
            font-size: 16px !important;
          }
          .order-management-detail .summary-rows {
            gap: 12px !important;
          }
          .order-management-detail .summary-row {
            font-size: 14px !important;
            padding: 8px 0 !important;
          }
          .order-management-detail .total-row {
            font-size: 16px !important;
            padding-top: 12px !important;
          }
          .order-management-detail .order-actions-section {
            margin-top: 24px !important;
            padding: 16px !important;
          }
          .order-management-detail .order-actions-section h3 {
            font-size: 1.125rem !important;
            margin-bottom: 12px !important;
          }
          .order-management-detail .approve-refuse-buttons {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .order-management-detail .approve-btn,
          .order-management-detail .refuse-btn {
            width: 100% !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
          }
          .order-management-detail .status-select,
          .order-management-detail .admin-status-input,
          .order-management-detail .shipper-name-input {
            font-size: 16px !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
          }
          .order-management-detail .update-status-btn,
          .order-management-detail .cancel-order-admin-btn {
            width: 100% !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
          }
          .order-management-detail .form-field {
            margin-bottom: 16px !important;
          }
          .order-management-detail .form-field label {
            font-size: 14px !important;
            margin-bottom: 6px !important;
          }
          .order-management-detail .shipping-address-section h3,
          .order-management-detail .order-summary-section h3 {
            font-size: 1.125rem !important;
            margin-bottom: 12px !important;
          }
          .order-management-detail .shipping-address-section > div:first-child {
            font-size: 14px !important;
            line-height: 1.6 !important;
          }
          .order-management-detail .order-summary-section > div:last-child {
            font-size: 13px !important;
            padding: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}


