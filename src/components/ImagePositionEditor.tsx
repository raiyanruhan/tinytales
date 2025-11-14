import { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '@utils/imageUrl';

interface ImagePosition {
  x: number; // Percentage: 0-100
  y: number; // Percentage: 0-100
}

interface ImagePositionEditorProps {
  imageUrl: string;
  position: ImagePosition;
  onChange: (position: ImagePosition) => void;
  aspectRatio?: string; // e.g., '4/3'
}

export default function ImagePositionEditor({ 
  imageUrl, 
  position, 
  onChange, 
  aspectRatio = '4/3' 
}: ImagePositionEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDragStart({ x, y });
    updatePosition(x, y);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    updatePosition(x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePosition = (x: number, y: number) => {
    onChange({ x, y });
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const [ratioWidth, ratioHeight] = aspectRatio.split('/').map(Number);
  const containerAspectRatio = ratioWidth / ratioHeight;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.75rem', 
        fontWeight: 600,
        color: 'var(--navy)'
      }}>
        Image Position & Preview
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: 400, 
          color: 'var(--navy)', 
          opacity: 0.7, 
          marginLeft: '0.5rem' 
        }}>
          (Click and drag to reposition)
        </span>
      </label>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1.5rem',
        marginBottom: '1rem'
      }}>
        {/* Editor */}
        <div>
          <div style={{ 
            marginBottom: '0.5rem', 
            fontSize: '0.875rem', 
            color: 'var(--navy)',
            opacity: 0.8
          }}>
            Editor (Click & Drag)
          </div>
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: containerAspectRatio,
              backgroundColor: 'var(--paper)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
          >
            <img
              ref={imageRef}
              src={getImageUrl(imageUrl)}
              alt="Position editor"
              onLoad={(e) => {
                const img = e.currentTarget;
                const container = containerRef.current;
                if (!container) return;
                
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;
                const imgAspectRatio = img.naturalWidth / img.naturalHeight;
                const containerAspectRatio = containerWidth / containerHeight;
                
                // Ensure image overflows in both directions for positioning to work
                if (imgAspectRatio > containerAspectRatio) {
                  // Image is wider - ensure it overflows horizontally
                  img.style.width = 'auto';
                  img.style.height = '100%';
                } else {
                  // Image is taller - ensure it overflows vertically
                  img.style.width = '100%';
                  img.style.height = 'auto';
                }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: `${position.x}% ${position.y}%`,
                pointerEvents: 'none',
                userSelect: 'none'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
            {/* Center indicator */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '2px',
              height: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none'
            }} />
          </div>
        </div>

        {/* Preview */}
        <div>
          <div style={{ 
            marginBottom: '0.5rem', 
            fontSize: '0.875rem', 
            color: 'var(--navy)',
            opacity: 0.8
          }}>
            Product Card Preview
          </div>
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: containerAspectRatio,
            backgroundColor: 'var(--white)',
            border: '2px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <img
              src={getImageUrl(imageUrl)}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: `${position.x}% ${position.y}%`
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      </div>

      {/* Position controls */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'center',
        padding: '0.75rem',
        background: 'var(--cream)',
        borderRadius: 'var(--radius-sm)'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            marginBottom: '0.25rem',
            color: 'var(--navy)',
            opacity: 0.8
          }}>
            X Position: {position.x.toFixed(1)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={position.x}
            onChange={(e) => onChange({ ...position, x: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            marginBottom: '0.25rem',
            color: 'var(--navy)',
            opacity: 0.8
          }}>
            Y Position: {position.y.toFixed(1)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={position.y}
            onChange={(e) => onChange({ ...position, y: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
        <button
          type="button"
          onClick={() => onChange({ x: 50, y: 50 })}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--mint)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        >
          Center
        </button>
      </div>
    </div>
  );
}

