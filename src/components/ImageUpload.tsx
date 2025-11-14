import { useState, useRef } from 'react';
import { uploadImages } from '@services/productApi';
import { getImageUrl } from '@utils/imageUrl';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  label?: string;
}

export default function ImageUpload({ images, onChange, multiple = true, label = 'Images' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setUploading(true);

    try {
      const fileArray = Array.from(files);
      const uploadedUrls = await uploadImages(fileArray);
      onChange([...images, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;

    // Basic URL validation
    try {
      new URL(urlInput);
      if (!images.includes(urlInput)) {
        onChange([...images, urlInput]);
        setUrlInput('');
        setError('');
      } else {
        setError('This URL is already added');
      }
    } catch {
      setError('Please enter a valid URL');
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="image-upload" style={{ marginBottom: '1.5rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 600,
        color: 'var(--navy)'
      }}>
        {label}
      </label>

      {/* File Upload */}
      <div className="upload-button-container" style={{ marginBottom: '1rem' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="upload-btn"
          style={{
            padding: '10px 20px',
            background: uploading ? '#94a3b8' : 'linear-gradient(135deg, var(--mint), var(--sky))',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            opacity: uploading ? 0.7 : 1,
            boxShadow: uploading ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
            minWidth: 'auto',
            width: 'auto'
          }}
          onMouseEnter={(e) => {
            if (!uploading) {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!uploading) {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          <span style={{ fontSize: '16px' }}>📤</span>
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
      </div>

      {/* URL Input */}
      <div className="url-input-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          ref={urlInputRef}
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
          placeholder="Or enter image URL"
          className="url-input"
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem'
          }}
        />
        <button
          type="button"
          onClick={handleUrlAdd}
          className="btn-primary add-url-btn"
        >
          Add URL
        </button>
      </div>

      {error && (
        <div style={{
          padding: '0.5rem',
          background: '#fee',
          color: 'var(--coral)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="image-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {images.map((img, index) => (
            <div
              key={index}
              className="image-preview"
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid var(--border-light)'
              }}
            >
              <img
                src={getImageUrl(img)}
                alt={`Upload ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="remove-image-btn"
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'var(--coral)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @media (max-width: 767px) {
          .image-upload .upload-btn {
            width: 100% !important;
            margin-right: 0 !important;
            margin-bottom: 12px !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
          }
          .image-upload .url-input-row {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .image-upload .url-input {
            width: 100% !important;
            font-size: 16px !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
          }
          .image-upload .add-url-btn {
            width: 100% !important;
            min-height: 44px !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
          }
          .image-upload .image-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
          }
          .image-upload .remove-image-btn {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            min-height: 32px !important;
            font-size: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}


