import { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '@utils/imageUrl';

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
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const magnifierRef = useRef<HTMLDivElement>(null);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!isMobile && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMagnifierPosition({ x, y });
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      setZoomPosition({ 
        x: Math.max(0, Math.min(100, percentX)), 
        y: Math.max(0, Math.min(100, percentY)) 
      });
      setIsZoomed(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsZoomed(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isMobile) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Ensure position is within bounds
    const boundedX = Math.max(0, Math.min(rect.width, x));
    const boundedY = Math.max(0, Math.min(rect.height, y));
    
    // Position for magnifier lens (centered on cursor)
    setMagnifierPosition({ x: boundedX, y: boundedY });
    
    // Position for zoom calculation (percentage of container)
    // This represents where the cursor is relative to the container
    const percentX = (boundedX / rect.width) * 100;
    const percentY = (boundedY / rect.height) * 100;
    
    setZoomPosition({ 
      x: Math.max(0, Math.min(100, percentX)), 
      y: Math.max(0, Math.min(100, percentY)) 
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsZoomed(true);
      setIsDragging(true);
      const touch = e.touches[0];
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
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
  };

  const handleDoubleClick = () => {
    if (!isMobile) {
      setIsZoomed(!isZoomed);
    }
  };

  const imageUrl = getImageUrl(src);
  const magnifierSize = 200; // Size of the circular magnifier
  const zoomLevel = 5; // Zoom level inside the magnifier

  // For mobile, use the old full-screen zoom behavior
  if (isMobile) {
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
      </div>
    );
  }

  // For desktop, use circular magnifier
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: isZoomed ? 'none' : 'crosshair',
        ...style
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onDoubleClick={handleDoubleClick}
    >
      {/* Base image */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: imagePosition ? `${imagePosition.x}% ${imagePosition.y}%` : 'center center',
          userSelect: 'none',
          pointerEvents: 'none'
        }}
        draggable={false}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
        }}
      />
      
      {/* Circular magnifier lens */}
      {isZoomed && (
        <div
          ref={magnifierRef}
          className="magnifier-lens"
          style={{
            position: 'absolute',
            left: `${magnifierPosition.x}px`,
            top: `${magnifierPosition.y}px`,
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08), 0 4px 20px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            background: '#fff'
          }}
        >
          {/* Zoomed image inside magnifier using background-image for better control */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${100 * zoomLevel}%`,
              // Background position: align the point at zoomPosition with the center of magnifier
              // Since background-position percentages align the background's point at that % 
              // with the container's point at that %, we use zoomPosition directly
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundRepeat: 'no-repeat',
              pointerEvents: 'none'
            }}
          />
        </div>
      )}
    </div>
  );
}

