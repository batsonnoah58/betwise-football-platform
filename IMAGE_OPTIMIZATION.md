# Image Optimization & Lazy Loading

This document outlines the image optimization and lazy loading infrastructure implemented in the BetWise application.

## Components

### OptimizedImage
A high-performance image component with built-in lazy loading and optimization features.

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

<OptimizedImage
  src="/images/team-logo.png"
  alt="Team logo"
  width={64}
  height={64}
  className="rounded-full"
  priority={true} // For critical images
  loading="lazy" // or "eager"
/>
```

**Features:**
- Intersection Observer-based lazy loading
- Loading states with skeleton placeholders
- Error handling with fallback UI
- Priority loading for critical images
- Responsive sizing support

### ResponsiveImage
Automatically generates responsive image sizes and srcSet for optimal performance.

```tsx
import { ResponsiveImage } from '@/components/ui/optimized-image';

<ResponsiveImage
  src="/images/hero-bg.jpg"
  alt="Hero background"
  width={1200}
  height={600}
  className="w-full h-64 object-cover"
/>
```

**Features:**
- Automatic srcSet generation
- Responsive sizes attribute
- Multiple format support (WebP, AVIF, JPEG, PNG)
- Breakpoint-based sizing

### LazyImage
Lazy loading image with blur-up effect for smooth loading experience.

```tsx
import { LazyImage } from '@/components/ui/lazy-wrapper';

<LazyImage
  src="/images/hero-stadium.jpg"
  alt="Stadium hero image"
  placeholder="/images/hero-stadium-placeholder.jpg"
  width={1200}
  height={600}
  className="w-full h-64 object-cover rounded-lg"
  priority={true}
/>
```

**Features:**
- Blur-up loading effect
- Placeholder image support
- Smooth opacity transitions
- Priority loading option

### LazyWrapper
Generic lazy loading wrapper for any content.

```tsx
import { LazyWrapper } from '@/components/ui/lazy-wrapper';

<LazyWrapper
  placeholder={
    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  }
>
  <div className="h-64 bg-primary/10 rounded-lg">
    Lazy loaded content!
  </div>
</LazyWrapper>
```

## Utilities

### Image Optimization Utilities

```tsx
import { 
  generateOptimizedUrl, 
  generateResponsiveSizes, 
  preloadImages 
} from '@/lib/image-utils';

// Generate optimized image URL
const optimizedUrl = generateOptimizedUrl('/images/logo.png', {
  width: 300,
  height: 200,
  quality: 80,
  format: 'webp'
});

// Generate responsive sizes
const sizes = generateResponsiveSizes(400, {
  sm: 200,
  md: 300,
  lg: 400,
  xl: 500
});

// Preload critical images
await preloadImages([
  '/images/logo.webp',
  '/images/hero-bg.webp'
]);
```

### Hooks

```tsx
import { useResponsiveImage, useImageOptimization } from '@/lib/image-utils';

// Responsive image hook
const { srcSet, sizes } = useResponsiveImage('/images/team-logo', 200);

// Image optimization hook
const { src, format, preload } = useImageOptimization('/images/logo.png', {
  width: 300,
  height: 200,
  quality: 80
});
```

## Best Practices

### 1. Critical Images
Use `priority={true}` for above-the-fold images:

```tsx
<OptimizedImage
  src="/images/hero-bg.jpg"
  alt="Hero background"
  priority={true}
  className="w-full h-64 object-cover"
/>
```

### 2. Team Logos
Optimize team logos for consistent sizing:

```tsx
<OptimizedImage
  src={team.logo}
  alt={`${team.name} logo`}
  width={64}
  height={64}
  className="rounded-full"
  priority={true}
/>
```

### 3. Gallery Images
Use lazy loading for gallery images:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
  {images.map((image, i) => (
    <LazyWrapper key={i}>
      <OptimizedImage
        src={image.src}
        alt={image.alt}
        width={200}
        height={150}
        className="w-full h-24 object-cover rounded"
      />
    </LazyWrapper>
  ))}
</div>
```

### 4. Hero Images
Use blur-up effect for hero images:

```tsx
<LazyImage
  src="/images/stadium-hero.jpg"
  alt="Stadium hero image"
  placeholder="/images/stadium-hero-placeholder.jpg"
  width={1200}
  height={600}
  className="w-full h-64 object-cover rounded-lg"
  priority={true}
/>
```

## Performance Benefits

1. **Reduced Initial Bundle Size**: Images load only when needed
2. **Faster Page Load**: Critical images preload, others lazy load
3. **Bandwidth Optimization**: Responsive images serve appropriate sizes
4. **Better UX**: Smooth loading states and transitions
5. **SEO Friendly**: Proper alt tags and loading attributes

## Integration with Image Services

The utilities are designed to work with image optimization services like:
- Cloudinary
- ImageKit
- Cloudflare Images
- Vercel Image Optimization

Simply update the `generateOptimizedUrl` function to use your preferred service's API.

## Future Enhancements

1. **WebP/AVIF Support**: Automatic format detection and conversion
2. **Progressive JPEG**: For better perceived performance
3. **Art Direction**: Different crops for different screen sizes
4. **CDN Integration**: Automatic CDN URL generation
5. **Analytics**: Track image loading performance

## Usage in BetWise

Currently, the application uses emoji logos for teams. When actual team logos are added:

1. Replace emoji logos with `OptimizedImage` components
2. Add hero images using `LazyImage` with blur-up effect
3. Implement gallery views using `LazyWrapper`
4. Preload critical images in `App.tsx`

Example team logo implementation:

```tsx
// In GameCard.tsx
<div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
  {team.logo.startsWith('http') ? (
    <OptimizedImage
      src={team.logo}
      alt={`${team.name} logo`}
      width={48}
      height={48}
      className="w-full h-full object-cover rounded-full"
      priority={true}
    />
  ) : (
    <span>{team.logo}</span> // Fallback to emoji
  )}
</div>
``` 