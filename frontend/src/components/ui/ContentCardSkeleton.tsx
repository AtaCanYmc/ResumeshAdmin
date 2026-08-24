import React from 'react';

export const ContentCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col shadow-sm animate-pulse h-full min-h-[220px]">
      <div className="flex justify-between items-start mb-4 gap-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4"></div>
        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-800 rounded-md shrink-0"></div>
      </div>

      <div className="space-y-2 mb-6 flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-2/3"></div>
      </div>

      <div className="flex items-end justify-between mt-auto gap-4">
        <div className="flex gap-2 flex-wrap flex-1">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
        </div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded-md shrink-0"></div>
      </div>
    </div>
  );
};
