import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createProduct, updateProduct, deleteProduct, reorderProducts, Product } from '@services/productApi';
import ProductList from '@components/ProductList';
import ProductForm from '@components/ProductForm';

type ViewMode = 'list' | 'add' | 'edit';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
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

  const handleAdd = () => {
    setEditingProduct(undefined);
    setViewMode('add');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
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
      setViewMode('list');
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

  if (loading && products.length === 0) {
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
        {viewMode === 'list' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ margin: 0, color: 'var(--navy)' }}>Product Management</h1>
              <button
                onClick={handleAdd}
                className="btn-primary"
                style={{ padding: '0.75rem 2rem' }}
              >
                Add New Product
              </button>
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
        )}
      </div>
    </div>
  );
}


