import React, { useRef, useState } from "react";
import { cn } from "../../utils/cn";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  onClick,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current) return;
    const { left, top } = itemRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <div
      ref={itemRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        "row-span-1 rounded-2xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-upCard dark:border-upBorder border border-transparent justify-between flex flex-col space-y-4 relative overflow-hidden cursor-pointer",
        className
      )}
    >
      {/* Glow border effect */}
      {isHovered && (
        <div
          className="absolute pointer-events-none rounded-2xl inset-0 z-0 transition duration-300"
          style={{
            background: `radial-gradient(250px circle at ${coords.x}px ${coords.y}px, rgba(255, 83, 104, 0.15), transparent 80%)`,
            border: "1px solid rgba(255, 83, 104, 0.3)",
          }}
        />
      )}
      <div className="flex flex-col h-full justify-between z-10">
        {header}
        <div className="group-hover/bento:translate-x-2 transition duration-200">
          <div className="flex items-center gap-2">
            {icon}
            <div className="font-bold text-upWhite mb-1 mt-2">
              {title}
            </div>
          </div>
          <div className="font-normal text-upGray text-xs">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};
