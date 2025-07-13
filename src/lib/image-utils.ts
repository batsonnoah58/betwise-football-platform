// Image optimization utilities

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface ResponsiveImageSizes {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}

// Generate responsive image sizes
export const generateResponsiveSizes = (baseWidth: number, sizes: ResponsiveImageSizes = {}) => {
  const defaultSizes = {
    sm: Math.round(baseWidth * 0.5),
    md: Math.round(baseWidth * 0.75),
    lg: baseWidth,
    xl: Math.round(baseWidth * 1.25),
    '2xl': Math.round(baseWidth * 1.5),
  };

  return { ...defaultSizes, ...sizes };
};

// Generate srcSet for responsive images
export const generateSrcSet = (
  baseUrl: string,
  sizes: ResponsiveImageSizes,
  format: string = 'webp'
) => {
  return Object.entries(sizes)
    .map(([breakpoint, width]) => `${baseUrl}-${breakpoint}.${format} ${width}w`)
    .join(', ');
};

// Generate sizes attribute for responsive images
export const generateSizes = (sizes: ResponsiveImageSizes) => {
  const sizeEntries = Object.entries(sizes);
  return sizeEntries
    .map(([breakpoint, width]) => {
      const mediaQuery = breakpoint === 'sm' 
        ? '(max-width: 640px)'
        : breakpoint === 'md'
        ? '(max-width: 768px)'
        : breakpoint === 'lg'
        ? '(max-width: 1024px)'
        : breakpoint === 'xl'
        ? '(max-width: 1280px)'
        : '(min-width: 1536px)';
      
      return `${mediaQuery} ${width}px`;
    })
    .join(', ');
};

// Detect image format from URL
export const detectImageFormat = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  return extension || 'jpeg';
};

// Generate optimized image URL
export const generateOptimizedUrl = (
  originalUrl: string,
  options: ImageOptimizationOptions = {}
) => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // This would typically integrate with an image optimization service
  // For now, we'll return the original URL with query parameters
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  params.append('f', format);
  
  return `${originalUrl}?${params.toString()}`;
};

// Calculate aspect ratio
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

// Generate placeholder data URL
export const generatePlaceholder = (width: number, height: number, text: string = 'Loading...') => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = src;
  });
};

// Batch preload images
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => preloadImage(url));
  await Promise.all(promises);
};

// Image optimization hook
export const useImageOptimization = (src: string, options: ImageOptimizationOptions = {}) => {
  const optimizedSrc = generateOptimizedUrl(src, options);
  const format = detectImageFormat(src);
  
  return {
    src: optimizedSrc,
    format,
    preload: () => preloadImage(optimizedSrc),
  };
};

// Responsive image hook
export const useResponsiveImage = (
  baseUrl: string,
  baseWidth: number,
  customSizes?: ResponsiveImageSizes
) => {
  const sizes = generateResponsiveSizes(baseWidth, customSizes);
  const srcSet = generateSrcSet(baseUrl, sizes);
  const sizesAttr = generateSizes(sizes);
  
  return {
    srcSet,
    sizes: sizesAttr,
    sizesConfig: sizes,
  };
}; 