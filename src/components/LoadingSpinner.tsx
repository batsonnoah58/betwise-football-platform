import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        <div className="text-lg font-medium text-gray-700">Loading BetWise Football...</div>
        <div className="text-sm text-gray-500">Please wait while we set up your experience</div>
      </div>
    </div>
  );
}; 