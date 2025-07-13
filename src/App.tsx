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

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Minimal initialization check
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Reduced from 1000ms to 100ms

    return () => clearTimeout(timer);
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
