import React from 'react';
import { AuthProvider } from '../components/AuthGuard';
import { Dashboard } from '../components/Dashboard';
import { Toaster } from '../components/ui/toaster';

const Index = () => {
  return (
    <AuthProvider>
      <Dashboard />
      <Toaster />
    </AuthProvider>
  );
};

export default Index;
