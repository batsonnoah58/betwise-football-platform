import React from 'react';

export const LoadingSpinner: React.FC = React.memo(() => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <div className="text-base font-medium text-gray-700">Loading...</div>
      </div>
    </div>
  );
}); 