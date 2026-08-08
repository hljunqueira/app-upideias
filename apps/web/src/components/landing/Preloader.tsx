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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-0"
          >
            <img
              src="/UP-Logo-removebg-preview.png"
              alt="UP Logo"
              className="h-24 w-auto object-contain drop-shadow-[0_0_40px_rgba(255,83,104,0.6)]"
            />
            <span className="font-script text-white text-5xl lowercase font-semibold tracking-normal drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] -ml-4">
              ideias
            </span>
          </motion.div>

          {/* Barra de progresso de carregamento */}
          <div className="mt-10 w-48 h-[2px] bg-upBorder overflow-hidden rounded-full">
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
