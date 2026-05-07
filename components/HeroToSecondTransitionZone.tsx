"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const DEBUG = true;
const HERO_VISUAL_SELECTOR = '[data-debug-name="hero-center-visual"]';
const SCROLL_HINT_SELECTOR = '[data-debug-name="hero-scroll-down"]';
const ABILITY_STAGE_SELECTOR = '[data-measure="ability-intro-stage"]';
const HERO_VISUAL_SRC = "/assets/hero/hero-center-visual.jpg";
const FADE_DISTANCE = 16;
const CAPTURE_CENTER_RATIO = 0.5;
const HOLD_DISTANCE_RATIO = 0.35;
const SCROLL_HINT_FADE_DISTANCE_RATIO = 0.18;

type PageRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type DebugState = {
  scrollY: number;
  transitionZoneOffsetHeight: number;
  transitionZoneTop: number;
  abilityStageTop: number;
  captureScrollY: number;
  captureCenterY: number;
  initialPageRect: PageRect | null;
  naturalLeft: number;
  naturalTop: number;
  naturalCenterY: number;
  captureLeft: number | null;
  captureTop: number | null;
  centerTop: number;
  holdStartY: number;
  holdDistance: number;
  holdProgress: number;
  scrollHintFadeProgress: number;
  scrollDownOpacity: number;
  transitionZoneEndY: number;
  overlayActive: boolean;
  sourceOpacity: number;
  cloneOpacity: number;
  fadeProgress: number;
  cloneLeft: number;
  cloneTop: number;
  cloneCenterY: number;
  viewportCenterY: number;
};

