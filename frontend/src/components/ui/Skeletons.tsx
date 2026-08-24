import React from 'react';

export const HeroSkeleton = () => (
  <div className="flex-1 space-y-6 text-center lg:text-left z-10 w-full animate-pulse">
    <div className="h-16 sm:h-20 lg:h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl w-3/4 mx-auto lg:mx-0"></div>
    <div className="h-10 sm:h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/2 mx-auto lg:mx-0 mt-4"></div>
    <div className="space-y-3 mt-6 max-w-2xl mx-auto lg:mx-0">
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6"></div>
    </div>
    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6">
      <div className="h-14 w-40 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      <div className="h-14 w-40 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      <div className="flex gap-2 ml-0 sm:ml-4 mt-4 sm:mt-0">
        <div className="h-11 w-11 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-11 w-11 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-11 w-11 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      </div>
    </div>
  </div>
);

export const MetricsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-8 animate-pulse w-full">
    <div className="h-48 md:col-span-2 md:row-span-2 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
    <div className="h-48 md:col-span-2 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
    <div className="h-48 md:col-span-2 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
  </div>
);

export const TimelineSkeleton = () => (
  <div className="py-12 w-full animate-pulse">
    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-10 mx-auto xl:mx-0"></div>
    <div className="relative pl-4 sm:pl-8 space-y-8">
      <div className="absolute left-4 sm:left-8 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800 rounded-full" />
      {[1, 2, 3].map(i => (
        <div key={i} className="relative pl-8 sm:pl-12">
          <div className="absolute left-[-5px] sm:left-[-5px] top-6 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full"></div>
        </div>
      ))}
    </div>
  </div>
);

export const ProjectsSkeleton = () => (
  <div className="pt-8 w-full animate-pulse">
    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-6 mx-auto xl:mx-0"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full"></div>
      ))}
    </div>
  </div>
);

export const ArticlesSkeleton = () => (
  <div className="pt-12 w-full animate-pulse">
    <div className="flex items-center gap-3 mb-6 justify-center xl:justify-start">
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full"></div>
      ))}
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm animate-pulse overflow-hidden">
    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800 flex justify-between">
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="px-6 py-5 flex justify-between items-center">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/5"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/6"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-16"></div>
        </div>
      ))}
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse w-full">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full"></div>
    ))}
  </div>
);
