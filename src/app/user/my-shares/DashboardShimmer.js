  'use client';
  import React from "react";

  const DashboardShimmer = () => {
    // Array representing the 8 menu items
    const shimmerItems = [
      { iconSize: 'w-8 h-8', titleWidth: 'w-32' },
      { iconSize: 'w-8 h-8', titleWidth: 'w-28' },
      { iconSize: 'w-8 h-8', titleWidth: 'w-36' },
      { iconSize: 'w-8 h-8', titleWidth: 'w-32' },
      { iconSize: 'w-8 h-8', titleWidth: 'w-36' },
      { iconSize: 'w-8 h-8', titleWidth: 'w-32' },
      { iconSize: 'w-8 h-8', titleWidth: 'w-40' },
      { iconSize: 'w-8 h-8', titleWidth: 'w-32' }
    ];

    return (
      <div className="page-container p-4">
        <div className="tiles-grid gap-4">
          {shimmerItems.map((item, index) => (
            <div 
              key={index} 
              className="tile-link relative overflow-hidden"
            >
              <div className="tile p-6 rounded-lg border border-gray-100 shadow-sm">
                {/* Icon placeholder with pulse animation */}
                <div className={`${item.iconSize} bg-gray-200 rounded-full animate-pulse mb-4`} />
                
                {/* Title placeholder */}
                <div className={`${item.titleWidth} h-6 bg-gray-200 rounded animate-pulse mb-3`} />
                
                {/* Dynamic bottom content (count or amount) */}
                <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
                
                {/* Shimmer overlay effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  export default DashboardShimmer;