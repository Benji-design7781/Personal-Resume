"use client";

import { useEffect } from "react";
import Lenis from "lenis";

function getHeroImageReadyPromise() {
  const heroImage = document.querySelector<HTMLImageElement>(
    '[data-debug-name="hero-center-visual"] img',
  );

  if (!heroImage) {
    return Promise.resolve();
  }

  if (heroImage.complete) {
    return heroImage.decode?.().catch(() => undefined) ?? Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const done = () => resolve();

    heroImage.addEventListener("load", done, { once: true });
    heroImage.addEventListener("error", done, { once: true });
  }).then(() => heroImage.decode?.().catch(() => undefined));
}

function dispatchLayoutStabilizedResize() {
  window.dispatchEvent(new Event("resize"));
}

export default function SmoothScrollProvider() {
  useEffect(() => {
    const timers: number[] = [];

    const scheduleResize = (delay: number) => {
      const timer = window.setTimeout(() => {
        window.requestAnimationFrame(dispatchLayoutStabilizedResize);
      }, delay);

      timers.push(timer);
    };

    const fontReadyPromise =
      typeof document.fonts?.ready?.then === "function"
        ? document.fonts.ready.catch(() => undefined)
        : Promise.resolve();

    Promise.allSettled([fontReadyPromise, getHeroImageReadyPromise()]).then(
      () => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(dispatchLayoutStabilizedResize);
        });
      },
    );

    if (document.readyState === "complete") {
      scheduleResize(0);
    } else {
      window.addEventListener("load", dispatchLayoutStabilizedResize, {
        once: true,
      });
    }

    scheduleResize(600);
    scheduleResize(1500);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("load", dispatchLayoutStabilizedResize);
    };
  }, []);

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
