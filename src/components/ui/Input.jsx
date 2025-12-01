'use client';

import { cn } from '@/lib/utils';

export const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <input
        className={cn(
          "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
    </div>
  );
};