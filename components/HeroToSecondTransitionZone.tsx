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
const SPRING_STIFFNESS = 90;
const SPRING_DAMPING = 14;
const BACK_FACE_DESIGN_WIDTH = 1699;
const BACK_FACE_DESIGN_HEIGHT = 794;
const BACK_FACE_PREVIEW_ZOOM = 0.64;

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
  flipTriggerOffset: number;
  flipTriggerY: number;
  flipReverseY: number;
  reverseBuffer: number;
  flipProgress: number;
  flipped: boolean;
  targetRotation: number;
  rotationY: number;
  springVelocity: number;
  cardVisibleOpacity: number;
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
  designWidth: number;
  designHeight: number;
  cardWidth: number;
  cardHeight: number;
  cardAspect: number;
  baseCropWidth: number;
  baseCropHeight: number;
  previewZoom: number;
  previewCropWidth: number;
  previewCropHeight: number;
  previewCropX: number;
  previewCropY: number;
  cropScale: number;
  typographyScale: number;
  usesRealTypographyLayout: boolean;
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
  flipTriggerOffset: 0,
  flipTriggerY: 0,
  flipReverseY: 0,
  reverseBuffer: 0,
  flipProgress: 0,
  flipped: false,
  targetRotation: 0,
  rotationY: 0,
  springVelocity: 0,
  cardVisibleOpacity: 0,
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
  designWidth: BACK_FACE_DESIGN_WIDTH,
  designHeight: BACK_FACE_DESIGN_HEIGHT,
  cardWidth: 514,
  cardHeight: 289,
  cardAspect: 514 / 289,
  baseCropWidth: BACK_FACE_DESIGN_HEIGHT * (514 / 289),
  baseCropHeight: BACK_FACE_DESIGN_HEIGHT,
  previewZoom: BACK_FACE_PREVIEW_ZOOM,
  previewCropWidth:
    (BACK_FACE_DESIGN_HEIGHT * (514 / 289)) / BACK_FACE_PREVIEW_ZOOM,
  previewCropHeight: BACK_FACE_DESIGN_HEIGHT / BACK_FACE_PREVIEW_ZOOM,
  previewCropX:
    BACK_FACE_DESIGN_WIDTH / 2 -
    (BACK_FACE_DESIGN_HEIGHT * (514 / 289)) / BACK_FACE_PREVIEW_ZOOM / 2,
  previewCropY:
    BACK_FACE_DESIGN_HEIGHT / 2 -
    BACK_FACE_DESIGN_HEIGHT / BACK_FACE_PREVIEW_ZOOM / 2,
  cropScale:
    514 /
    ((BACK_FACE_DESIGN_HEIGHT * (514 / 289)) / BACK_FACE_PREVIEW_ZOOM),
  typographyScale: 0.86,
  usesRealTypographyLayout: true,
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

