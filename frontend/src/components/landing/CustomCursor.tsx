"use client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 250, damping: 25 });
  const ringY = useSpring(y, { stiffness: 250, damping: 25 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement;
      setHovering(!!t.closest("a, button, [role='button']"));
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        style={{ x, y }}
        className="fixed top-0 left-0 z-[99] pointer-events-none -translate-x-1/2 -translate-y-1/2"
      >
        <div className="w-2 h-2 rounded-full bg-upPink -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(255,83,104,0.9)]" />
      </motion.div>
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="fixed top-0 left-0 z-[99] pointer-events-none"
      >
        <div
          className={`rounded-full border -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            hovering ? "w-14 h-14 border-upPink bg-upPink/10" : "w-8 h-8 border-upPink/50"
          }`}
        />
      </motion.div>
    </>
  );
}
