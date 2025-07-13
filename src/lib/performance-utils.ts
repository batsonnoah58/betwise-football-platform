// Performance optimization utilities

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/src/index.css';
  document.head.appendChild(criticalCSS);

  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  // Add when using custom fonts
  // fontLink.href = '/fonts/inter-var.woff2';
  // document.head.appendChild(fontLink);
};

// Optimize images loading
export const optimizeImageLoading = () => {
  // Add loading="lazy" to all images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Cache management
export const cacheManager = {
  // Simple in-memory cache
  cache: new Map<string, any>(),

  set(key: string, value: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  },

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  },

  clear() {
    this.cache.clear();
  }
};

// Performance monitoring
export const performanceMonitor = {
  marks: new Map<string, number>(),

  start(label: string) {
    this.marks.set(label, performance.now());
  },

  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.marks.delete(label);
    
    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
};

// Resource hints for better performance
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const dnsPrefetch = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.supabase.co'
  ];

  dnsPrefetch.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });

  // Preconnect to critical domains
  const preconnect = [
    'https://api.supabase.co'
  ];

  preconnect.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Optimize bundle loading
export const optimizeBundleLoading = () => {
  // Add modulepreload for critical modules
  const criticalModules = [
    '/src/pages/Index.tsx',
    '/src/components/Dashboard.tsx'
  ];

  criticalModules.forEach(module => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = module;
    document.head.appendChild(link);
  });
};

// Initialize all performance optimizations
export const initializePerformanceOptimizations = () => {
  preloadCriticalResources();
  addResourceHints();
  optimizeBundleLoading();
  
  // Optimize images after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeImageLoading);
  } else {
    optimizeImageLoading();
  }
}; 