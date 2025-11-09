import { useState, useEffect } from 'react';
import { Category, categories } from '@data/products';
import ImageUpload from './ImageUpload';
import { Product } from '@services/productApi';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState<Category>((product?.category as Category) || 'Newborn');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [sizes, setSizes] = useState<string[]>(product?.sizes || []);
  const [sizeInput, setSizeInput] = useState('');
  const [colors, setColors] = useState<Array<{ name: string; images: string[] }>>(() => {
    if (product?.colors) {
      // Handle both old format (string[]) and new format (ProductColor[])
      if (Array.isArray(product.colors) && product.colors.length > 0) {
        if (typeof product.colors[0] === 'string') {
          return (product.colors as unknown as string[]).map(c => ({ name: c, images: [] }));
        }
        return product.colors as Array<{ name: string; images: string[] }>;
      }
    }
    return [{ name: '', images: [] }];
  });
  const [stock, setStock] = useState<Record<string, number>>(product?.stock || {});
  const [order, setOrder] = useState(product?.order?.toString() || '');
  const [badges, setBadges] = useState<string[]>(product?.badges || []);
  const [image, setImage] = useState(product?.image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableBadges = ['New', 'Popular', 'Sale', 'Limited'];

  const handleAddSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()]);
      setSizeInput('');
    }
  };

  const handleRemoveSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
    // Remove stock entries for this size
    const newStock = { ...stock };
    Object.keys(newStock).forEach(key => {
      if (key.startsWith(`${size}-`)) {
        delete newStock[key];
      }
    });
    setStock(newStock);
  };

  const handleAddColor = () => {
    setColors([...colors, { name: '', images: [] }]);
  };

  const handleRemoveColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
    // Remove stock entries for this color
    const removedColor = colors[index];
    if (removedColor) {
      const newStock = { ...stock };
      Object.keys(newStock).forEach(key => {
        if (key.endsWith(`-${removedColor.name}`)) {
          delete newStock[key];
        }
      });
      setStock(newStock);
    }
  };

  const handleColorChange = (index: number, field: 'name' | 'images', value: string | string[]) => {
    const newColors = [...colors];
    if (field === 'name') {
      const oldName = newColors[index].name;
      newColors[index].name = value as string;
      // Update stock keys if color name changed
      if (oldName) {
        const newStock = { ...stock };
        Object.keys(newStock).forEach(key => {
          if (key.endsWith(`-${oldName}`)) {
            const size = key.split('-')[0];
            delete newStock[key];
            newStock[`${size}-${value}`] = stock[key];
          }
        });
        setStock(newStock);
      }
    } else {
      newColors[index].images = value as string[];
      // Set main image if first color's first image
      if (index === 0 && (value as string[]).length > 0) {
        setImage((value as string[])[0]);
      }
    }
    setColors(newColors);
  };

  const handleStockChange = (size: string, color: string, value: number) => {
    const key = `${size}-${color}`;
    setStock({ ...stock, [key]: Math.max(0, value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!name.trim()) {
        throw new Error('Product name is required');
      }
      if (!price || parseFloat(price) <= 0) {
        throw new Error('Valid price is required');
      }
      if (!description.trim()) {
        throw new Error('Description is required');
      }
      if (sizes.length === 0) {
        throw new Error('At least one size is required');
      }
      if (colors.length === 0 || colors.some(c => !c.name.trim())) {
        throw new Error('At least one color with a name is required');
      }

      const productData: Partial<Product> = {
        name: name.trim(),
        price: parseFloat(price),
        category,
        description: description.trim(),
        sizes,
        colors: colors.map(c => ({ name: c.name.trim(), images: c.images })),
        stock,
        image: image || colors[0]?.images?.[0] || '',
        badges: badges.filter(Boolean),
        ...(order && { order: parseInt(order) || undefined })
      };

      await onSubmit(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
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

      {/* Basic Info */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--navy)' }}>Basic Information</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.key}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Price *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Order/Serial Number</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="Lower numbers appear first"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)'
            }}
          />
        </div>
      </div>

      {/* Sizes */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>Sizes *</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
            placeholder="e.g., 0-3m, 3-6m"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)'
            }}
          />
          <button type="button" onClick={handleAddSize} className="btn-primary">Add Size</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {sizes.map(size => (
            <div
              key={size}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'var(--cream)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span>{size}</span>
              <button
                type="button"
                onClick={() => handleRemoveSize(size)}
                style={{
                  background: 'var(--coral)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Colors with Images */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>Colors & Images *</h2>
        {colors.map((color, colorIndex) => (
          <div
            key={colorIndex}
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--white)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ flex: 1, marginRight: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Color Name *</label>
                <input
                  type="text"
                  value={color.name}
                  onChange={(e) => handleColorChange(colorIndex, 'name', e.target.value)}
                  placeholder="e.g., Red, Blue, Cream"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>
              {colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveColor(colorIndex)}
                  style={{
                    alignSelf: 'flex-end',
                    padding: '0.5rem 1rem',
                    background: 'var(--coral)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  Remove Color
                </button>
              )}
            </div>
            <ImageUpload
              images={color.images}
              onChange={(images) => handleColorChange(colorIndex, 'images', images)}
              label={`Images for ${color.name || 'Color ' + (colorIndex + 1)}`}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddColor}
          className="btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Add Another Color
        </button>
      </div>

      {/* Stock Management */}
      {sizes.length > 0 && colors.some(c => c.name.trim()) && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>Stock Management</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid var(--border-light)' }}>Size</th>
                  {colors.filter(c => c.name.trim()).map(color => (
                    <th key={color.name} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid var(--border-light)' }}>
                      {color.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizes.map(size => (
                  <tr key={size}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>
                      {size}
                    </td>
                    {colors.filter(c => c.name.trim()).map(color => {
                      const key = `${size}-${color.name}`;
                      return (
                        <td key={key} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--border-light)' }}>
                          <input
                            type="number"
                            min="0"
                            value={stock[key] || 0}
                            onChange={(e) => handleStockChange(size, color.name, parseInt(e.target.value) || 0)}
                            style={{
                              width: '80px',
                              padding: '0.5rem',
                              border: '1px solid var(--border-light)',
                              borderRadius: 'var(--radius-sm)',
                              textAlign: 'center'
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Badges */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>Badges</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {availableBadges.map(badge => (
            <label
              key={badge}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: badges.includes(badge) ? 'var(--mint)' : 'var(--cream)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={badges.includes(badge)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setBadges([...badges, badge]);
                  } else {
                    setBadges(badges.filter(b => b !== badge));
                  }
                }}
              />
              <span>{badge}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Image */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Main Image URL</label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Main product image (or first color's first image will be used)"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)'
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--cream)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{
            padding: '0.75rem 2rem',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}


