"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrollProvider() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let frameId: number | null = null;

    const raf = (time: number) => {
      lenis?.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    const stopLenis = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }

      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
    };

    const startLenis = () => {
      if (mediaQuery.matches || lenis) {
        return;
      }

      lenis = new Lenis({
        autoRaf: false,
        lerp: 0.09,
        smoothWheel: true,
        touchMultiplier: 1,
        wheelMultiplier: 0.95,
      });

      frameId = window.requestAnimationFrame(raf);
    };

    const syncReducedMotion = () => {
      if (mediaQuery.matches) {
        stopLenis();
        return;
      }

      startLenis();
    };

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", syncReducedMotion);
      stopLenis();
    };
  }, []);

  return null;
}
