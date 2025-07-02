import React from 'react';

// Base skeleton component
const Skeleton = ({ className = '', width = 'w-full', height = 'h-4', rounded = 'rounded' }) => (
  <div 
    className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse ${width} ${height} ${rounded} ${className}`}
    style={{
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s ease-in-out infinite'
    }}
  />
);

// Form field skeleton
export const FormFieldSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        <Skeleton width="w-5" height="h-5" rounded="rounded" />
        <Skeleton width="w-5" height="h-5" rounded="rounded" />
        <div className="flex-1">
          <Skeleton width="w-32" height="h-5" className="mb-2" />
          <Skeleton width="w-48" height="h-3" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton width="w-6" height="h-6" rounded="rounded" />
        <Skeleton width="w-6" height="h-6" rounded="rounded" />
        <Skeleton width="w-6" height="h-6" rounded="rounded" />
        <Skeleton width="w-6" height="h-6" rounded="rounded" />
      </div>
    </div>
  </div>
);

// Form list skeleton
export const FormListSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, index) => (
      <FormFieldSkeleton key={index} />
    ))}
  </div>
);

// Field type selector skeleton
export const FieldTypeSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    {[...Array(8)].map((_, index) => (
      <div key={index} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg">
        <Skeleton width="w-6" height="h-6" rounded="rounded" className="mb-2" />
        <Skeleton width="w-16" height="h-4" className="mb-1" />
        <Skeleton width="w-20" height="h-3" />
      </div>
    ))}
  </div>
);

// Form builder header skeleton
export const FormBuilderHeaderSkeleton = () => (
  <div className="space-y-4">
    <Skeleton width="w-48" height="h-6" />
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="flex items-center py-4 px-1">
            <Skeleton width="w-5" height="h-5" rounded="rounded" className="mr-2" />
            <Skeleton width="w-20" height="h-5" />
          </div>
        ))}
      </nav>
    </div>
  </div>
);

// Form editor skeleton (for basic info tab)
export const FormEditorSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, index) => (
        <div key={index}>
          <Skeleton width="w-24" height="h-4" className="mb-2" />
          <Skeleton width="w-full" height="h-10" rounded="rounded-md" />
        </div>
      ))}
    </div>
    <div>
      <Skeleton width="w-20" height="h-4" className="mb-2" />
      <Skeleton width="w-full" height="h-20" rounded="rounded-md" />
    </div>
    <div className="flex justify-end space-x-3">
      <Skeleton width="w-20" height="h-10" rounded="rounded-md" />
      <Skeleton width="w-24" height="h-10" rounded="rounded-md" />
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(columns)].map((_, index) => (
          <Skeleton key={index} width="w-24" height="h-4" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="grid grid-cols-4 gap-4 items-center">
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                width={colIndex === 0 ? "w-32" : colIndex === columns - 1 ? "w-20" : "w-24"} 
                height="h-4" 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Card skeleton
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton width="w-32" height="h-6" />
      <Skeleton width="w-16" height="h-8" rounded="rounded-full" />
    </div>
    <div className="space-y-3">
      <Skeleton width="w-full" height="h-4" />
      <Skeleton width="w-3/4" height="h-4" />
      <Skeleton width="w-1/2" height="h-4" />
    </div>
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex justify-between items-center">
        <Skeleton width="w-20" height="h-4" />
        <Skeleton width="w-24" height="h-8" rounded="rounded-md" />
      </div>
    </div>
  </div>
);

// Dashboard stats skeleton
export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton width="w-16" height="h-4" className="mb-2" />
            <Skeleton width="w-12" height="h-8" />
          </div>
          <Skeleton width="w-12" height="h-12" rounded="rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// Page skeleton (full page loader)
export const PageSkeleton = () => (
  <div className="p-6 space-y-6">
    <FormBuilderHeaderSkeleton />
    <StatsSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CardSkeleton />
      </div>
      <div>
        <CardSkeleton />
      </div>
    </div>
  </div>
);

// Add CSS for skeleton animation
const SkeletonStyles = () => (
  <style jsx>{`
    @keyframes skeleton-loading {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `}</style>
);

// Main export with styles
const SkeletonLoader = {
  Skeleton,
  FormFieldSkeleton,
  FormListSkeleton,
  FieldTypeSkeleton,
  FormBuilderHeaderSkeleton,
  FormEditorSkeleton,
  TableSkeleton,
  CardSkeleton,
  StatsSkeleton,
  PageSkeleton,
  Styles: SkeletonStyles
};

export default SkeletonLoader; 