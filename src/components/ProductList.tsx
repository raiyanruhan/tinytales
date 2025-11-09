import { useState } from 'react';
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

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'var(--white)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        marginBottom: '0.5rem'
      }}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          padding: '0.5rem',
          color: 'var(--navy)',
          fontSize: '1.2rem',
          userSelect: 'none'
        }}
      >
        ⋮⋮
      </div>

      {/* Thumbnail */}
      <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={getMainImage().startsWith('http') ? getMainImage() : `http://localhost:3001${getMainImage()}`}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      {/* Product Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.1rem', color: 'var(--navy)' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--navy)', opacity: 0.8, alignItems: 'center' }}>
          <span>{product.category}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <TakaIcon size="xs" style={{ fontSize: '0.8rem' }} />
            {product.price.toFixed(2)}
          </span>
          <span>Stock: {getTotalStock()}</span>
        </div>
      </div>

      {/* Order Input */}
      <form onSubmit={handleOrderSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>Order:</label>
        <input
          type="number"
          value={orderValue}
          onChange={(e) => setOrderValue(e.target.value)}
          onBlur={handleOrderSubmit}
          style={{
            width: '60px',
            padding: '0.25rem 0.5rem',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem'
          }}
        />
      </form>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => onEdit(product)}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--mint)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--coral)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            opacity: isDeleting ? 0.6 : 1
          }}
        >
          {isDeleting ? '...' : 'Delete'}
        </button>
      </div>
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
    <div>
      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.75rem',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)'
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <option value="all">All Categories</option>
          <option value="Newborn">Newborn</option>
          <option value="Onesies">Onesies</option>
          <option value="Sets">Sets</option>
          <option value="Sleepwear">Sleepwear</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'var(--white)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--navy)',
          opacity: 0.7
        }}>
          {searchTerm || filterCategory !== 'all' ? 'No products match your filters' : 'No products yet'}
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
            {filteredProducts.map(product => (
              <SortableProductItem
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
                onOrderChange={onOrderChange}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}


