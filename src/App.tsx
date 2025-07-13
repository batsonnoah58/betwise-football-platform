import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PaymentCallback } from "./pages/PaymentCallback";
import { PaymentSimulate } from "./pages/PaymentSimulate";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useState, useEffect, Suspense } from "react";
import { AuthProvider } from "./components/AuthGuard";
import React from "react";
import { preloadImages } from "./lib/image-utils";

// Create a QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Lazy load components for better performance
const LazyIndex = React.lazy(() => import("./pages/Index"));
const LazyNotFound = React.lazy(() => import("./pages/NotFound"));
const LazyPaymentCallback = React.lazy(() => import("./pages/PaymentCallback").then(module => ({ default: module.PaymentCallback })));
const LazyPaymentSimulate = React.lazy(() => import("./pages/PaymentSimulate").then(module => ({ default: module.PaymentSimulate })));

// Critical images to preload (add actual image URLs when available)
const criticalImages: string[] = [
  // Add critical image URLs here when actual images are used
  // Example: '/images/logo.webp', '/images/hero-bg.webp'
];

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload critical images
    if (criticalImages.length > 0) {
      preloadImages(criticalImages).catch(console.error);
    }

    // Register PWA manifest
    registerPWA();

    // Minimal initialization check
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Reduced from 1000ms to 100ms

    return () => clearTimeout(timer);
  }, []);

  // Register PWA manifest and meta tags
  const registerPWA = () => {
    // Add manifest link if not already present
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }

    // Add PWA meta tags
    const metaTags = [
      { name: 'theme-color', content: '#3b82f6' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'BetWise' },
      { name: 'msapplication-TileColor', content: '#3b82f6' },
      { name: 'msapplication-config', content: '/browserconfig.xml' },
    ];

    metaTags.forEach(tag => {
      if (!document.querySelector(`meta[name="${tag.name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });

    // Add Apple touch icons
    const appleIcons = [
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/icon-180x180.png' },
      { rel: 'apple-touch-icon', sizes: '152x152', href: '/icons/icon-152x152.png' },
      { rel: 'apple-touch-icon', sizes: '120x120', href: '/icons/icon-120x120.png' },
    ];

    appleIcons.forEach(icon => {
      if (!document.querySelector(`link[rel="${icon.rel}"][sizes="${icon.sizes}"]`)) {
        const link = document.createElement('link');
        link.rel = icon.rel;
        link.sizes = icon.sizes;
        link.href = icon.href;
        document.head.appendChild(link);
      }
    });
  };

  // Preload critical resources
  useEffect(() => {
    // Preload critical fonts if using custom fonts
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    // Add font URL when using custom fonts
    // link.href = '/fonts/inter-var.woff2';
    // document.head.appendChild(link);

    // Preload critical CSS
    const criticalCSS = document.createElement('link');
    criticalCSS.rel = 'preload';
    criticalCSS.as = 'style';
    criticalCSS.href = '/src/index.css';
    document.head.appendChild(criticalCSS);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LazyIndex />} />
                <Route path="/payment/callback" element={<LazyPaymentCallback />} />
                <Route path="/payment/simulate" element={<LazyPaymentSimulate />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<LazyNotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
