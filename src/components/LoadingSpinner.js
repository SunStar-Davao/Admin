import React from 'react';

const LoadingSpinner = ({ fullPage = false, type = 'spinner', text = 'Loading' }) => {
  if (type === 'skeleton') {
    return (
      <div className="space-y-3 w-full">
        <div className="h-6 bg-gray-100 w-3/4"></div>
        <div className="h-24 bg-gray-100"></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-gray-100"></div>
          <div className="h-16 bg-gray-100"></div>
          <div className="h-16 bg-gray-100"></div>
        </div>
        <div className="h-40 bg-gray-100"></div>
      </div>
    );
  }

  const containerClass = fullPage 
    ? 'fixed inset-0 bg-white/80 z-50 flex items-center justify-center' 
    : 'flex items-center justify-center min-h-[200px]';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center">
          <div className="w-8 h-8 border border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
        </div>
        
        {text && (
          <p className="mt-3 text-xs text-gray-400">
            {text}...
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;