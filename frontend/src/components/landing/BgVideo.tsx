"use client";
import { useEffect, useState } from "react";

export default function BgVideo({ src, className }: { src: string; className?: string }) {
  const [finalSrc, setFinalSrc] = useState<string | null>(null);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    setFinalSrc(mobile ? src.replace("-720.mp4", "-360.mp4") : src);
  }, [src]);

  if (!finalSrc) return null;
  return <video autoPlay muted loop playsInline preload="metadata" className={className} src={finalSrc} />;
}
