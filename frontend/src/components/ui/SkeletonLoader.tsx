import React from "react";
import { cn } from "../../utils/cn";

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-upBorder/40",
        className
      )}
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Title Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Bento Grid KPI Skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-upCard border border-upBorder rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-4 rounded-md" />
            </div>
            <Skeleton className="h-8 w-24 mt-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-upCard border border-upBorder rounded-2xl p-6 flex flex-col gap-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
};