const initialDebugState: DebugState = {
  scrollY: 0,
  transitionZoneOffsetHeight: 0,
  transitionZoneTop: 0,
  abilityStageTop: 0,
  captureScrollY: 0,
  captureCenterY: 0,
  initialPageRect: null,
  naturalLeft: 0,
  naturalTop: 0,
  naturalCenterY: 0,
  captureLeft: null,
  captureTop: null,
  centerTop: 0,
  holdStartY: 0,
  holdDistance: 0,
  holdProgress: 0,
  scrollHintFadeProgress: 0,
  scrollDownOpacity: 1,
  transitionZoneEndY: 0,
  overlayActive: true,
  sourceOpacity: 1,
  cloneOpacity: 0,
  fadeProgress: 0,
  cloneLeft: 0,
  cloneTop: 0,
  cloneCenterY: 0,
  viewportCenterY: 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function restoreInlineOpacity(
  element: HTMLElement | null,
  originalOpacity: string,
) {
  if (element) {
    element.style.opacity = originalOpacity;
  }
}

function restoreScrollHintStyles(
  element: HTMLElement | null,
  originalStyles: { opacity: string; transform: string },
) {
  if (element) {
    element.style.opacity = originalStyles.opacity;
    element.style.transform = originalStyles.transform;
  }
}

function measureSourceImage() {
  const element = document.querySelector<HTMLElement>(HERO_VISUAL_SELECTOR);

  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();

  return {
    element,
    initialPageRect: {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    },
  };
}

export function HeroToSecondTransitionZone() {
  const transitionZoneRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const sourceElementRef = useRef<HTMLElement | null>(null);
  const scrollHintRef = useRef<HTMLElement | null>(null);
  const abilityStageRef = useRef<HTMLElement | null>(null);
  const initialPageRectRef = useRef<PageRect | null>(null);
  const captureLockRef = useRef<{ left: number; top: number } | null>(null);
  const originalSourceOpacityRef = useRef("");
  const originalScrollHintStylesRef = useRef({
    opacity: "",
    transform: "",
  });
  const [debugState, setDebugState] =
    useState<DebugState>(initialDebugState);

  useEffect(() => {
    const syncMeasurement = () => {
      abilityStageRef.current = document.querySelector<HTMLElement>(
        ABILITY_STAGE_SELECTOR,
      );

      const scrollHint = document.querySelector<HTMLElement>(
        SCROLL_HINT_SELECTOR,
      );

      if (scrollHintRef.current && scrollHintRef.current !== scrollHint) {
        restoreScrollHintStyles(
          scrollHintRef.current,
          originalScrollHintStylesRef.current,
        );
      }

      if (scrollHint && scrollHintRef.current !== scrollHint) {
        originalScrollHintStylesRef.current = {
          opacity: scrollHint.style.opacity,
          transform: scrollHint.style.transform,
        };
      }

      scrollHintRef.current = scrollHint;

      const measurement = measureSourceImage();

      if (!measurement) {
        restoreInlineOpacity(
          sourceElementRef.current,
          originalSourceOpacityRef.current,
        );
        sourceElementRef.current = null;
        initialPageRectRef.current = null;
        return;
      }

      if (
        sourceElementRef.current &&
        sourceElementRef.current !== measurement.element
      ) {
        restoreInlineOpacity(
          sourceElementRef.current,
          originalSourceOpacityRef.current,
        );
      }

      if (sourceElementRef.current !== measurement.element) {
        originalSourceOpacityRef.current = measurement.element.style.opacity;
      }

      sourceElementRef.current = measurement.element;
      initialPageRectRef.current = measurement.initialPageRect;
    };

    const update = () => {
      frameRef.current = null;

      const initialPageRect = initialPageRectRef.current;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const viewportCenterY = viewportHeight / 2;
      const transitionZone = transitionZoneRef.current;
      const transitionZoneRect = transitionZone?.getBoundingClientRect();
      const transitionZoneOffsetHeight = transitionZone?.offsetHeight ?? 0;
      const transitionZoneTop = transitionZoneRect?.top ?? 0;
      const transitionZonePageTop = scrollY + transitionZoneTop;
      const transitionZoneEndY =
        transitionZonePageTop + transitionZoneOffsetHeight - viewportHeight;
      const overlayActive = scrollY < transitionZoneEndY;
      const abilityStageTop =
        abilityStageRef.current?.getBoundingClientRect().top ?? 0;

      if (!initialPageRect) {
        setDebugState({
          ...initialDebugState,
          scrollY,
          transitionZoneOffsetHeight,
          transitionZoneTop,
          abilityStageTop,
          transitionZoneEndY,
          overlayActive,
          viewportCenterY,
        });
        return;
      }

      const captureCenterY = viewportHeight * CAPTURE_CENTER_RATIO;
      const sourceCenterPageY =
        initialPageRect.top + initialPageRect.height / 2;
      const captureScrollY = sourceCenterPageY - captureCenterY;
      const naturalLeft = initialPageRect.left - window.scrollX;
      const naturalTop = initialPageRect.top - scrollY;
      const naturalCenterY = naturalTop + initialPageRect.height / 2;
      const centerTop = viewportCenterY - initialPageRect.height / 2;

      if (scrollY < captureScrollY) {
        captureLockRef.current = null;
      } else if (!captureLockRef.current) {
        captureLockRef.current = {
          left: naturalLeft,
          top: naturalTop,
        };
      }

      const captureLock = captureLockRef.current;
      const fadeProgress = clamp(
        (scrollY - captureScrollY) / FADE_DISTANCE,
        0,
        1,
      );
      const holdStartY = captureScrollY + FADE_DISTANCE;
      const holdDistance = viewportHeight * HOLD_DISTANCE_RATIO;
      const holdProgress = clamp(
        (scrollY - holdStartY) / Math.max(holdDistance, 1),
        0,
        1,
      );
      const scrollHintFadeProgress = clamp(
        (scrollY - captureScrollY) /
          Math.max(viewportHeight * SCROLL_HINT_FADE_DISTANCE_RATIO, 1),
        0,
        1,
      );
      const sourceOpacity = 1 - fadeProgress;
      const baseCloneOpacity = fadeProgress;
      const cloneOpacity = overlayActive ? baseCloneOpacity : 0;
      const scrollDownOpacity = 1 - scrollHintFadeProgress;
      const cloneLeft =
        scrollY < captureScrollY
          ? naturalLeft
          : captureLock?.left ?? naturalLeft;
      const cloneTop =
        scrollY < captureScrollY
          ? naturalTop
          : centerTop;
      const cloneCenterY = cloneTop + initialPageRect.height / 2;

      if (sourceElementRef.current) {
        sourceElementRef.current.style.opacity =
          sourceOpacity >= 1
            ? originalSourceOpacityRef.current
            : sourceOpacity.toString();
      }

      if (scrollHintRef.current) {
        if (scrollHintFadeProgress <= 0) {
          restoreScrollHintStyles(
            scrollHintRef.current,
            originalScrollHintStylesRef.current,
          );
        } else {
          scrollHintRef.current.style.opacity = scrollDownOpacity.toString();
          scrollHintRef.current.style.transform = `translate3d(0, ${
            -12 * scrollHintFadeProgress
          }px, 0)`;
        }
      }

      setDebugState({
        scrollY,
        transitionZoneOffsetHeight,
        transitionZoneTop,
        abilityStageTop,
        captureScrollY,
        captureCenterY,
        initialPageRect,
        naturalLeft,
        naturalTop,
        naturalCenterY,
        captureLeft: captureLock?.left ?? null,
        captureTop: captureLock?.top ?? null,
        centerTop,
        holdStartY,
        holdDistance,
        holdProgress,
        scrollHintFadeProgress,
        scrollDownOpacity,
        transitionZoneEndY,
        overlayActive,
        sourceOpacity,
        cloneOpacity,
        fadeProgress,
        cloneLeft,
        cloneTop,
        cloneCenterY,
        viewportCenterY,
      });
    };

    const scheduleUpdate = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(update);
      }
    };

    const handleResize = () => {
      syncMeasurement();
      scheduleUpdate();
    };

    const initialFrame = window.requestAnimationFrame(() => {
      syncMeasurement();
      scheduleUpdate();
    });

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", handleResize);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      restoreInlineOpacity(
        sourceElementRef.current,
        originalSourceOpacityRef.current,
      );
      restoreScrollHintStyles(
        scrollHintRef.current,
        originalScrollHintStylesRef.current,
      );
    };
  }, []);

  const initialPageRect = debugState.initialPageRect;
  const cloneStyle = initialPageRect
    ? ({
        width: `${initialPageRect.width}px`,
        height: `${initialPageRect.height}px`,
        opacity: debugState.cloneOpacity,
        transform: `translate3d(${debugState.cloneLeft}px, ${debugState.cloneTop}px, 0)`,
      } satisfies CSSProperties)
    : undefined;

  return (
    <section
      ref={transitionZoneRef}
      aria-hidden="true"
      data-transition-name="hero-to-second-transition-zone"
      style={{
        height: "320svh",
        minHeight: "320svh",
        position: "relative",
        background: "#F3F3F7",
        pointerEvents: "none",
        width: "100%",
      }}
    >
      <div className="pointer-events-none fixed inset-0 z-[80]">
        {initialPageRect ? (
          <div
            className="fixed left-0 top-0 overflow-hidden will-change-transform"
            data-transition-role="hero-image-clone"
            style={cloneStyle}
          >
            <img
              alt=""
              className="block h-full w-full object-cover"
              draggable={false}
              src={HERO_VISUAL_SRC}
            />
          </div>
        ) : null}

        {DEBUG && debugState.scrollY > 1 ? (
          <DebugPanel state={debugState} />
        ) : null}
      </div>
    </section>
  );
}

