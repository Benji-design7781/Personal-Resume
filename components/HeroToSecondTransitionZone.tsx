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
const SCROLL_HINT_FADE_START_Y = 0;
const SCROLL_HINT_FADE_DISTANCE = 110;
const FLIP_TO_BACK_ANTICIPATION_MS = 140;
const FLIP_TO_BACK_MAIN_MS = 760;
const FLIP_TO_BACK_SETTLE_MS = 280;
const FLIP_TO_FRONT_ANTICIPATION_MS = 130;
const FLIP_TO_FRONT_MAIN_MS = 740;
const FLIP_TO_FRONT_SETTLE_MS = 260;
const EXPAND_DURATION_MS = 560;
const SHRINK_DURATION_MS = 400;

type TransitionPhase =
  | "front"
  | "flippingToBack"
  | "back"
  | "expanding"
  | "expanded"
  | "shrinking"
  | "flippingToFront";

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
  phase: TransitionPhase;
  baseFlipTriggerY: number;
  flipTriggerAdvance: number;
  flipTriggerOffset: number;
  flipTriggerY: number;
  flipReverseY: number;
  reverseBuffer: number;
  flipped: boolean;
  targetRotation: number;
  rotationY: number;
  visualRotationY: number;
  expandTriggerY: number;
  expandReverseY: number;
  pendingExpand: boolean;
  expanded: boolean;
  targetExpand: number;
  expandValue: number;
  visualExpand: number;
  flipTimelineActive: boolean;
  expandTimelineActive: boolean;
  cardVisibleOpacity: number;
  cardLeft: number;
  cardTop: number;
  cardWidth: number;
  cardHeight: number;
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
  phase: "front",
  baseFlipTriggerY: 0,
  flipTriggerAdvance: 0,
  flipTriggerOffset: 0,
  flipTriggerY: 0,
  flipReverseY: 0,
  reverseBuffer: 0,
  flipped: false,
  targetRotation: 0,
  rotationY: 0,
  visualRotationY: 0,
  expandTriggerY: 0,
  expandReverseY: 0,
  pendingExpand: false,
  expanded: false,
  targetExpand: 0,
  expandValue: 0,
  visualExpand: 0,
  flipTimelineActive: false,
  expandTimelineActive: false,
  cardVisibleOpacity: 0,
  cardLeft: 0,
  cardTop: 0,
  cardWidth: 0,
  cardHeight: 0,
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

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutQuart(value: number) {
  return 1 - Math.pow(1 - value, 4);
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

function computeCardLayout(
  expandValue: number,
  initialPageRect: PageRect | null,
  captureLeft: number | null,
  centerTop: number,
) {
  if (!initialPageRect) {
    return {
      cardLeft: 0,
      cardTop: 0,
      cardWidth: 0,
      cardHeight: 0,
    };
  }

  const startLeft = captureLeft ?? initialPageRect.left - window.scrollX;
  const startTop = centerTop;
  const startWidth = initialPageRect.width;
  const startHeight = initialPageRect.height;
  const targetLeft = 0;
  const targetTop = 0;
  const targetWidth = window.innerWidth;
  const targetHeight = window.innerHeight;

  return {
    cardLeft: lerp(startLeft, targetLeft, expandValue),
    cardTop: lerp(startTop, targetTop, expandValue),
    cardWidth: lerp(startWidth, targetWidth, expandValue),
    cardHeight: lerp(startHeight, targetHeight, expandValue),
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
  const rotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const phaseRef = useRef<TransitionPhase>("front");
  const pendingExpandRef = useRef(false);
  const expandValueRef = useRef(0);
  const targetExpandRef = useRef(0);
  const flipRafRef = useRef<number | null>(null);
  const expandRafRef = useRef<number | null>(null);
  const latestScrollYRef = useRef(0);
  const latestFlipTriggerYRef = useRef(0);
  const latestFlipReverseYRef = useRef(0);
  const latestCaptureScrollYRef = useRef(0);
  const originalSourceOpacityRef = useRef("");
  const originalScrollHintStylesRef = useRef({
    opacity: "",
    transform: "",
  });
  const [debugState, setDebugState] =
    useState<DebugState>(initialDebugState);

  useEffect(() => {
    const syncAnimationDebugState = () => {
      setDebugState((currentState) => {
        const visualRotationY = clamp(rotationRef.current, -8, 188);
        const visualExpand = clamp(expandValueRef.current, 0, 1);
        const layout = computeCardLayout(
          visualExpand,
          currentState.initialPageRect,
          currentState.captureLeft,
          currentState.centerTop,
        );
        const phase = phaseRef.current;

        return {
          ...currentState,
          phase,
          flipped: phase !== "front",
          targetRotation: targetRotationRef.current,
          rotationY: rotationRef.current,
          visualRotationY,
          targetExpand: targetExpandRef.current,
          expandValue: expandValueRef.current,
          visualExpand,
          pendingExpand: pendingExpandRef.current,
          expanded: phase === "expanding" || phase === "expanded",
          flipTimelineActive: flipRafRef.current !== null,
          expandTimelineActive: expandRafRef.current !== null,
          cardLeft: layout.cardLeft,
          cardTop: layout.cardTop,
          cardWidth: layout.cardWidth,
          cardHeight: layout.cardHeight,
        };
      });
    };

    const cancelFlipTimeline = () => {
      if (flipRafRef.current !== null) {
        window.cancelAnimationFrame(flipRafRef.current);
        flipRafRef.current = null;
      }
    };

    const cancelExpandTimeline = () => {
      if (expandRafRef.current !== null) {
        window.cancelAnimationFrame(expandRafRef.current);
        expandRafRef.current = null;
      }
    };

    const startExpandTimeline = (target: 0 | 1) => {
      cancelExpandTimeline();

      const from = expandValueRef.current;
      const duration =
        target === 1 ? EXPAND_DURATION_MS : SHRINK_DURATION_MS;
      const easing = easeInOutCubic;

      targetExpandRef.current = target;
      phaseRef.current = target === 1 ? "expanding" : "shrinking";
      syncAnimationDebugState();

      let startTime: number | null = null;

      const step = (now: number) => {
        if (startTime === null) {
          startTime = now;
        }

        const progress = clamp((now - startTime) / duration, 0, 1);
        expandValueRef.current = lerp(from, target, easing(progress));
        syncAnimationDebugState();

        if (progress < 1) {
          expandRafRef.current = window.requestAnimationFrame(step);
          return;
        }

        expandValueRef.current = target;
        expandRafRef.current = null;

        if (target === 1) {
          phaseRef.current = "expanded";
          syncAnimationDebugState();
          return;
        }

        phaseRef.current = "back";
        syncAnimationDebugState();

        if (
          latestScrollYRef.current <= latestFlipReverseYRef.current ||
          latestScrollYRef.current < latestCaptureScrollYRef.current
        ) {
          startFlipTimeline("toFront");
        }
      };

      expandRafRef.current = window.requestAnimationFrame(step);
    };

    const startFlipTimeline = (direction: "toBack" | "toFront") => {
      cancelFlipTimeline();

      const segments =
        direction === "toBack"
          ? [
              { to: -10, duration: FLIP_TO_BACK_ANTICIPATION_MS, easing: easeOutCubic },
              { to: 194, duration: FLIP_TO_BACK_MAIN_MS, easing: easeInOutCubic },
              { to: 180, duration: FLIP_TO_BACK_SETTLE_MS, easing: easeOutCubic },
            ]
          : [
              { to: 190, duration: FLIP_TO_FRONT_ANTICIPATION_MS, easing: easeOutCubic },
              { to: -10, duration: FLIP_TO_FRONT_MAIN_MS, easing: easeInOutCubic },
              { to: 0, duration: FLIP_TO_FRONT_SETTLE_MS, easing: easeOutCubic },
            ];

      targetRotationRef.current = direction === "toBack" ? 180 : 0;
      phaseRef.current =
        direction === "toBack" ? "flippingToBack" : "flippingToFront";
      syncAnimationDebugState();

      let segmentIndex = 0;
      let segmentFrom = rotationRef.current;
      let segmentStart: number | null = null;

      const step = (now: number) => {
        if (segmentStart === null) {
          segmentStart = now;
        }

        const segment = segments[segmentIndex];
        const progress = clamp(
          (now - segmentStart) / segment.duration,
          0,
          1,
        );

        rotationRef.current = lerp(
          segmentFrom,
          segment.to,
          segment.easing(progress),
        );

        syncAnimationDebugState();

        if (progress < 1) {
          flipRafRef.current = window.requestAnimationFrame(step);
          return;
        }

        rotationRef.current = segment.to;

        if (segmentIndex < segments.length - 1) {
          segmentIndex += 1;
          segmentFrom = segment.to;
          segmentStart = now;
          flipRafRef.current = window.requestAnimationFrame(step);
          return;
        }

        flipRafRef.current = null;

        if (direction === "toBack") {
          phaseRef.current = "back";
          syncAnimationDebugState();

          if (
            pendingExpandRef.current &&
            latestScrollYRef.current >= latestFlipTriggerYRef.current
          ) {
            pendingExpandRef.current = false;
            startExpandTimeline(1);
          }

          return;
        }

        phaseRef.current = "front";
        pendingExpandRef.current = false;
        syncAnimationDebugState();
      };

      flipRafRef.current = window.requestAnimationFrame(step);
    };

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
        cancelFlipTimeline();
        cancelExpandTimeline();
        phaseRef.current = "front";
        pendingExpandRef.current = false;
        rotationRef.current = 0;
        targetRotationRef.current = 0;
        expandValueRef.current = 0;
        targetExpandRef.current = 0;
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
      const flipTriggerOffset = viewportHeight * 0.12;
      const baseFlipTriggerY = holdStartY + holdDistance + flipTriggerOffset;
      const flipTriggerAdvance = Math.min(
        Math.max(window.innerHeight * 0.18, 140),
        220,
      );
      const flipTriggerY = baseFlipTriggerY - flipTriggerAdvance;
      const reverseBuffer = 48;
      const flipReverseY = flipTriggerY - reverseBuffer;
      const expandTriggerY = flipTriggerY;
      const expandReverseY = flipReverseY;

      latestScrollYRef.current = scrollY;
      latestFlipTriggerYRef.current = flipTriggerY;
      latestFlipReverseYRef.current = flipReverseY;
      latestCaptureScrollYRef.current = captureScrollY;

      if (scrollY >= flipTriggerY) {
        if (phaseRef.current === "front") {
          pendingExpandRef.current = true;
          startFlipTimeline("toBack");
        } else if (phaseRef.current === "flippingToFront") {
          pendingExpandRef.current = true;
          startFlipTimeline("toBack");
        } else if (phaseRef.current === "back") {
          pendingExpandRef.current = false;
          startExpandTimeline(1);
        } else if (phaseRef.current === "shrinking") {
          startExpandTimeline(1);
        } else if (
          (phaseRef.current === "flippingToBack" ||
            phaseRef.current === "expanding" ||
            phaseRef.current === "expanded") &&
          !pendingExpandRef.current
        ) {
          pendingExpandRef.current = true;
        }
      }

      if (scrollY <= flipReverseY || scrollY < captureScrollY) {
        pendingExpandRef.current = false;

        if (
          phaseRef.current === "expanded" ||
          phaseRef.current === "expanding"
        ) {
          startExpandTimeline(0);
        } else if (phaseRef.current === "back") {
          startFlipTimeline("toFront");
        } else if (phaseRef.current === "flippingToBack") {
          startFlipTimeline("toFront");
        }
      }

      const scrollHintFadeProgress = clamp(
        (scrollY - SCROLL_HINT_FADE_START_Y) /
          Math.max(SCROLL_HINT_FADE_DISTANCE, 1),
        0,
        1,
      );
      const sourceOpacity = 1 - fadeProgress;
      const baseCloneOpacity = fadeProgress;
      const cloneOpacity = overlayActive ? baseCloneOpacity : 0;
      const cardVisibleOpacity = cloneOpacity;
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
      const visualExpand = clamp(expandValueRef.current, 0, 1);
      const layout = computeCardLayout(
        visualExpand,
        initialPageRect,
        captureLock?.left ?? null,
        centerTop,
      );

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
        phase: phaseRef.current,
        baseFlipTriggerY,
        flipTriggerAdvance,
        flipTriggerOffset,
        flipTriggerY,
        flipReverseY,
        reverseBuffer,
        flipped: phaseRef.current !== "front",
        targetRotation: targetRotationRef.current,
        rotationY: rotationRef.current,
        visualRotationY: clamp(rotationRef.current, -8, 188),
        expandTriggerY,
        expandReverseY,
        pendingExpand: pendingExpandRef.current,
        expanded:
          phaseRef.current === "expanding" || phaseRef.current === "expanded",
        targetExpand: targetExpandRef.current,
        expandValue: expandValueRef.current,
        visualExpand,
        flipTimelineActive: flipRafRef.current !== null,
        expandTimelineActive: expandRafRef.current !== null,
        cardVisibleOpacity,
        cardLeft: layout.cardLeft,
        cardTop: layout.cardTop,
        cardWidth: layout.cardWidth,
        cardHeight: layout.cardHeight,
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

      if (flipRafRef.current !== null) {
        window.cancelAnimationFrame(flipRafRef.current);
      }

      if (expandRafRef.current !== null) {
        window.cancelAnimationFrame(expandRafRef.current);
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
  const cardOuterStyle = initialPageRect
    ? ({
        height: `${debugState.cardHeight}px`,
        width: `${debugState.cardWidth}px`,
        opacity: debugState.cardVisibleOpacity,
        transform: `translate3d(${debugState.cardLeft}px, ${debugState.cardTop}px, 0)`,
        borderRadius: "0px",
        overflow: "hidden",
      } satisfies CSSProperties)
    : undefined;
  const cardInnerStyle = {
    transform: `rotateY(${debugState.visualRotationY}deg)`,
  } satisfies CSSProperties;

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
            className="fixed left-0 top-0 will-change-transform"
            data-transition-role="hero-image-card"
            style={cardOuterStyle}
          >
            <div
              className="h-full w-full"
              style={{
                perspective: "8000px",
                perspectiveOrigin: "50% 50%",
                borderRadius: 0,
                overflow: "hidden",
              }}
            >
              <div
                className="relative h-full w-full will-change-transform"
                style={{
                  ...cardInnerStyle,
                  borderRadius: 0,
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden"
                    data-transition-role="hero-image-card-front"
                    style={{
                      backfaceVisibility: "hidden",
                      borderRadius: 0,
                      transform: "rotateY(0deg) translateZ(0.1px)",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                >
                  <img
                    alt=""
                    className="block h-full w-full object-cover"
                    draggable={false}
                    src={HERO_VISUAL_SRC}
                  />
                </div>
                <div
                  className="absolute inset-0 h-full w-full overflow-hidden"
                  data-transition-role="hero-image-card-back"
                  style={{
                    backfaceVisibility: "hidden",
                    borderRadius: 0,
                    background: "#D09A6E",
                    transform: "rotateY(180deg) translateZ(0.1px)",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                />
              </div>
            </div>
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
      <div>phase: {state.phase}</div>
      <div>baseFlipTriggerY: {state.baseFlipTriggerY.toFixed(1)}</div>
      <div>FLIP_TRIGGER_ADVANCE: {state.flipTriggerAdvance.toFixed(1)}</div>
      <div>flipToBack keyframes: -10 / 194 / 180</div>
      <div>
        flipToBack durations: {FLIP_TO_BACK_ANTICIPATION_MS} /{" "}
        {FLIP_TO_BACK_MAIN_MS} / {FLIP_TO_BACK_SETTLE_MS}
      </div>
      <div>flipToFront keyframes: 190 / -10 / 0</div>
      <div>
        flipToFront durations: {FLIP_TO_FRONT_ANTICIPATION_MS} /{" "}
        {FLIP_TO_FRONT_MAIN_MS} / {FLIP_TO_FRONT_SETTLE_MS}
      </div>
      <div>expandDuration: {EXPAND_DURATION_MS}</div>
      <div>shrinkDuration: {SHRINK_DURATION_MS}</div>
      <div>expandEasing: easeInOutCubic</div>
      <div>flip offset: {state.flipTriggerOffset.toFixed(1)}</div>
      <div>flipTriggerY: {state.flipTriggerY.toFixed(1)}</div>
      <div>flipReverseY: {state.flipReverseY.toFixed(1)}</div>
      <div>reverse buffer: {state.reverseBuffer.toFixed(1)}</div>
      <div>flipped: {state.flipped ? "true" : "false"}</div>
      <div>rotationY: {state.rotationY.toFixed(1)}</div>
      <div>visualRotationY: {state.visualRotationY.toFixed(1)}</div>
      <div>expandTriggerY: {state.expandTriggerY.toFixed(1)}</div>
      <div>expandReverseY: {state.expandReverseY.toFixed(1)}</div>
      <div>expanded: {state.expanded ? "true" : "false"}</div>
      <div>expandValue: {state.expandValue.toFixed(3)}</div>
      <div>visualExpand: {state.visualExpand.toFixed(3)}</div>
      <div>
        flip timeline active: {state.flipTimelineActive ? "true" : "false"}
      </div>
      <div>
        expand timeline active: {state.expandTimelineActive ? "true" : "false"}
      </div>
      <div>back face: solid #D09A6E</div>
      <div>card opacity: {state.cardVisibleOpacity.toFixed(3)}</div>
      <div>
        card rect: {state.cardLeft.toFixed(1)} / {state.cardTop.toFixed(1)} /{" "}
        {state.cardWidth.toFixed(1)} / {state.cardHeight.toFixed(1)}
      </div>
      <div>cardRadius: 0</div>
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