function computeBackFaceCrop(cardWidth: number, cardHeight: number) {
  const designWidth = BACK_FACE_DESIGN_WIDTH;
  const designHeight = BACK_FACE_DESIGN_HEIGHT;
  const cardAspect = cardWidth / cardHeight;
  const designAspect = designWidth / designHeight;

  let baseCropWidth: number;
  let baseCropHeight: number;

  if (cardAspect <= designAspect) {
    baseCropHeight = designHeight;
    baseCropWidth = designHeight * cardAspect;
  } else {
    baseCropWidth = designWidth;
    baseCropHeight = designWidth / cardAspect;
  }

  const previewZoom = BACK_FACE_PREVIEW_ZOOM;
  const previewCropWidth = baseCropWidth / previewZoom;
  const previewCropHeight = baseCropHeight / previewZoom;
  const previewCropX = designWidth / 2 - previewCropWidth / 2;
  const previewCropY = designHeight / 2 - previewCropHeight / 2;
  const cropScale = cardWidth / previewCropWidth;

  return {
    cardAspect,
    baseCropWidth,
    baseCropHeight,
    previewZoom,
    previewCropWidth,
    previewCropHeight,
    previewCropX,
    previewCropY,
    cropScale,
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
  const velocityRef = useRef(0);
  const targetRotationRef = useRef(0);
  const flippedRef = useRef(false);
  const springFrameRef = useRef<number | null>(null);
  const lastSpringTimeRef = useRef<number | null>(null);
  const originalSourceOpacityRef = useRef("");
  const originalScrollHintStylesRef = useRef({
    opacity: "",
    transform: "",
  });
  const [debugState, setDebugState] =
    useState<DebugState>(initialDebugState);

  useEffect(() => {
    const runSpring = (now: number) => {
      const lastTime = lastSpringTimeRef.current ?? now;
      const dt = Math.min((now - lastTime) / 1000, 0.032);
      lastSpringTimeRef.current = now;

      const rotation = rotationRef.current;
      const velocity = velocityRef.current;
      const target = targetRotationRef.current;
      const displacement = rotation - target;
      const acceleration =
        -SPRING_STIFFNESS * displacement - SPRING_DAMPING * velocity;
      const nextVelocity = velocity + acceleration * dt;
      let nextRotation = rotation + nextVelocity * dt;
      let settledVelocity = nextVelocity;

      if (
        Math.abs(nextRotation - target) < 0.05 &&
        Math.abs(nextVelocity) < 0.05
      ) {
        nextRotation = target;
        settledVelocity = 0;
      }

      rotationRef.current = nextRotation;
      velocityRef.current = settledVelocity;

      setDebugState((currentState) => ({
        ...currentState,
        flipped: flippedRef.current,
        flipProgress: flippedRef.current ? 1 : 0,
        rotationY: nextRotation,
        springVelocity: settledVelocity,
        targetRotation: targetRotationRef.current,
      }));

      if (nextRotation === target && settledVelocity === 0) {
        springFrameRef.current = null;
        lastSpringTimeRef.current = null;
        return;
      }

      springFrameRef.current = window.requestAnimationFrame(runSpring);
    };

    const startSpring = () => {
      if (springFrameRef.current === null) {
        lastSpringTimeRef.current = null;
        springFrameRef.current = window.requestAnimationFrame(runSpring);
      }
    };

    const setRotationTarget = (target: number, flipped: boolean) => {
      const targetChanged = targetRotationRef.current !== target;

      flippedRef.current = flipped;

      if (targetChanged) {
        targetRotationRef.current = target;
        startSpring();
      }
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
        setRotationTarget(0, false);
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
        setRotationTarget(0, false);
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
      const flipTriggerY = holdStartY + holdDistance + flipTriggerOffset;
      const reverseBuffer = 48;
      const flipReverseY = flipTriggerY - reverseBuffer;

      if (!flippedRef.current && scrollY >= flipTriggerY) {
        setRotationTarget(180, true);
      } else if (flippedRef.current && scrollY <= flipReverseY) {
        setRotationTarget(0, false);
      }

      const scrollHintFadeProgress = clamp(
        (scrollY - captureScrollY) /
          Math.max(viewportHeight * SCROLL_HINT_FADE_DISTANCE_RATIO, 1),
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
      const cardWidth = initialPageRect.width;
      const cardHeight = initialPageRect.height;
      const backFaceCrop = computeBackFaceCrop(cardWidth, cardHeight);

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
        flipTriggerOffset,
        flipTriggerY,
        flipReverseY,
        reverseBuffer,
        flipProgress: flippedRef.current ? 1 : 0,
        flipped: flippedRef.current,
        targetRotation: targetRotationRef.current,
        rotationY: rotationRef.current,
        springVelocity: velocityRef.current,
        cardVisibleOpacity,
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
        designWidth: BACK_FACE_DESIGN_WIDTH,
        designHeight: BACK_FACE_DESIGN_HEIGHT,
        cardWidth,
        cardHeight,
        cardAspect: backFaceCrop.cardAspect,
        baseCropWidth: backFaceCrop.baseCropWidth,
        baseCropHeight: backFaceCrop.baseCropHeight,
        previewZoom: backFaceCrop.previewZoom,
        previewCropWidth: backFaceCrop.previewCropWidth,
        previewCropHeight: backFaceCrop.previewCropHeight,
        previewCropX: backFaceCrop.previewCropX,
        previewCropY: backFaceCrop.previewCropY,
        cropScale: backFaceCrop.cropScale,
        typographyScale: 0.86,
        usesRealTypographyLayout: true,
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

      if (springFrameRef.current !== null) {
        window.cancelAnimationFrame(springFrameRef.current);
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
        width: `${initialPageRect.width}px`,
        height: `${initialPageRect.height}px`,
        opacity: debugState.cardVisibleOpacity,
        transform: `translate3d(${debugState.cloneLeft}px, ${debugState.cloneTop}px, 0)`,
      } satisfies CSSProperties)
    : undefined;
  const cardInnerStyle = {
    transform: `rotateY(${debugState.rotationY}deg)`,
  } satisfies CSSProperties;
  const cardWidth = initialPageRect?.width ?? 514;
  const cardHeight = initialPageRect?.height ?? 289;
  const backFaceCrop = computeBackFaceCrop(cardWidth, cardHeight);

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
              style={{ perspective: "1200px" }}
            >
              <div
                className="relative h-full w-full will-change-transform"
                style={{
                  ...cardInnerStyle,
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="absolute inset-0 h-full w-full overflow-hidden"
                  data-transition-role="hero-image-card-front"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(0deg)",
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
                    background: "#DA9767",
                    transform: "rotateY(180deg)",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <div
                    className="absolute inset-0 overflow-hidden"
                    data-transition-role="hero-image-card-back-static-typography"
                    style={{ pointerEvents: "none" }}
                  >
                    <div
                      style={{
                        height: `${BACK_FACE_DESIGN_HEIGHT}px`,
                        left: `${-backFaceCrop.previewCropX * backFaceCrop.cropScale}px`,
                        overflow: "visible",
                        position: "absolute",
                        top: `${-backFaceCrop.previewCropY * backFaceCrop.cropScale}px`,
                        transform: `scale(${backFaceCrop.cropScale})`,
                        transformOrigin: "top left",
                        width: `${BACK_FACE_DESIGN_WIDTH}px`,
                        background: "#DA9767",
                      }}
                    >
                      <div
                        style={{
                          height: `${BACK_FACE_DESIGN_HEIGHT}px`,
                          overflow: "visible",
                          position: "relative",
                          width: `${BACK_FACE_DESIGN_WIDTH}px`,
                        }}
                      >
                        <div
                          style={{
                            inset: 0,
                            position: "absolute",
                            transform: "scale(0.86)",
                            transformOrigin: "50% 52.3%",
                          }}
                        >
                          <div
                            style={{
                              height: "240px",
                              left: "565px",
                              position: "absolute",
                              top: "85px",
                              width: "417px",
                            }}
                          >
                            <img
                              alt=""
                              aria-hidden="true"
                              draggable={false}
                              src="/assets/ability-intro/ability.svg"
                              style={{
                                display: "block",
                                height: "100%",
                                objectFit: "contain",
                                width: "100%",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              height: "230px",
                              left: "555px",
                              position: "absolute",
                              top: "305px",
                              width: "582px",
                            }}
                          >
                            <img
                              alt=""
                              aria-hidden="true"
                              draggable={false}
                              src="/assets/ability-intro/happen-in.svg"
                              style={{
                                display: "block",
                                height: "100%",
                                objectFit: "contain",
                                width: "100%",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              height: "230px",
                              left: "555px",
                              position: "absolute",
                              top: "515px",
                              width: "582px",
                            }}
                          >
                            <img
                              alt=""
                              aria-hidden="true"
                              draggable={false}
                              src="/assets/ability-intro/scenes.svg"
                              style={{
                                display: "block",
                                height: "100%",
                                objectFit: "contain",
                                width: "100%",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              color: "#FFFFFF",
                              fontFamily:
                                'Inter, "Helvetica Neue", Arial, sans-serif',
                              fontSize: "18px",
                              fontWeight: 700,
                              left: "317px",
                              lineHeight: "24px",
                              position: "absolute",
                              textTransform: "uppercase",
                              top: "240px",
                              whiteSpace: "nowrap",
                              width: "215px",
                            }}
                          >
                            <span style={{ display: "block" }}>
                              NOT PROJECT LISTS
                            </span>
                            <span style={{ display: "block" }}>
                              BUT CAPABILITY SLICES
                            </span>
                          </div>
                          <div
                            style={{
                              color: "#FFFFFF",
                              fontFamily:
                                'Inter, "Helvetica Neue", Arial, sans-serif',
                              fontSize: "18px",
                              fontWeight: 700,
                              left: "1167px",
                              lineHeight: "24px",
                              position: "absolute",
                              textTransform: "uppercase",
                              top: "454px",
                              whiteSpace: "nowrap",
                              width: "215px",
                            }}
                          >
                            <span style={{ display: "block" }}>
                              COMPLEX SCENES
                            </span>
                            <span style={{ display: "block" }}>
                              CLEAR SYSTEMS
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
      <div>flip offset: {state.flipTriggerOffset.toFixed(1)}</div>
      <div>flipTriggerY: {state.flipTriggerY.toFixed(1)}</div>
      <div>flipReverseY: {state.flipReverseY.toFixed(1)}</div>
      <div>reverse buffer: {state.reverseBuffer.toFixed(1)}</div>
      <div>flipped: {state.flipped ? "true" : "false"}</div>
      <div>targetRotation: {state.targetRotation.toFixed(1)}</div>
      <div>flipProgress debug: {state.flipProgress.toFixed(3)}</div>
      <div>rotationY: {state.rotationY.toFixed(1)}</div>
      <div>spring velocity: {state.springVelocity.toFixed(2)}</div>
      <div>rotation source: spring</div>
      <div>back face: static typography</div>
      <div>
        real layout: {state.usesRealTypographyLayout ? "true" : "false"}
      </div>
      <div>typographyScale: {state.typographyScale.toFixed(2)}</div>
      <div>
        design: {state.designWidth.toFixed(0)} x{" "}
        {state.designHeight.toFixed(0)}
      </div>
      <div>
        card: {state.cardWidth.toFixed(1)} x {state.cardHeight.toFixed(1)}
      </div>
      <div>cardAspect: {state.cardAspect.toFixed(3)}</div>
      <div>
        baseCrop: {state.baseCropWidth.toFixed(1)} x{" "}
        {state.baseCropHeight.toFixed(1)}
      </div>
      <div>
        previewZoom: {state.previewZoom.toFixed(2)}
      </div>
      <div>
        previewCrop: {state.previewCropWidth.toFixed(1)} x{" "}
        {state.previewCropHeight.toFixed(1)}
      </div>
      <div>
        preview origin: {state.previewCropX.toFixed(1)} /{" "}
        {state.previewCropY.toFixed(1)}
      </div>
      <div>cropScale: {state.cropScale.toFixed(3)}</div>
      <div>card opacity: {state.cardVisibleOpacity.toFixed(3)}</div>
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
