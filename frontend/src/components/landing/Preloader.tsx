"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      setDone(true);
      document.body.style.overflow = "";
    }, 2100);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] bg-upBlack flex flex-col items-center justify-center"
          data-testid="preloader"
        >
          <motion.img
            src="/UP-Logo-removebg-preview.png"
            alt="UP"
            initial={{ scale: 0.4, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="h-28 w-auto drop-shadow-[0_0_50px_rgba(255,83,104,0.6)]"
          />
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.5em" }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-display text-white text-sm mt-8 uppercase"
          >
            UP Ideias
          </motion.p>
          <div className="mt-8 w-48 h-[2px] bg-upBorder overflow-hidden rounded-full">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="h-full w-full bg-upPink shadow-[0_0_12px_rgba(255,83,104,0.8)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
