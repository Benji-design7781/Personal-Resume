"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const DESIGN_WIDTH = 1699;
const DESIGN_HEIGHT = 794;
const MAX_BOTTOM_BUFFER = 40;
const MIN_BOTTOM_BUFFER = 5;

function getCanvasScale() {
  if (typeof window === "undefined") {
    return 1;
  }

  return Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
}

export function AbilityScenesIntroStage() {
  const sectionRef = useRef<HTMLElement | null>(null);
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
      <div aria-hidden="true" className="h-[15svh]" style={{ backgroundColor: "#DA9767" }} />

      <div
        className="sticky top-0 h-[100svh] w-screen overflow-hidden"
        style={{ backgroundColor: "#DA9767" }}
      >
        <div
          className="ability-scenes-intro-canvas absolute left-1/2 text-white"
          style={canvasStyle}
        >
          <div
            className="ability-scenes-intro-title-svg-line ability-scenes-intro-title-line-1"
          >
            <img
              src="/assets/ability-intro/ability.svg"
              alt="能力"
              className="ability-scenes-intro-title-svg"
            />
          </div>
          <div
            className="ability-scenes-intro-title-svg-line ability-scenes-intro-title-line-2"
          >
            <img
              src="/assets/ability-intro/happen-in.svg"
              alt="发生在"
              className="ability-scenes-intro-title-svg"
            />
          </div>
          <div
            className="ability-scenes-intro-title-svg-line ability-scenes-intro-title-line-3"
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
            <span>NOT PROJECT LISTS</span>
            <span>BUT CAPABILITY SLICES</span>
          </div>

          <div
            className="ability-scenes-intro-note ability-scenes-intro-right-note"
          >
            <span>COMPLEX SCENES</span>
            <span>CLEAR SYSTEMS</span>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="bg-[#DA9767]"
        style={{
          backgroundColor: "#DA9767",
          height: "var(--intro-bottom-buffer-height, 40svh)",
          overflowAnchor: "none",
        }}
      />

      <style>{`
        .ability-scenes-intro-canvas {
          font-family: "Arial Black", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
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
      `}</style>
    </section>
  );
}

export default AbilityScenesIntroStage;
