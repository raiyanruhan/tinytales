import { useState } from 'react';
import { getImageUrl } from '@utils/imageUrl';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product } from '@services/productApi';
import { TakaIcon } from './Icons';
import { useModal } from '@context/ModalContext';

interface ProductListProps {
  products: Product[];
  onReorder: (products: Array<{ id: string; order: number }>) => Promise<void>;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => Promise<void>;
  onOrderChange: (id: string, order: number) => Promise<void>;
}

function SortableProductItem({
  product,
  onEdit,
  onDelete,
  onOrderChange
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => Promise<void>;
  onOrderChange: (id: string, order: number) => Promise<void>;
}) {
  const [orderValue, setOrderValue] = useState(product.order?.toString() || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const { showConfirm } = useModal();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderNum = parseInt(orderValue) || undefined;
    await onOrderChange(product.id, orderNum || 0);
  };

  const handleDelete = async () => {
    showConfirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await onDelete(product.id);
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const getTotalStock = () => {
    if (!product.stock) return 0;
    return Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
  };

  const getMainImage = () => {
    if (product.image) return product.image;
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      const firstColor = product.colors[0];
      if (typeof firstColor === 'object' && 'images' in firstColor && firstColor.images.length > 0) {
        return firstColor.images[0];
      }
    }
    return '';
  };

  const totalStock = getTotalStock();
  const isLowStock = totalStock < 10;
  const isOutOfStock = totalStock === 0;

  return (
    <div
      ref={setNodeRef}
      className="product-list-item"
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: '40px 100px 2fr 120px 100px 140px 140px',
        alignItems: 'center',
        gap: '1rem',
        padding: '16px',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '8px',
        transition: 'all 0.15s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#d1d5db';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="drag-handle"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          padding: '8px',
          color: '#9ca3af',
          fontSize: '18px',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#6b7280';
          e.currentTarget.style.background = '#f9fafb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#9ca3af';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        ⋮⋮
      </div>

      {/* Thumbnail */}
      <div className="product-thumbnail" style={{ 
        width: '80px', 
        height: '80px', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        flexShrink: 0,
        background: '#f3f4f6',
        border: '1px solid #e5e7eb'
      }}>
        <img
          src={getImageUrl(getMainImage())}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="product-info" style={{ minWidth: 0 }}>
        <h3 style={{ 
          margin: 0, 
          marginBottom: '6px', 
          fontSize: '15px', 
          color: '#1f2937',
          fontWeight: 600,
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {product.name}
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          fontSize: '13px', 
          color: '#6b7280',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{
            padding: '2px 8px',
            background: '#f3f4f6',
            borderRadius: '4px',
            fontWeight: 500,
            fontSize: '12px'
          }}>
            {product.category}
          </span>
          {product.description && (
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '200px'
            }}>
              {product.description.substring(0, 40)}...
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ 
          fontSize: '15px', 
          color: '#1f2937',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '4px'
        }}>
          <TakaIcon size="xs" style={{ fontSize: '12px', color: '#6b7280' }} />
          {product.price.toFixed(2)}
        </div>
      </div>

      {/* Stock Status */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 600,
          display: 'inline-block',
          background: isOutOfStock ? '#fef2f2' : isLowStock ? '#fef3c7' : '#f0fdf4',
          color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#16a34a',
          border: `1px solid ${isOutOfStock ? '#fecaca' : isLowStock ? '#fde68a' : '#bbf7d0'}`
        }}>
          {isOutOfStock ? 'Out' : totalStock}
        </div>
      </div>

      {/* Order Input */}
      <form className="order-input-form" onSubmit={handleOrderSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input
          type="number"
          value={orderValue}
          onChange={(e) => setOrderValue(e.target.value)}
          placeholder="Order"
          style={{
            width: '70px',
            padding: '6px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            background: '#ffffff',
            transition: 'all 0.15s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2563eb';
            e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
            e.target.style.boxShadow = 'none';
            handleOrderSubmit(e as unknown as React.FormEvent);
          }}
        />
      </form>

      {/* Actions */}
      <div className="product-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onEdit(product)}
          style={{
            padding: '6px 14px',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1d4ed8';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            padding: '6px 14px',
            background: isDeleting ? '#9ca3af' : '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            opacity: isDeleting ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.background = '#b91c1c';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {isDeleting ? '...' : 'Delete'}
        </button>
      </div>
      <style>{`
        @media (max-width: 1200px) {
          .product-list-item {
            grid-template-columns: 40px 80px 2fr 100px 80px 120px 120px !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 968px) {
          .product-list-header {
            display: none !important;
          }
          .product-list-item {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 16px !important;
            margin-bottom: 12px !important;
            border-radius: 8px !important;
          }
          .drag-handle {
            position: absolute !important;
            top: 12px !important;
            right: 12px !important;
            padding: 8px !important;
          }
          .product-thumbnail {
            width: 100% !important;
            height: 200px !important;
            margin: 0 auto;
          }
          .product-info {
            width: 100% !important;
          }
          .order-input-form {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .order-input-form input {
            flex: 1;
            max-width: 120px;
            min-height: 44px !important;
            font-size: 16px !important;
          }
          .product-actions {
            width: 100% !important;
            justify-content: stretch !important;
            gap: 8px !important;
          }
          .product-actions button {
            flex: 1 !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ProductList({ products, onReorder, onEdit, onDelete, onOrderChange }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredProducts.findIndex(p => p.id === active.id);
      const newIndex = filteredProducts.findIndex(p => p.id === over.id);

      const reordered = arrayMove(filteredProducts, oldIndex, newIndex);
      const productsWithOrder = reordered.map((p, index) => ({
        id: p.id,
        order: index + 1
      }));

      await onReorder(productsWithOrder);
    }
  };

  return (
    <div className="product-list-container">
      {/* Enhanced Search and Filter Bar */}
      <div className="product-list-filters" style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '1.5rem', 
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="product-search-input"
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
              e.target.style.borderColor = '#2563eb';
              e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            fontSize: '16px'
          }}>🔍</span>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="product-filter-select"
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
            e.target.style.borderColor = '#2563eb';
            e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="all">All Categories</option>
          <option value="Newborn">Newborn</option>
          <option value="Onesies">Onesies</option>
          <option value="Sets">Sets</option>
          <option value="Sleepwear">Sleepwear</option>
          <option value="Accessories">Accessories</option>
        </select>
        <div style={{
          padding: '8px 12px',
          background: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          fontSize: '13px',
          color: '#6b7280',
          fontWeight: 500
        }}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </div>
      </div>

      {/* Table Header */}
      <div className="product-list-header" style={{
        display: 'grid',
        gridTemplateColumns: '40px 100px 2fr 120px 100px 140px 140px',
        gap: '1rem',
        padding: '12px 16px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px 8px 0 0',
        fontSize: '12px',
        fontWeight: 600,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        <div></div>
        <div>Image</div>
        <div>Product</div>
        <div style={{ textAlign: 'right' }}>Price</div>
        <div style={{ textAlign: 'center' }}>Stock</div>
        <div>Order</div>
        <div style={{ textAlign: 'right' }}>Actions</div>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .product-list-filters {
            flex-direction: column !important;
            gap: 12px !important;
            margin-bottom: 1rem !important;
          }
          .product-search-input,
          .product-filter-select {
            width: 100% !important;
            min-width: 100% !important;
            min-height: 44px !important;
            font-size: 16px !important;
            padding: 12px 16px !important;
          }
        }
      `}</style>

      {/* Product List */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderTop: 'none',
        borderRadius: '0 0 8px 8px',
        background: '#ffffff',
        overflow: 'hidden'
      }}>
        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px', color: '#1f2937' }}>
              {searchTerm || filterCategory !== 'all' ? 'No products found' : 'No products yet'}
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by adding your first product'}
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredProducts.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredProducts.map((product, index) => (
                <div key={product.id}>
                  <SortableProductItem
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onOrderChange={onOrderChange}
                  />
                  {index < filteredProducts.length - 1 && (
                    <div style={{
                      height: '1px',
                      background: '#e5e7eb',
                      margin: '0 16px'
                    }} />
                  )}
                </div>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}


