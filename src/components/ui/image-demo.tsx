import React from 'react';
import { OptimizedImage, ResponsiveImage } from './optimized-image';
import { LazyWrapper, LazyImage } from './lazy-wrapper';
import { useResponsiveImage } from '@/lib/image-utils';

// Demo component showing image optimization usage
export const ImageOptimizationDemo: React.FC = () => {
  const { srcSet, sizes } = useResponsiveImage('/images/team-logo', 200);

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Image Optimization Demo</h2>
        
        {/* Basic optimized image */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Basic Optimized Image</h3>
          <OptimizedImage
            src="/images/example.jpg"
            alt="Example image"
            width={300}
            height={200}
            className="rounded-lg"
            priority={false}
          />
        </div>

        {/* Responsive image with multiple sizes */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Responsive Image</h3>
          <ResponsiveImage
            src="/images/team-logo.jpg"
            alt="Team logo"
            width={200}
            height={200}
            srcSet={srcSet}
            sizes={sizes}
            className="rounded-full"
          />
        </div>

        {/* Lazy loaded image with blur-up effect */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Lazy Loaded Image</h3>
          <LazyImage
            src="/images/hero-bg.jpg"
            alt="Hero background"
            placeholder="/images/hero-bg-placeholder.jpg"
            width={600}
            height={400}
            className="rounded-lg"
          />
        </div>

        {/* Lazy wrapper for any content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Lazy Wrapper</h3>
          <LazyWrapper
            placeholder={
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading content...</div>
              </div>
            }
          >
            <div className="h-64 bg-primary/10 rounded-lg flex items-center justify-center">
              <div className="text-primary font-semibold">Lazy loaded content!</div>
            </div>
          </LazyWrapper>
        </div>

        {/* Multiple images in a grid */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Image Grid</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <LazyWrapper key={i}>
                <OptimizedImage
                  src={`/images/gallery-${i}.jpg`}
                  alt={`Gallery image ${i}`}
                  width={300}
                  height={200}
                  className="rounded-lg w-full h-48 object-cover"
                />
              </LazyWrapper>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Usage examples for different scenarios
export const ImageUsageExamples: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Usage Examples</h2>
      
      {/* Team logo example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Team Logo</h3>
        <div className="flex items-center space-x-4">
          <OptimizedImage
            src="/images/team-logo.png"
            alt="Team logo"
            width={64}
            height={64}
            className="rounded-full"
            priority={true} // Critical image
          />
          <div>
            <div className="font-semibold">Team Name</div>
            <div className="text-sm text-muted-foreground">League Division</div>
          </div>
        </div>
      </div>

      {/* Hero image example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Hero Image</h3>
        <LazyImage
          src="/images/hero-stadium.jpg"
          alt="Stadium hero image"
          placeholder="/images/hero-stadium-placeholder.jpg"
          width={1200}
          height={600}
          className="w-full h-64 object-cover rounded-lg"
          priority={true}
        />
      </div>

      {/* Gallery example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Gallery</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Array.from({ length: 8 }, (_, i) => (
            <LazyWrapper key={i}>
              <OptimizedImage
                src={`/images/gallery-${i + 1}.jpg`}
                alt={`Gallery image ${i + 1}`}
                width={200}
                height={150}
                className="w-full h-24 object-cover rounded"
              />
            </LazyWrapper>
          ))}
        </div>
      </div>
    </div>
  );
}; 