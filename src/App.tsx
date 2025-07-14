import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { AuthProvider } from "./components/AuthGuard";
import React, { Suspense } from "react";
import { initializePerformanceOptimizations } from "./lib/performance-utils";
import './index.css'; // Import CSS via JS/TS only

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
// const LazyIndex = React.lazy(() => import("./pages/Index"));
// const LazyNotFound = React.lazy(() => import("./pages/NotFound"));
// const LazyPaymentCallback = React.lazy(() => import("./pages/PaymentCallback").then(module => ({ default: module.PaymentCallback })));
// const LazyPaymentSimulate = React.lazy(() => import("./pages/PaymentSimulate").then(module => ({ default: module.PaymentSimulate })));

const App = () => {
  // Initialize performance optimizations
  React.useEffect(() => {
    initializePerformanceOptimizations();
  }, []);

  // Register PWA manifest and meta tags
  React.useEffect(() => {
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          {/* <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LazyIndex />} />
                <Route path="/payment/callback" element={<LazyPaymentCallback />} />
                <Route path="/payment/simulate" element={<LazyPaymentSimulate />} />
                <Route path="*" element={<LazyNotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter> */}
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1>App Loaded (Router Temporarily Disabled)</h1>
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
