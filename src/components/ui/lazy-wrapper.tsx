import React, { useState, useRef, useEffect, Suspense } from 'react';
import { cn } from '@/lib/utils';

interface LazyWrapperProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  fallback = <div className="animate-pulse bg-muted rounded-lg h-32" />,
  placeholder,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      {!isVisible && placeholder && (
        <div className="absolute inset-0 z-10">
          {placeholder}
        </div>
      )}
      
      {isVisible && (
        <Suspense fallback={fallback}>
          <div onLoad={handleLoad}>
            {children}
          </div>
        </Suspense>
      )}
      
      {!isVisible && !placeholder && fallback && (
        <div className="absolute inset-0 z-10">
          {fallback}
        </div>
      )}
    </div>
  );
};

// Lazy loading hook for more complex scenarios
export const useLazyLoad = (options: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
} = {}) => {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

// Component for lazy loading images with blur-up effect
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder,
  width,
  height,
  priority = false,
}) => {
  const { ref, isVisible } = useLazyLoad({ 
    threshold: priority ? 0 : 0.1,
    triggerOnce: true 
  });
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      {placeholder && !isLoaded && (
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110"
          style={{ backgroundImage: `url(${placeholder})` }}
        />
      )}
      
      {isVisible && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}; 