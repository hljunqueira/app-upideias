import React from 'react';

export function LoadingState() {
  return (
    <div className="flex flex-col gap-4 w-full animate-pulse p-4">
      <div className="h-8 w-1/4 bg-upBorder rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 bg-upBorder rounded-xl"></div>
        <div className="h-28 bg-upBorder rounded-xl"></div>
        <div className="h-28 bg-upBorder rounded-xl"></div>
      </div>
      <div className="h-48 bg-upBorder rounded-xl mt-4"></div>
    </div>
  );
}