function DebugPanel({ state }: { state: DebugState }) {
  const rect = state.initialPageRect;

  return (
    <div className="fixed bottom-4 left-4 z-[89] max-w-[340px] rounded bg-black/70 px-3 py-2 font-mono text-[11px] leading-4 text-white shadow-lg pointer-events-none">
      <div>scrollY: {state.scrollY.toFixed(1)}</div>
      <div>zone height: {state.transitionZoneOffsetHeight.toFixed(1)}</div>
      <div>zone top: {state.transitionZoneTop.toFixed(1)}</div>
      <div>ability top: {state.abilityStageTop.toFixed(1)}</div>
      <div>zone endY: {state.transitionZoneEndY.toFixed(1)}</div>
      <div>overlay active: {state.overlayActive ? "true" : "false"}</div>
      <div>captureScrollY: {state.captureScrollY.toFixed(1)}</div>
      <div>captureCenterY: {state.captureCenterY.toFixed(1)}</div>
      <div>
        rect:{" "}
        {rect
          ? `${rect.left.toFixed(1)} / ${rect.top.toFixed(1)} / ${rect.width.toFixed(1)} / ${rect.height.toFixed(1)}`
          : "not found"}
      </div>
      <div>naturalLeft: {state.naturalLeft.toFixed(1)}</div>
      <div>naturalTop: {state.naturalTop.toFixed(1)}</div>
      <div>naturalCenterY: {state.naturalCenterY.toFixed(1)}</div>
      <div>
        captureLeft:{" "}
        {state.captureLeft === null ? "none" : state.captureLeft.toFixed(1)}
      </div>
      <div>
        captureTop:{" "}
        {state.captureTop === null ? "none" : state.captureTop.toFixed(1)}
      </div>
      <div>centerTop: {state.centerTop.toFixed(1)}</div>
      <div>holdStartY: {state.holdStartY.toFixed(1)}</div>
      <div>holdDistance: {state.holdDistance.toFixed(1)}</div>
      <div>holdProgress: {state.holdProgress.toFixed(3)}</div>
      <div>
        scroll hint fade: {state.scrollHintFadeProgress.toFixed(3)}
      </div>
      <div>scroll down opacity: {state.scrollDownOpacity.toFixed(3)}</div>
      <div>source opacity: {state.sourceOpacity.toFixed(3)}</div>
      <div>clone opacity: {state.cloneOpacity.toFixed(3)}</div>
      <div>fadeProgress: {state.fadeProgress.toFixed(3)}</div>
      <div>cloneLeft: {state.cloneLeft.toFixed(1)}</div>
      <div>cloneTop: {state.cloneTop.toFixed(1)}</div>
      <div>clone centerY: {state.cloneCenterY.toFixed(1)}</div>
      <div>viewport centerY: {state.viewportCenterY.toFixed(1)}</div>
    </div>
  );
}

export default HeroToSecondTransitionZone;
