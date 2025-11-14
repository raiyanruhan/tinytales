import { useState, useEffect } from 'react';
import { Category, categories } from '@data/products';
import ImageUpload from './ImageUpload';
import ImagePositionEditor from './ImagePositionEditor';
import { Product, ImagePosition } from '@services/productApi';

interface ProductFormProps {
  product?: Product;
  products?: Product[]; // All products to calculate next order number
  onSubmit: (data: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, products = [], onSubmit, onCancel }: ProductFormProps) {
  // Calculate next order number for new products
  const getNextOrderNumber = (): number => {
    if (products.length === 0) return 1;
    const maxOrder = Math.max(...products.map(p => p.order || 0));
    return maxOrder + 1;
  };

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
  // Auto-assign order for new products, use existing for edits
  const initialOrder = product ? (product.order ?? getNextOrderNumber()) : getNextOrderNumber();
  const [order, setOrder] = useState(initialOrder.toString());
  const [badges, setBadges] = useState<string[]>(product?.badges || []);
  const [image, setImage] = useState(product?.image || '');
  const [imagePosition, setImagePosition] = useState<ImagePosition>(
    product?.imagePosition || { x: 50, y: 50 }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const availableBadges = ['New', 'Popular', 'Sale', 'Limited'];

  // Validation functions
  const validateName = (value: string): string => {
    if (!value.trim()) return 'Product name is required';
    if (value.length > 60) return 'Product name must be 60 characters or less';
    return '';
  };

  const validatePrice = (value: string): string => {
    if (!value) return 'Price is required';
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return 'Price must be greater than 0';
    if (numValue > 10000) return 'Price seems unusually high. Please verify.';
    return '';
  };

  const validateDescription = (value: string): string => {
    if (!value.trim()) return 'Description is required';
    if (value.trim().length < 10) return 'Description should be at least 10 characters';
    return '';
  };

  const validateSizes = (sizesList: string[]): string => {
    if (sizesList.length === 0) return 'At least one size is required';
    return '';
  };

  const validateColors = (colorsList: Array<{ name: string; images: string[] }>): string => {
    if (colorsList.length === 0) return 'At least one color is required';
    const emptyColors = colorsList.filter(c => !c.name.trim());
    if (emptyColors.length > 0) return 'All colors must have a name';
    return '';
  };

  // Update order number for new products when products list changes
  useEffect(() => {
    if (!product) {
      // Only update for new products (not editing)
      const calculateNextOrder = (): number => {
        if (products.length === 0) return 1;
        const maxOrder = Math.max(...products.map(p => p.order || 0));
        return maxOrder + 1;
      };
      const nextOrder = calculateNextOrder();
      setOrder(nextOrder.toString());
    }
  }, [products, product]);

  // Real-time validation
  useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (touched.name || name) {
      errors.name = validateName(name);
    }
    if (touched.price || price) {
      errors.price = validatePrice(price);
    }
    if (touched.description || description) {
      errors.description = validateDescription(description);
    }
    if (touched.sizes || sizes.length > 0) {
      errors.sizes = validateSizes(sizes);
    }
    if (touched.colors || colors.length > 0) {
      errors.colors = validateColors(colors);
    }
    
    // Validate individual color names
    colors.forEach((color, index) => {
      if (touched[`color-${index}`] || color.name) {
        if (!color.name.trim()) {
          errors[`color-${index}`] = 'Color name is required';
        }
      }
    });

    setFieldErrors(errors);
  }, [name, price, description, sizes, colors, touched]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldState = (field: string): 'error' | 'success' | 'default' => {
    if (touched[field] || (field === 'name' && name) || (field === 'price' && price) || (field === 'description' && description)) {
      if (fieldErrors[field]) return 'error';
      if (field === 'name' && name && !fieldErrors.name) return 'success';
      if (field === 'price' && price && !fieldErrors.price) return 'success';
      if (field === 'description' && description && !fieldErrors.description) return 'success';
    }
    return 'default';
  };

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
    
    // Mark all fields as touched
    setTouched({
      name: true,
      price: true,
      description: true,
      sizes: true,
      colors: true,
      ...colors.reduce((acc, _, index) => ({ ...acc, [`color-${index}`]: true }), {})
    });

    // Check for validation errors
    const errors: Record<string, string> = {};
    errors.name = validateName(name);
    errors.price = validatePrice(price);
    errors.description = validateDescription(description);
    errors.sizes = validateSizes(sizes);
    errors.colors = validateColors(colors);
    
    colors.forEach((color, index) => {
      if (!color.name.trim()) {
        errors[`color-${index}`] = 'Color name is required';
      }
    });

    setFieldErrors(errors);

    // If there are errors, don't submit
    if (Object.values(errors).some(err => err)) {
      setError('Please fix the errors below before submitting');
      return;
    }

    setLoading(true);

    try {

      // Always include order - auto-assigned for new products, existing for edits
      const orderValue = order ? parseInt(order) : (product ? product.order : getNextOrderNumber());

      const productData: Partial<Product> = {
        name: name.trim(),
        price: parseFloat(price),
        category,
        description: description.trim(),
        sizes,
        colors: colors.map(c => ({ name: c.name.trim(), images: c.images })),
        stock,
        image: image || colors[0]?.images?.[0] || '',
        imagePosition,
        badges: badges.filter(Boolean),
        order: orderValue
      };

      await onSubmit(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      {error && (
        <div className="form-error" role="alert" style={{
          padding: '1rem 1.25rem',
          background: '#fef2f2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #fecaca',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9375rem',
          fontWeight: 500
        }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Basic Info */}
      <div className="form-section" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ marginBottom: '1.5rem', color: 'var(--navy)' }}>Basic Information</h2>
        
        <div className="form-field" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" htmlFor="product-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
            Product Name <span style={{ color: '#dc2626' }}>*</span>
            <span className="char-count" style={{ fontSize: '0.875rem', fontWeight: 400, color: '#64748b', marginLeft: '0.5rem' }}>
              ({name.length}/60)
            </span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => {
                if (e.target.value.length <= 60) {
                  setName(e.target.value)
                }
              }}
              maxLength={60}
              required
              aria-invalid={fieldErrors.name ? 'true' : 'false'}
              aria-describedby={fieldErrors.name ? 'name-error' : name.length >= 55 ? 'name-warning' : undefined}
              className={`form-input form-input-${getFieldState('name')}`}
              style={{
                width: '100%',
                padding: '0.75rem 2.75rem 0.75rem 0.875rem',
                border: `1px solid ${
                  getFieldState('name') === 'error' ? '#dc2626' : 
                  getFieldState('name') === 'success' ? '#10b981' : 
                  '#e2e8f0'
                }`,
                borderRadius: '8px',
                fontSize: '0.9375rem',
                transition: 'all 0.2s ease',
                outline: 'none',
                background: getFieldState('name') === 'success' ? '#f0fdf4' : '#ffffff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = getFieldState('name') === 'error' ? '#dc2626' : '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                handleBlur('name');
                e.target.style.boxShadow = 'none';
              }}
            />
            {getFieldState('name') === 'success' && (
              <span style={{
                position: 'absolute',
                right: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                fontSize: '1.125rem'
              }}>✓</span>
            )}
            {getFieldState('name') === 'error' && (
              <span style={{
                position: 'absolute',
                right: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#dc2626',
                fontSize: '1.125rem'
              }}>✕</span>
            )}
          </div>
          {fieldErrors.name && (
            <div id="name-error" role="alert" style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span>⚠</span> {fieldErrors.name}
            </div>
          )}
          {!fieldErrors.name && name.length >= 55 && name.length < 60 && (
            <div id="name-warning" style={{ fontSize: '0.875rem', color: '#f59e0b', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span>ℹ</span> Product name is getting long. Consider a shorter name for better display.
            </div>
          )}
        </div>

        <div className="form-field" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" htmlFor="product-description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
            Description <span style={{ color: '#dc2626' }}>*</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#64748b', marginLeft: '0.5rem' }}>
              (Min 10 characters)
            </span>
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              aria-invalid={fieldErrors.description ? 'true' : 'false'}
              aria-describedby={fieldErrors.description ? 'description-error' : undefined}
              className={`form-textarea form-textarea-${getFieldState('description')}`}
              style={{
                width: '100%',
                padding: '0.75rem 2.75rem 0.75rem 0.875rem',
                border: `1px solid ${
                  getFieldState('description') === 'error' ? '#dc2626' : 
                  getFieldState('description') === 'success' ? '#10b981' : 
                  '#e2e8f0'
                }`,
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px',
                background: getFieldState('description') === 'success' ? '#f0fdf4' : '#ffffff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = getFieldState('description') === 'error' ? '#dc2626' : '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                handleBlur('description');
                e.target.style.boxShadow = 'none';
              }}
            />
            {getFieldState('description') === 'success' && (
              <span style={{
                position: 'absolute',
                right: '0.875rem',
                top: '0.875rem',
                color: '#10b981',
                fontSize: '1.125rem'
              }}>✓</span>
            )}
            {getFieldState('description') === 'error' && (
              <span style={{
                position: 'absolute',
                right: '0.875rem',
                top: '0.875rem',
                color: '#dc2626',
                fontSize: '1.125rem'
              }}>✕</span>
            )}
          </div>
          {fieldErrors.description && (
            <div id="description-error" role="alert" style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span>⚠</span> {fieldErrors.description}
            </div>
          )}
        </div>

        <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-field">
            <label className="form-label" htmlFor="product-category" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
              Category <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              required
              className="form-select"
              style={{
                width: '100%',
                padding: '0.75rem 0.875rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                transition: 'all 0.2s ease',
                outline: 'none',
                background: '#ffffff',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.key}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="product-price" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
              Price <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '0.9375rem',
                fontWeight: 500
              }}>$</span>
              <input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                aria-invalid={fieldErrors.price ? 'true' : 'false'}
                aria-describedby={fieldErrors.price ? 'price-error' : undefined}
                className={`form-input form-input-${getFieldState('price')}`}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.75rem 0.75rem 2rem',
                  border: `1px solid ${
                    getFieldState('price') === 'error' ? '#dc2626' : 
                    getFieldState('price') === 'success' ? '#10b981' : 
                    '#e2e8f0'
                  }`,
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  background: getFieldState('price') === 'success' ? '#f0fdf4' : '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = getFieldState('price') === 'error' ? '#dc2626' : '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  handleBlur('price');
                  e.target.style.boxShadow = 'none';
                }}
              />
              {getFieldState('price') === 'success' && (
                <span style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#10b981',
                  fontSize: '1.125rem'
                }}>✓</span>
              )}
              {getFieldState('price') === 'error' && (
                <span style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#dc2626',
                  fontSize: '1.125rem'
                }}>✕</span>
              )}
            </div>
            {fieldErrors.price && (
              <div id="price-error" role="alert" style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span>⚠</span> {fieldErrors.price}
              </div>
            )}
          </div>
        </div>

        <div className="form-field" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" htmlFor="product-order" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
            Order/Serial Number
            <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#64748b', marginLeft: '0.5rem' }}>
              (Auto-assigned, change via drag & drop)
            </span>
          </label>
          <input
            id="product-order"
            type="number"
            value={order}
            readOnly
            disabled
            className="form-input"
            style={{
              width: '100%',
              padding: '0.75rem 0.875rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              background: '#f9fafb',
              color: '#64748b',
              cursor: 'not-allowed'
            }}
          />
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>ℹ</span> Order can only be changed by dragging products in the product list
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="form-section" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem', color: 'var(--navy)' }}>
          Sizes <span style={{ color: '#dc2626' }}>*</span>
        </h2>
        <div className="add-size-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
            placeholder="e.g., 0-3m, 3-6m"
            className="form-input"
            style={{
              flex: 1,
              padding: '0.75rem 0.875rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              handleBlur('sizes');
              e.target.style.boxShadow = 'none';
            }}
          />
          <button 
            type="button" 
            onClick={handleAddSize} 
            className="btn-primary add-size-btn"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9375rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Add Size
          </button>
        </div>
        {fieldErrors.sizes && (
          <div role="alert" style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>⚠</span> {fieldErrors.sizes}
          </div>
        )}
        <div className="sizes-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {sizes.map(size => (
            <div
              key={size}
              className="size-tag"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dbeafe';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontWeight: 500, color: '#1e40af' }}>{size}</span>
              <button
                type="button"
                onClick={() => handleRemoveSize(size)}
                className="remove-size-btn"
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  lineHeight: 1,
                  transition: 'all 0.2s ease',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Colors with Images */}
      <div className="form-section" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: '0.5rem', color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}>
            Colors & Images <span style={{ color: '#dc2626' }}>*</span>
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
            Add color variants and their images. Each color can have multiple images.
          </p>
        </div>
        {fieldErrors.colors && (
          <div role="alert" style={{ 
            fontSize: '0.875rem', 
            color: '#dc2626', 
            marginBottom: '1.5rem', 
            padding: '0.75rem 1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem' 
          }}>
            <span style={{ fontSize: '1rem' }}>⚠</span> {fieldErrors.colors}
          </div>
        )}
        {colors.map((color, colorIndex) => (
          <div
            key={colorIndex}
            className="color-card"
            style={{
              marginBottom: '1.5rem',
              padding: '1.5rem',
              border: `2px solid ${fieldErrors[`color-${colorIndex}`] ? '#dc2626' : '#e2e8f0'}`,
              borderRadius: '12px',
              background: '#ffffff',
              transition: 'all 0.2s ease',
              boxShadow: fieldErrors[`color-${colorIndex}`] ? '0 0 0 3px rgba(220, 38, 38, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              if (!fieldErrors[`color-${colorIndex}`]) {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
              }
            }}
            onMouseLeave={(e) => {
              if (!fieldErrors[`color-${colorIndex}`]) {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }
            }}
          >
            {/* Color Card Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '1.25rem', 
              gap: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: color.name ? '#f1f5f9' : '#fef2f2',
                    border: `2px solid ${fieldErrors[`color-${colorIndex}`] ? '#dc2626' : '#e2e8f0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: fieldErrors[`color-${colorIndex}`] ? '#dc2626' : '#64748b',
                    flexShrink: 0
                  }}>
                    {colorIndex + 1}
                  </div>
                  <label htmlFor={`color-name-${colorIndex}`} style={{ 
                    display: 'block', 
                    fontWeight: 600, 
                    color: '#1e293b',
                    fontSize: '0.9375rem'
                  }}>
                    Color Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id={`color-name-${colorIndex}`}
                    type="text"
                    value={color.name}
                    onChange={(e) => handleColorChange(colorIndex, 'name', e.target.value)}
                    placeholder="e.g., Red, Blue, Cream, Navy"
                    required
                    aria-invalid={fieldErrors[`color-${colorIndex}`] ? 'true' : 'false'}
                    aria-describedby={fieldErrors[`color-${colorIndex}`] ? `color-${colorIndex}-error` : undefined}
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.75rem 0.75rem 0.875rem',
                      border: `1px solid ${
                        fieldErrors[`color-${colorIndex}`] ? '#dc2626' : 
                        (touched[`color-${colorIndex}`] || color.name) && color.name && !fieldErrors[`color-${colorIndex}`] ? '#10b981' : 
                        '#e2e8f0'
                      }`,
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      background: (touched[`color-${colorIndex}`] || color.name) && color.name && !fieldErrors[`color-${colorIndex}`] ? '#f0fdf4' : '#ffffff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = fieldErrors[`color-${colorIndex}`] ? '#dc2626' : '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      handleBlur(`color-${colorIndex}`);
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {(touched[`color-${colorIndex}`] || color.name) && color.name && !fieldErrors[`color-${colorIndex}`] && (
                    <span style={{
                      position: 'absolute',
                      right: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#10b981',
                      fontSize: '1.125rem'
                    }}>✓</span>
                  )}
                  {fieldErrors[`color-${colorIndex}`] && (
                    <span style={{
                      position: 'absolute',
                      right: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#dc2626',
                      fontSize: '1.125rem'
                    }}>✕</span>
                  )}
                </div>
                {fieldErrors[`color-${colorIndex}`] && (
                  <div id={`color-${colorIndex}-error`} role="alert" style={{ 
                    fontSize: '0.875rem', 
                    color: '#dc2626', 
                    marginTop: '0.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.375rem' 
                  }}>
                    <span>⚠</span> {fieldErrors[`color-${colorIndex}`]}
                  </div>
                )}
              </div>
              {colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveColor(colorIndex)}
                  className="remove-color-btn"
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: '#ffffff',
                    color: '#ef4444',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    minHeight: '44px',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.borderColor = '#f87171';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#fecaca';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                >
                  <span>🗑️</span>
                  <span>Remove</span>
                </button>
              )}
            </div>
            
            {/* Image Upload Section */}
            <div style={{ 
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 500, 
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>📷</span>
                  <span>Images for {color.name || `Color ${colorIndex + 1}`}</span>
                  {color.images.length > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      padding: '2px 8px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {color.images.length} {color.images.length === 1 ? 'image' : 'images'}
                    </span>
                  )}
                </label>
              </div>
              <ImageUpload
                images={color.images}
                onChange={(images) => handleColorChange(colorIndex, 'images', images)}
                label={`Images for ${color.name || 'Color ' + (colorIndex + 1)}`}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddColor}
          className="btn-primary add-color-btn"
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9375rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Add Another Color
        </button>
      </div>

      {/* Stock Management */}
      {sizes.length > 0 && colors.some(c => c.name.trim()) && (
        <div className="form-section stock-section" style={{ marginBottom: '2rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem', color: 'var(--navy)' }}>Stock Management</h2>
          <div className="stock-table-container" style={{ overflowX: 'auto' }}>
            <table className="stock-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                            className="stock-input"
                            style={{
                              width: '80px',
                              padding: '0.5rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              textAlign: 'center',
                              fontSize: '0.9375rem',
                              transition: 'all 0.2s ease',
                              outline: 'none',
                              background: '#ffffff'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#3b82f6';
                              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.boxShadow = 'none';
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
          {/* Mobile Stock Cards */}
          <div className="stock-cards-mobile">
            {sizes.map(size => (
              <div key={size} className="stock-card-mobile">
                <div className="stock-card-header" style={{ fontWeight: 700, marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid var(--border-light)' }}>
                  Size: {size}
                </div>
                {colors.filter(c => c.name.trim()).map(color => {
                  const key = `${size}-${color.name}`;
                  return (
                    <div key={key} className="stock-card-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 600 }}>{color.name}:</span>
                      <input
                        type="number"
                        min="0"
                        value={stock[key] || 0}
                        onChange={(e) => handleStockChange(size, color.name, parseInt(e.target.value) || 0)}
                        className="stock-input-mobile"
                        style={{
                          width: '100px',
                          padding: '12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          textAlign: 'center',
                          fontSize: '16px',
                          minHeight: '44px',
                          transition: 'all 0.2s ease',
                          outline: 'none',
                          background: '#ffffff'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3b82f6';
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="form-section" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem', color: 'var(--navy)' }}>Badges</h2>
        <div className="badges-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {availableBadges.map(badge => (
            <label
              key={badge}
              className="badge-label"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                background: badges.includes(badge) ? '#dbeafe' : '#f1f5f9',
                border: `1px solid ${badges.includes(badge) ? '#3b82f6' : '#e2e8f0'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                minHeight: '44px',
                transition: 'all 0.2s ease',
                fontWeight: badges.includes(badge) ? 500 : 400,
                color: badges.includes(badge) ? '#1e40af' : '#475569'
              }}
              onMouseEnter={(e) => {
                if (!badges.includes(badge)) {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (!badges.includes(badge)) {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
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
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  cursor: 'pointer',
                  accentColor: '#3b82f6'
                }}
              />
              <span>{badge}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Image */}
      <div className="form-section" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem', color: 'var(--navy)' }}>Main Image</h2>
        <div className="form-field" style={{ marginBottom: '1rem' }}>
          <label className="form-label" htmlFor="main-image" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
            Main Image URL
            <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#64748b', marginLeft: '0.5rem' }}>
              (Optional - first color's first image will be used if empty)
            </span>
          </label>
          <input
            id="main-image"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Main product image URL"
            className="form-input"
            style={{
              width: '100%',
              padding: '0.75rem 0.875rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              transition: 'all 0.2s ease',
              outline: 'none',
              background: '#ffffff'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        {image && (
          <ImagePositionEditor
            imageUrl={image}
            position={imagePosition}
            onChange={setImagePosition}
            aspectRatio="4/3"
          />
        )}
      </div>

      {/* Actions */}
      <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.75rem 2rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9375rem',
            color: '#475569',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || Object.values(fieldErrors).some(err => err)}
          className="btn-primary"
          style={{
            padding: '0.75rem 2rem',
            background: loading || Object.values(fieldErrors).some(err => err) ? '#94a3b8' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || Object.values(fieldErrors).some(err => err) ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            fontSize: '0.9375rem',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (!loading && !Object.values(fieldErrors).some(err => err)) {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !Object.values(fieldErrors).some(err => err)) {
              e.currentTarget.style.background = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading && <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>}
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        @media (max-width: 767px) {
          .product-form {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .product-form .section-title {
            font-size: 1.25rem !important;
            margin-bottom: 1rem !important;
          }
          .product-form .form-section {
            margin-bottom: 1.5rem !important;
          }
          .product-form .form-field {
            margin-bottom: 1rem !important;
          }
          .product-form .form-label {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
          .product-form .char-count {
            display: block !important;
            margin-left: 0 !important;
            margin-top: 4px !important;
          }
          .product-form .form-input,
          .product-form .form-textarea,
          .product-form .form-select {
            font-size: 16px !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .product-form .form-textarea {
            min-height: 120px !important;
          }
          .product-form .form-row-2 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .product-form .add-size-row {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .product-form .add-size-btn {
            width: 100% !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
          }
          .product-form .sizes-list {
            gap: 8px !important;
          }
          .product-form .size-tag {
            padding: 10px 14px !important;
            min-height: 44px !important;
          }
          .product-form .remove-size-btn {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            min-height: 32px !important;
            font-size: 18px !important;
          }
          .product-form .color-card {
            padding: 1rem !important;
            margin-bottom: 1.5rem !important;
          }
          .product-form .color-card-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            margin-bottom: 1rem !important;
          }
          .product-form .color-card-header > div {
            margin-right: 0 !important;
          }
          .product-form .remove-color-btn {
            width: 100% !important;
            align-self: stretch !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
          }
          .product-form .add-color-btn {
            width: 100% !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
          }
          .product-form .stock-table-container {
            display: none !important;
          }
          .product-form .stock-cards-mobile {
            display: block !important;
          }
          .product-form .stock-card-mobile {
            background: var(--white);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            padding: 16px;
            margin-bottom: 16px;
          }
          .product-form .stock-card-header {
            font-size: 16px;
            color: var(--navy);
          }
          .product-form .stock-card-row {
            padding: 8px 0;
          }
          .product-form .stock-input-mobile {
            font-size: 16px !important;
            min-height: 44px !important;
          }
          .product-form .badges-list {
            gap: 8px !important;
          }
          .product-form .badge-label {
            flex: 1 1 calc(50% - 4px) !important;
            min-width: calc(50% - 4px) !important;
            justify-content: center !important;
            padding: 12px 16px !important;
          }
          .product-form .form-actions {
            flex-direction: column !important;
            gap: 12px !important;
            width: 100% !important;
          }
          .product-form .form-actions button {
            width: 100% !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
          }
        }
        @media (min-width: 768px) {
          .product-form .stock-cards-mobile {
            display: none !important;
          }
        }
      `}</style>
    </form>
  );
}


