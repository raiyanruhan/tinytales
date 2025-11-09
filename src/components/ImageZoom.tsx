import { useState, useRef, useEffect } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  imagePosition?: { x: number; y: number };
}

export default function ImageZoom({ src, alt, className, style, imagePosition }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsZoomed(true);
      setIsDragging(true);
      const touch = e.touches[0];
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDragStart({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && containerRef.current) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Keep zoomed on touch devices for better UX
  };

  const handleDoubleClick = () => {
    setIsZoomed(!isZoomed);
  };

  const imageUrl = src.startsWith('http') ? src : `http://localhost:3001${src}`;
  const objectPosition = imagePosition 
    ? `${imagePosition.x}% ${imagePosition.y}%`
    : `${zoomPosition.x}% ${zoomPosition.y}%`;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
        touchAction: 'none',
        ...style
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: isZoomed ? objectPosition : (imagePosition ? `${imagePosition.x}% ${imagePosition.y}%` : 'center center'),
          transform: isZoomed ? 'scale(2)' : 'scale(1)',
          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          userSelect: 'none',
          pointerEvents: 'none'
        }}
        draggable={false}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
        }}
      />
      {isZoomed && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          fontWeight: 600,
          pointerEvents: 'none',
          zIndex: 10
        }}>
          {isDragging ? 'Drag to pan' : 'Double tap/click to zoom out'}
        </div>
      )}
    </div>
  );
}

