"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const DESIGN_WIDTH = 1699;
const DESIGN_HEIGHT = 794;
const MAX_BOTTOM_BUFFER = 30;
const MIN_BOTTOM_BUFFER = 5;

function getCanvasScale() {
  if (typeof window === "undefined") {
    return 1;
  }

  return Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
}

export function AbilityScenesIntroStage() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const hasPlayedRef = useRef(false);
  const pendingTimerRef = useRef<number | null>(null);
  const [isIntroPlayed, setIsIntroPlayed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      setScale(getCanvasScale());
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncReducedMotion = () => {
      const shouldReduce = mediaQuery.matches;

      setPrefersReducedMotion(shouldReduce);

      if (shouldReduce) {
        hasPlayedRef.current = true;
        setIsIntroPlayed(true);
      }
    };

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", syncReducedMotion);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage || prefersReducedMotion || hasPlayedRef.current) {
      return;
    }

    let frameId: number | null = null;

    const isStageReady = () => {
      const rect = stage.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, viewportHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibleRatio = rect.height > 0 ? visibleHeight / rect.height : 0;

      return visibleRatio >= 0.3 && rect.top < viewportHeight && rect.bottom > 0;
    };

    const clearPendingTimer = () => {
      if (pendingTimerRef.current !== null) {
        window.clearTimeout(pendingTimerRef.current);
        pendingTimerRef.current = null;
      }
    };

    const startReveal = () => {
      hasPlayedRef.current = true;
      setIsIntroPlayed(true);
      clearPendingTimer();
    };

    const evaluateStageReadiness = () => {
      frameId = null;

      if (hasPlayedRef.current) {
        clearPendingTimer();
        return;
      }

      if (!isStageReady()) {
        clearPendingTimer();
        return;
      }

      if (pendingTimerRef.current !== null) {
        return;
      }

      pendingTimerRef.current = window.setTimeout(() => {
        pendingTimerRef.current = null;
        const latestRect = stage.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const stillVisible = latestRect.bottom > 0 && latestRect.top < viewportHeight;

        if (!hasPlayedRef.current && stillVisible) {
          startReveal();
        }
      }, 150);
    };

    const scheduleEvaluation = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(evaluateStageReadiness);
      }
    };

    scheduleEvaluation();
    window.addEventListener("scroll", scheduleEvaluation, { passive: true });
    window.addEventListener("resize", scheduleEvaluation);

    return () => {
      window.removeEventListener("scroll", scheduleEvaluation);
      window.removeEventListener("resize", scheduleEvaluation);
      clearPendingTimer();

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId: number | null = null;
    let displayedProgress = 0;
    let targetProgress = 0;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));

    const applyBottomBufferHeight = (progress: number) => {
      const height = MAX_BOTTOM_BUFFER - progress * (MAX_BOTTOM_BUFFER - MIN_BOTTOM_BUFFER);

      section.style.setProperty("--intro-bottom-buffer-height", `${height}svh`);
    };

    const updateBottomBufferHeight = () => {
      frameId = null;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrolled = -rect.top;
      const startShrink = viewportHeight * 0.25;
      const shrinkRange = viewportHeight * 0.95;
      const rawProgress = clamp((scrolled - startShrink) / shrinkRange, 0, 1);
      const easedProgress = Math.pow(rawProgress, 2.6);

      targetProgress = mediaQuery.matches ? 0 : easedProgress;

      displayedProgress += (targetProgress - displayedProgress) * 0.12;

      if (Math.abs(targetProgress - displayedProgress) < 0.001) {
        displayedProgress = targetProgress;
      }

      applyBottomBufferHeight(displayedProgress);

      if (Math.abs(targetProgress - displayedProgress) >= 0.001) {
        frameId = window.requestAnimationFrame(updateBottomBufferHeight);
      }
    };

    const scheduleUpdate = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrolled = -rect.top;
      const startShrink = viewportHeight * 0.25;
      const shrinkRange = viewportHeight * 0.95;
      const rawProgress = clamp((scrolled - startShrink) / shrinkRange, 0, 1);
      const easedProgress = Math.pow(rawProgress, 2.6);

      targetProgress = mediaQuery.matches ? 0 : easedProgress;

      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateBottomBufferHeight);
      }
    };

    applyBottomBufferHeight(displayedProgress);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    mediaQuery.addEventListener("change", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      mediaQuery.removeEventListener("change", scheduleUpdate);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    section.style.setProperty("--intro-left-note-y", "0px");
    section.style.setProperty("--intro-right-note-y", "0px");

    if (prefersReducedMotion) {
      return;
    }

    let frameId: number | null = null;
    let leftCurrentY = 0;
    let rightCurrentY = 0;
    let leftTargetY = 0;
    let rightTargetY = 0;
    let hasInitialized = false;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));

    const getProgressTargets = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const virtualSectionHeight = viewportHeight * 1.2;
      const progressRange = viewportHeight + virtualSectionHeight;
      const rawProgress = (viewportHeight - rect.top) / progressRange;
      const progress = clamp(rawProgress, 0, 1);

      return {
        active: rect.bottom > 0 && rect.top < viewportHeight,
        left: 70 - progress * 140,
        right: 80 - progress * 160,
      };
    };

    const applyVars = () => {
      section.style.setProperty("--intro-left-note-y", `${leftCurrentY}px`);
      section.style.setProperty("--intro-right-note-y", `${rightCurrentY}px`);
    };

    const tick = () => {
      frameId = null;

      leftCurrentY += (leftTargetY - leftCurrentY) * 0.1;
      rightCurrentY += (rightTargetY - rightCurrentY) * 0.1;

      if (Math.abs(leftTargetY - leftCurrentY) < 0.05) {
        leftCurrentY = leftTargetY;
      }

      if (Math.abs(rightTargetY - rightCurrentY) < 0.05) {
        rightCurrentY = rightTargetY;
      }

      applyVars();

      if (
        Math.abs(leftTargetY - leftCurrentY) >= 0.05 ||
        Math.abs(rightTargetY - rightCurrentY) >= 0.05
      ) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    const scheduleTick = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    const syncTargets = () => {
      const { left, right } = getProgressTargets();

      leftTargetY = left;
      rightTargetY = right;

      if (!hasInitialized) {
        leftCurrentY = left;
        rightCurrentY = right;
        hasInitialized = true;
        applyVars();
        return;
      }

      scheduleTick();
    };

    syncTargets();
    window.addEventListener("scroll", syncTargets, { passive: true });
    window.addEventListener("resize", syncTargets);

    return () => {
      window.removeEventListener("scroll", syncTargets);
      window.removeEventListener("resize", syncTargets);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [prefersReducedMotion]);

  const canvasStyle = {
    width: `${DESIGN_WIDTH}px`,
    height: `${DESIGN_HEIGHT}px`,
    top: "50%",
    transform: `translate(-50%, -50%) scale(${scale})`,
    transformOrigin: "center center",
  } as CSSProperties;

  return (
    <section
      aria-label="能力发生在场景里"
      data-measure="ability-intro-stage"
      ref={sectionRef}
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden"
      style={{ backgroundColor: "#DA9767", overflowAnchor: "none" }}
    >
      <div aria-hidden="true" className="h-[10svh]" style={{ backgroundColor: "#DA9767" }} />

      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] w-screen overflow-hidden"
        style={{ backgroundColor: "#DA9767" }}
      >
        <div
          className={`ability-scenes-intro-canvas absolute left-1/2 text-white ${
            isIntroPlayed ? "is-intro-played" : ""
          } ${prefersReducedMotion ? "is-intro-reduced-motion" : ""}`}
          style={canvasStyle}
        >
          <div className="typography-scale-layer">
          <div
            className="ability-scenes-intro-title-svg-line ability-scenes-intro-title-line-1 intro-reveal-mask intro-reveal-ltr intro-delay-0"
          >
            <img
              src="/assets/ability-intro/ability.svg"
              alt="能力"
              className="ability-scenes-intro-title-svg"
            />
          </div>
          <div
            className="ability-scenes-intro-title-svg-line ability-scenes-intro-title-line-2 intro-reveal-mask intro-reveal-rtl intro-delay-34"
          >
            <img
              src="/assets/ability-intro/happen-in.svg"
              alt="发生在"
              className="ability-scenes-intro-title-svg"
            />
          </div>
          <div
            className="ability-scenes-intro-title-svg-line ability-scenes-intro-title-line-3 intro-reveal-mask intro-reveal-ltr intro-delay-68"
          >
            <img
              src="/assets/ability-intro/scenes.svg"
              alt="场景里"
              className="ability-scenes-intro-title-svg"
            />
          </div>

          <div
            className="ability-scenes-intro-note ability-scenes-intro-left-note"
          >
            <div className="ability-scenes-intro-note-scroll-layer ability-scenes-intro-note-scroll-layer-left">
              <div className="ability-scenes-intro-note-reveal intro-reveal-mask intro-reveal-rtl intro-delay-82">
                <span>NOT PROJECT LISTS</span>
                <span>BUT CAPABILITY SLICES</span>
              </div>
            </div>
          </div>

          <div
            className="ability-scenes-intro-note ability-scenes-intro-right-note"
          >
            <div className="ability-scenes-intro-note-scroll-layer ability-scenes-intro-note-scroll-layer-right">
              <div className="ability-scenes-intro-note-reveal intro-reveal-mask intro-reveal-ltr intro-delay-82">
                <span>COMPLEX SCENES</span>
                <span>CLEAR SYSTEMS</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="bg-[#DA9767]"
        style={{
          backgroundColor: "#DA9767",
          height: "var(--intro-bottom-buffer-height, 30svh)",
          overflowAnchor: "none",
        }}
      />

      <style>{`
        .ability-scenes-intro-canvas {
          font-family: "Arial Black", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
        }

        .typography-scale-layer {
          position: absolute;
          inset: 0;
          transform: scale(0.86);
          transform-origin: 50% 52.3%;
        }

        .ability-scenes-intro-title-svg-line {
          position: absolute;
        }

        .ability-scenes-intro-title-line-1 {
          left: 565px;
          top: 85px;
          width: 417px;
          height: 240px;
        }

        .ability-scenes-intro-title-line-2 {
          left: 555px;
          top: 305px;
          width: 582px;
          height: 230px;
        }

        .ability-scenes-intro-title-line-3 {
          left: 555px;
          top: 515px;
          width: 582px;
          height: 230px;
        }

        .ability-scenes-intro-title-svg {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .intro-reveal-mask {
          overflow: hidden;
          will-change: clip-path;
          animation-duration: 0.66s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: forwards;
        }

        .intro-reveal-ltr {
          clip-path: inset(0 100% 0 0);
        }

        .intro-reveal-rtl {
          clip-path: inset(0 0 0 100%);
        }

        .is-intro-played .intro-reveal-ltr {
          animation-name: introRevealLtr;
        }

        .is-intro-played .intro-reveal-rtl {
          animation-name: introRevealRtl;
        }

        .intro-delay-0 {
          animation-delay: 0s;
        }

        .intro-delay-34 {
          animation-delay: 0.34s;
        }

        .intro-delay-68 {
          animation-delay: 0.68s;
        }

        .intro-delay-82 {
          animation-delay: 0.82s;
        }

        @keyframes introRevealLtr {
          from {
            clip-path: inset(0 100% 0 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes introRevealRtl {
          from {
            clip-path: inset(0 0 0 100%);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        .ability-scenes-intro-note {
          position: absolute;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          font-family: Inter, "Helvetica Neue", Arial, sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0;
          line-height: 24px;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .ability-scenes-intro-note-scroll-layer {
          width: 100%;
          will-change: transform;
        }

        .ability-scenes-intro-note-scroll-layer-left {
          transform: translate3d(0, var(--intro-left-note-y, 0px), 0);
        }

        .ability-scenes-intro-note-scroll-layer-right {
          transform: translate3d(0, var(--intro-right-note-y, 0px), 0);
        }

        .ability-scenes-intro-note-reveal {
          display: flex;
          flex-direction: column;
        }

        .ability-scenes-intro-left-note {
          left: 317px;
          top: 240px;
          width: 215px;
        }

        .ability-scenes-intro-right-note {
          left: 1167px;
          top: 454px;
          width: 215px;
        }

        .is-intro-reduced-motion .intro-reveal-ltr,
        .is-intro-reduced-motion .intro-reveal-rtl {
          animation: none !important;
          clip-path: inset(0 0 0 0);
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-reveal-mask {
            animation: none !important;
            clip-path: inset(0 0 0 0) !important;
            will-change: auto;
          }
        }
      `}</style>
    </section>
  );
}

export default AbilityScenesIntroStage;
