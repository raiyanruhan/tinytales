import { useState, useRef } from 'react';
import { uploadImages } from '@services/productApi';

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
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 600,
        color: 'var(--navy)'
      }}>
        {label}
      </label>

      {/* File Upload */}
      <div style={{ marginBottom: '1rem' }}>
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
          className="btn-primary"
          style={{
            marginRight: '0.5rem',
            opacity: uploading ? 0.6 : 1,
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
      </div>

      {/* URL Input */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          ref={urlInputRef}
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
          placeholder="Or enter image URL"
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
          className="btn-primary"
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {images.map((img, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid var(--border-light)'
              }}
            >
              <img
                src={img.startsWith('http') ? img : `http://localhost:3001${img}`}
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
    </div>
  );
}


