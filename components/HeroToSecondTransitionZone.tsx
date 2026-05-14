"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const DEBUG = false;
const BRIDGE_VERSION = "final-scroll-bridge";

const HERO_VISUAL_SELECTOR = '[data-debug-name="hero-center-visual"]';
const HERO_VISUAL_SRC = "/assets/hero/hero-center-visual.jpg";

const ORANGE = "#6FA9E7";
const DESIGN_WIDTH = 1699;
const DESIGN_HEIGHT = 794;
const TRANSITION_SEGMENT_HEIGHT_SVH = 220;
const BRIDGE_OVERLAP_SVH = 100;
const HERO_IDLE_EPS = 0.015;
const HANDOFF_THRESHOLD = 0.08;
const FLIP_START = 0.12;
const FLIP_END = 0.38;
const EXPAND_START = 0.38;
const EXPAND_COMPLETE_THRESHOLD = 0.88;
const TYPOGRAPHY_TRIGGER_DELAY_MS = 100;
const TYPOGRAPHY_REVEAL_TOTAL_MS = 680 + 660 + 120;
const TYPOGRAPHY_REVEAL_DURATION_MS = 660;
const TOP_BREATHING_SVH = 10;
const ORANGE_TAIL_HEIGHT_SVH = 30;
const FINAL_ORANGE_GAP_SVH = 5;
const ORANGE_TAIL_COLLAPSE_RANGE_SVH =
  ORANGE_TAIL_HEIGHT_SVH - FINAL_ORANGE_GAP_SVH;
const ORANGE_TAIL_COLLAPSE_DISTANCE_VH = 0.4;
const FIXED_SEAM_PX = 5;
const SMALL_TEXT_SCROLL_FACTOR = 0.1;
const SMALL_TEXT_MAX_OFFSET = 64;
const SMALL_TEXT_SMOOTH = 0.12;

type RectState = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type TypographyState = "idle" | "pending" | "playing" | "played";

type BridgeDebugState = {
  bridgeVersion: string;
  transitionProgress: number;
  legacyBridgeProgress: number;
  lowerCollapseProgress: number;
  lowerCollapseSource: string;
  orangeTailCollapseProgress: number;
  flipProgress: number;
  expandProgress: number;
  expandComplete: boolean;
  typographyState: TypographyState;
  typographyRunId: number;
  typographyTriggerPending: boolean;
  bigLine1Reveal: string;
  bigLine2Reveal: string;
  bigLine3Reveal: string;
  smallTextRevealStartedWithThirdLine: boolean;
  smallTextRevealDurationMatchesThirdLine: boolean;
  heroSourceBound: boolean;
  visibleHeroSourceCount: number;
  visibleBridgeImageCount: number;
  heroSourceOpacity: number;
  bridgeCardOpacity: number;
  frontImageOpacity: number;
  orangeOpacity: number;
  transitionIsolationActive: boolean;
  typographyVisible: boolean;
  cardStartRectSource: string;
  liveHeroRect: RectState;
  frozenCardStartRect: RectState;
  cardCurrentRect: RectState;
  isBridgeActive: boolean;
  topBreathingSvh: number;
  orangeTailHeightSvh: number;
  orangeTailHeightPx: number;
  finalOrangeGapSvh: number;
  fixedSeamPx: number;
  fixedSeamStable: boolean;
  orangeContentTop: number;
  smallTextAnchorScrollY: number | null;
  smallTextScrollDeltaFromAnchor: number;
  smallTextTargetY: number;
  smallTextCurrentY: number;
  smallTextFinalY: number;
  smallTextTransformApplied: boolean;
  stickyEndY: number;
  collapseDistance: number;
  currentScrollY: number;
  lowerSentinelTop: number;
  lowerShellRectTop: number;
  lowerSectionEnteredViewport: boolean;
  visibleOrangeGapPx: number;
  visibleOrangeGapSvh: number;
  visibleGapSampleColor: string;
  visibleGapIsOrange: boolean;
  lowerShellHasMarginTop: boolean;
  lowerShellHasPaddingTop: boolean;
  lowerSpacerExists: boolean;
  lowerShellBackground: string;
  lowerShellParentBackground: string;
  lowerShellHasGradient: boolean;
  lowerShellTransformForTailCollapse: boolean;
  abilityCardsTransparentHackActive: boolean;
  lowerSectionNormalFlow: boolean;
  gapPaintedBy: string;
  orangeTailRect: RectState;
  orangeLowerSeamRect: RectState;
  lowerFirstVisualRect: RectState;
  scrollHintFound: boolean;
  scrollHintHidden: boolean;
  scrollHintText: string;
  scrollHintRect: RectState;
  scrollHintHideReason: string;
  lastHeroIdleResetAt: number;
  heroIdleResetCount: number;
  isHeroIdleClean: boolean;
};

const fallbackHeroRect = {
  left: 619.2,
  top: 252.5,
  width: 514,
  height: 289,
} satisfies RectState;

const emptyDebugRect = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
} satisfies RectState;

const initialDebugState = {
  bridgeVersion: BRIDGE_VERSION,
  transitionProgress: 0,
  legacyBridgeProgress: 0,
  lowerCollapseProgress: 0,
  lowerCollapseSource: "sentinel",
  orangeTailCollapseProgress: 0,
  flipProgress: 0,
  expandProgress: 0,
  expandComplete: false,
  typographyState: "idle",
  typographyRunId: 0,
  typographyTriggerPending: false,
  bigLine1Reveal: "LTR",
  bigLine2Reveal: "RTL",
  bigLine3Reveal: "LTR",
  smallTextRevealStartedWithThirdLine: true,
  smallTextRevealDurationMatchesThirdLine: true,
  heroSourceBound: false,
  visibleHeroSourceCount: 0,
  visibleBridgeImageCount: 0,
  heroSourceOpacity: 1,
  bridgeCardOpacity: 0,
  frontImageOpacity: 0,
  orangeOpacity: 0,
  transitionIsolationActive: false,
  typographyVisible: false,
  cardStartRectSource: "fallback",
  liveHeroRect: fallbackHeroRect,
  frozenCardStartRect: fallbackHeroRect,
  cardCurrentRect: fallbackHeroRect,
  isBridgeActive: false,
  topBreathingSvh: TOP_BREATHING_SVH,
  orangeTailHeightSvh: ORANGE_TAIL_HEIGHT_SVH,
  orangeTailHeightPx: 0,
  finalOrangeGapSvh: FINAL_ORANGE_GAP_SVH,
  fixedSeamPx: FIXED_SEAM_PX,
  fixedSeamStable: true,
  orangeContentTop: 0,
  smallTextAnchorScrollY: null,
  smallTextScrollDeltaFromAnchor: 0,
  smallTextTargetY: 0,
  smallTextCurrentY: 0,
  smallTextFinalY: 0,
  smallTextTransformApplied: false,
  stickyEndY: 0,
  collapseDistance: 0,
  currentScrollY: 0,
  lowerSentinelTop: 0,
  lowerShellRectTop: 0,
  lowerSectionEnteredViewport: false,
  visibleOrangeGapPx: 0,
  visibleOrangeGapSvh: ORANGE_TAIL_HEIGHT_SVH,
  visibleGapSampleColor: "rgb(218, 151, 103)",
  visibleGapIsOrange: true,
  lowerShellHasMarginTop: false,
  lowerShellHasPaddingTop: false,
  lowerSpacerExists: false,
  lowerShellBackground: "",
  lowerShellParentBackground: "",
  lowerShellHasGradient: false,
  lowerShellTransformForTailCollapse: false,
  abilityCardsTransparentHackActive: false,
  lowerSectionNormalFlow: true,
  gapPaintedBy: "data-orange-upper-tail",
  orangeTailRect: emptyDebugRect,
  orangeLowerSeamRect: emptyDebugRect,
  lowerFirstVisualRect: emptyDebugRect,
  scrollHintFound: false,
  scrollHintHidden: false,
  scrollHintText: "",
  scrollHintRect: emptyDebugRect,
  scrollHintHideReason: "notFound",
  lastHeroIdleResetAt: 0,
  heroIdleResetCount: 0,
  isHeroIdleClean: true,
} satisfies BridgeDebugState;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function clampRange(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function remap(
  value: number,
  inputStart: number,
  inputEnd: number,
  outputStart = 0,
  outputEnd = 1,
) {
  const progress = clamp((value - inputStart) / (inputEnd - inputStart));
  return lerp(outputStart, outputEnd, progress);
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function round(value: number, precision = 3) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function rectFromDomRect(rect: DOMRect): RectState {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function isUsableRect(rect: RectState | null): rect is RectState {
  return Boolean(rect && rect.width > 20 && rect.height > 20);
}

function isVisibleCaptureRect(rect: RectState | null, viewportHeight: number) {
  return Boolean(
    rect &&
      rect.top > -rect.height * 0.5 &&
      rect.top < viewportHeight * 1.1 &&
      rect.left > -rect.width * 0.5,
  );
}

function uniqueElements(elements: Array<HTMLElement | null | undefined>) {
  return Array.from(new Set(elements.filter(Boolean))) as HTMLElement[];
}

function normalizeText(value: null | string | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
    };
  }, []);

  return prefersReducedMotion;
}

export function HeroToSecondTransitionZone() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickySegmentRef = useRef<HTMLDivElement | null>(null);
  const orangeUpperContentRef = useRef<HTMLElement | null>(null);
  const frozenHeroRectRef = useRef<RectState>(fallbackHeroRect);
  const frozenHeroRectSourceRef = useRef("fallback");
  const handoffCapturedRef = useRef(false);
  const heroSourceBoundRef = useRef(false);
  const heroSourceElementsRef = useRef<HTMLElement[]>([]);
  const heroScrollHintRef = useRef<HTMLElement | null>(null);
  const heroSourceOriginalStyleRef = useRef<
    Array<{
      element: HTMLElement;
      opacity: string;
      visibility: string;
      pointerEvents: string;
      willChange: string;
    }>
  >([]);
  const heroScrollHintOriginalStyleRef = useRef<{
    opacity: string;
    visibility: string;
    pointerEvents: string;
    willChange: string;
  } | null>(null);
  const transitionProgressRef = useRef(0);
  const expandProgressRef = useRef(0);
  const bridgeActiveRef = useRef(false);
  const lowerCollapseProgressRef = useRef(0);
  const orangeTailCollapseProgressRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const smallTextAnchorScrollYRef = useRef<number | null>(null);
  const smallTextScrollDeltaFromAnchorRef = useRef(0);
  const smallTextTargetYRef = useRef(0);
  const smallTextCurrentYRef = useRef(0);
  const smallTextFinalYRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastHeroIdleResetAtRef = useRef(0);
  const heroIdleResetCountRef = useRef(0);
  const wasHeroIdleRef = useRef(true);
  const scrollHintHiddenRef = useRef(false);
  const scrollHintHideReasonRef = useRef("notFound");
  const typographyTriggerTimerRef = useRef<number | null>(null);
  const typographyCompleteTimerRef = useRef<number | null>(null);
  const typographySessionRef = useRef(0);
  const typographyStateRef = useRef<TypographyState>("idle");
  const [typographyState, setTypographyState] =
    useState<TypographyState>("idle");
  const [typographyRunId, setTypographyRunId] = useState(0);
  const typographyRunIdRef = useRef(0);
  const [bridgeState, setBridgeState] =
    useState<BridgeDebugState>(initialDebugState);
  const prefersReducedMotion = usePrefersReducedMotion();

  const setTypographyStateSafe = (next: TypographyState) => {
    typographyStateRef.current = next;
    setTypographyState(next);
  };

  const clearTypographyTimers = () => {
    if (typographyTriggerTimerRef.current !== null) {
      window.clearTimeout(typographyTriggerTimerRef.current);
      typographyTriggerTimerRef.current = null;
    }

    if (typographyCompleteTimerRef.current !== null) {
      window.clearTimeout(typographyCompleteTimerRef.current);
      typographyCompleteTimerRef.current = null;
    }
  };

  const resetTypography = () => {
    clearTypographyTimers();

    if (typographyStateRef.current !== "idle") {
      setTypographyStateSafe("idle");
    }
  };

  const resetBridgeVisualsAtHeroIdle = (timestamp: number) => {
    typographySessionRef.current += 1;
    resetTypography();
    handoffCapturedRef.current = false;
    smallTextAnchorScrollYRef.current = null;
    smallTextScrollDeltaFromAnchorRef.current = 0;
    smallTextTargetYRef.current = 0;
    smallTextCurrentYRef.current = 0;
    smallTextFinalYRef.current = 0;
    lowerCollapseProgressRef.current = 0;
    orangeTailCollapseProgressRef.current = 0;
    lastHeroIdleResetAtRef.current = timestamp;
  };

  const triggerTypography = () => {
    clearTypographyTimers();
    typographyRunIdRef.current += 1;
    setTypographyRunId(typographyRunIdRef.current);
    setTypographyStateSafe(prefersReducedMotion ? "played" : "playing");

    if (prefersReducedMotion) {
      return;
    }

    typographyCompleteTimerRef.current = window.setTimeout(() => {
      typographyCompleteTimerRef.current = null;

      if (
        transitionProgressRef.current >= EXPAND_COMPLETE_THRESHOLD &&
        expandProgressRef.current >= 0.999
      ) {
        setTypographyStateSafe("played");
      }
    }, TYPOGRAPHY_REVEAL_TOTAL_MS);
  };

  const scheduleTypographyTrigger = () => {
    if (
      typographyStateRef.current !== "idle" ||
      typographyTriggerTimerRef.current !== null
    ) {
      return;
    }

    const sessionId = typographySessionRef.current + 1;
    typographySessionRef.current = sessionId;
    setTypographyStateSafe("pending");

    typographyTriggerTimerRef.current = window.setTimeout(() => {
      typographyTriggerTimerRef.current = null;

      if (
        typographySessionRef.current !== sessionId ||
        transitionProgressRef.current < EXPAND_COMPLETE_THRESHOLD ||
        expandProgressRef.current < 0.999
      ) {
        setTypographyStateSafe("idle");
        return;
      }

      triggerTypography();
    }, TYPOGRAPHY_TRIGGER_DELAY_MS);
  };

  useEffect(() => {
    const section = sectionRef.current;
    const stickySegment = stickySegmentRef.current;
    const orangeUpperContent = orangeUpperContentRef.current;

    if (!section || !stickySegment || !orangeUpperContent) {
      return;
    }

    const heroVisual = document.querySelector<HTMLElement>(HERO_VISUAL_SELECTOR);
    const root = document.documentElement;
    const heroSection =
      document.querySelector<HTMLElement>("#home") ??
      heroVisual?.closest<HTMLElement>("section") ??
      document.querySelector<HTMLElement>("main > section");
    const lowerShell = document.querySelector<HTMLElement>(
      '[data-ability-lower-shell="true"]',
    );
    const lowerCollapseSentinel = document.querySelector<HTMLElement>(
      '[data-ability-lower-collapse-sentinel="true"]',
    );
    const lowerSpacer = document.querySelector<HTMLElement>(
      '[data-ability-lower-spacer="true"]',
    );
    const orangeTail = document.querySelector<HTMLElement>(
      '[data-orange-upper-tail="true"]',
    );
    const orangeLowerSeam = document.querySelector<HTMLElement>(
      '[data-orange-lower-seam="true"]',
    );

    const collectHeroScrollHint = () => {
      if (!heroSection) {
        return null;
      }

      const candidates = Array.from(
        heroSection.querySelectorAll<HTMLElement>("*"),
      )
        .filter((element) => {
          const text = normalizeText(element.innerText || element.textContent);

          if (text !== "SCROLL DOWN") {
            return false;
          }

          if (element.closest("header")) {
            return false;
          }

          const rect = element.getBoundingClientRect();
          return rect.width > 1 && rect.height > 1;
        })
        .sort((left, right) => {
          const leftPriority =
            left.getAttribute("data-debug-name") === "hero-scroll-down" ? 0 : 1;
          const rightPriority =
            right.getAttribute("data-debug-name") === "hero-scroll-down" ? 0 : 1;

          if (leftPriority !== rightPriority) {
            return leftPriority - rightPriority;
          }

          const leftRect = left.getBoundingClientRect();
          const rightRect = right.getBoundingClientRect();
          const leftArea = leftRect.width * leftRect.height;
          const rightArea = rightRect.width * rightRect.height;

          return leftArea - rightArea;
        });

      return candidates[0] ?? null;
    };

    const collectHeroSourceElements = () => {
      const outsideBridgeHeroImages = Array.from(
        document.querySelectorAll<HTMLImageElement>(
          'img[src*="/assets/hero/hero-center-visual.jpg"]',
        ),
      )
        .filter((image) => !section.contains(image))
        .map((image) => {
          const wrapper = image.closest<HTMLElement>(HERO_VISUAL_SELECTOR);
          return wrapper ?? image;
        });

      return uniqueElements([
        heroVisual && !section.contains(heroVisual) ? heroVisual : null,
        ...outsideBridgeHeroImages,
      ]);
    };

    heroSourceElementsRef.current = collectHeroSourceElements();
    heroScrollHintRef.current = collectHeroScrollHint();
    heroSourceOriginalStyleRef.current = heroSourceElementsRef.current.map(
      (element) => ({
        element,
        opacity: element.style.opacity,
        visibility: element.style.visibility,
        pointerEvents: element.style.pointerEvents,
        willChange: element.style.willChange,
      }),
    );
    heroScrollHintOriginalStyleRef.current = heroScrollHintRef.current
      ? {
          opacity: heroScrollHintRef.current.style.opacity,
          visibility: heroScrollHintRef.current.style.visibility,
          pointerEvents: heroScrollHintRef.current.style.pointerEvents,
          willChange: heroScrollHintRef.current.style.willChange,
        }
      : null;
    scrollHintHiddenRef.current = false;
    scrollHintHideReasonRef.current = heroScrollHintRef.current
      ? "heroIdle"
      : "notFound";
    heroSourceBoundRef.current = heroSourceElementsRef.current.length > 0;

    const readHeroRect = () => {
      if (!heroVisual) {
        return null;
      }

      const rect = rectFromDomRect(heroVisual.getBoundingClientRect());
      return isUsableRect(rect) ? rect : null;
    };

    const initialLiveHeroRect = readHeroRect();
    const hasInitialLiveHeroRect = isVisibleCaptureRect(
      initialLiveHeroRect,
      window.innerHeight,
    );
    frozenHeroRectRef.current = hasInitialLiveHeroRect && initialLiveHeroRect
      ? initialLiveHeroRect
      : fallbackHeroRect;
    frozenHeroRectSourceRef.current = hasInitialLiveHeroRect
      ? "idleLiveHero"
      : "fallback";
    lastScrollYRef.current = window.scrollY;

    const applyHeroSourceVisibility = (visible: boolean) => {
      heroSourceOriginalStyleRef.current.forEach((entry) => {
        if (visible) {
          entry.element.style.opacity = entry.opacity;
          entry.element.style.visibility = entry.visibility;
          entry.element.style.pointerEvents = entry.pointerEvents;
          entry.element.style.willChange = entry.willChange;
          return;
        }

        entry.element.style.opacity = "0";
        entry.element.style.visibility = "hidden";
        entry.element.style.pointerEvents = "none";
        entry.element.style.willChange = "opacity";
      });
    };

    const syncHeroScrollHintRef = () => {
      if (heroScrollHintRef.current?.isConnected) {
        return heroScrollHintRef.current;
      }

      const nextHint = collectHeroScrollHint();
      heroScrollHintRef.current = nextHint;

      if (nextHint) {
        heroScrollHintOriginalStyleRef.current = {
          opacity: nextHint.style.opacity,
          visibility: nextHint.style.visibility,
          pointerEvents: nextHint.style.pointerEvents,
          willChange: nextHint.style.willChange,
        };
      } else {
        heroScrollHintOriginalStyleRef.current = null;
      }

      return nextHint;
    };

    const readVisibleHeroSourceCount = () => {
      return heroSourceElementsRef.current.reduce((count, element) => {
        const style = window.getComputedStyle(element);
        const visible =
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          Number(style.opacity || 1) > 0.01;

        return count + (visible ? 1 : 0);
      }, 0);
    };

    const applySourceVisibility = (visible: boolean) => {
      applyHeroSourceVisibility(visible);
    };

    const applyHeroScrollHintVisibility = (visible: boolean) => {
      const element = syncHeroScrollHintRef();
      const original = heroScrollHintOriginalStyleRef.current;

      if (!element || !original) {
        scrollHintHiddenRef.current = false;
        scrollHintHideReasonRef.current = "notFound";
        return;
      }

      if (visible) {
        if (original.opacity) {
          element.style.setProperty("opacity", original.opacity);
        } else {
          element.style.removeProperty("opacity");
        }

        if (original.visibility) {
          element.style.setProperty("visibility", original.visibility);
        } else {
          element.style.removeProperty("visibility");
        }

        if (original.pointerEvents) {
          element.style.setProperty("pointer-events", original.pointerEvents);
        } else {
          element.style.removeProperty("pointer-events");
        }

        if (original.willChange) {
          element.style.setProperty("will-change", original.willChange);
        } else {
          element.style.removeProperty("will-change");
        }

        scrollHintHiddenRef.current = false;
        scrollHintHideReasonRef.current = "restored";
        return;
      }

      element.style.setProperty("opacity", "0", "important");
      element.style.setProperty("visibility", "hidden", "important");
      element.style.setProperty("pointer-events", "none", "important");
      element.style.setProperty("will-change", "opacity");
      scrollHintHiddenRef.current = true;
      scrollHintHideReasonRef.current = "transitionActive";
    };

    const applyOrangeTailCollapse = (progress: number) => {
      const roundedProgress = round(progress);

      root.style.setProperty(
        "--orange-tail-collapse-progress",
        String(roundedProgress),
      );
      orangeUpperContent.style.setProperty(
        "--orange-tail-collapse-progress",
        String(roundedProgress),
      );
    };

    const resetOrangeTailCollapse = () => {
      root.style.setProperty("--orange-tail-collapse-progress", "0");
      orangeUpperContent.style.setProperty("--orange-tail-collapse-progress", "0");
    };

    const update = () => {
      const now = performance.now();
      const stickyRect = stickySegment.getBoundingClientRect();
      const orangeUpperContentRect = orangeUpperContent.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const transitionScrollable = Math.max(
        1,
        stickySegment.offsetHeight - viewportHeight,
      );
      const transitionProgress = clamp(-stickyRect.top / transitionScrollable);
      const isHeroIdle = transitionProgress <= HERO_IDLE_EPS;
      const handoffActive = transitionProgress > HANDOFF_THRESHOLD;
      const shouldHideScrollHint =
        transitionProgress > HANDOFF_THRESHOLD && transitionProgress < 1;
      const bridgeActive =
        handoffActive &&
        stickyRect.bottom > viewportHeight * 0.04 &&
        stickyRect.top < viewportHeight;
      const flipProgress = prefersReducedMotion
        ? transitionProgress >= FLIP_END
          ? 1
          : 0
        : easeInOutCubic(remap(transitionProgress, FLIP_START, FLIP_END));
      const expandProgress = prefersReducedMotion
        ? transitionProgress >= EXPAND_COMPLETE_THRESHOLD
          ? 1
          : 0
        : easeInOutCubic(
            remap(
              transitionProgress,
              EXPAND_START,
              EXPAND_COMPLETE_THRESHOLD,
            ),
          );
      const liveHeroRect = readHeroRect();

      if (!handoffActive) {
        handoffCapturedRef.current = false;

        if (
          isVisibleCaptureRect(liveHeroRect, viewportHeight) &&
          liveHeroRect
        ) {
          frozenHeroRectRef.current = liveHeroRect;
          frozenHeroRectSourceRef.current = "idleLiveHero";
        } else if (!isUsableRect(frozenHeroRectRef.current)) {
          frozenHeroRectRef.current = fallbackHeroRect;
          frozenHeroRectSourceRef.current = "fallback";
        }
      } else if (!handoffCapturedRef.current) {
        if (
          isVisibleCaptureRect(liveHeroRect, viewportHeight) &&
          liveHeroRect
        ) {
          frozenHeroRectRef.current = liveHeroRect;
          frozenHeroRectSourceRef.current = "handoffFreeze";
        }

        handoffCapturedRef.current = true;
      }

      if (isHeroIdle) {
        if (!wasHeroIdleRef.current) {
          heroIdleResetCountRef.current += 1;
          resetBridgeVisualsAtHeroIdle(now);
          resetOrangeTailCollapse();
        }

        wasHeroIdleRef.current = true;
      } else {
        wasHeroIdleRef.current = false;
      }

      const stickyEndY =
        stickySegment.offsetTop + stickySegment.offsetHeight - viewportHeight;
      const collapseDistance =
        viewportHeight * ORANGE_TAIL_COLLAPSE_DISTANCE_VH;
      const lowerSentinelTop = lowerCollapseSentinel
        ? lowerCollapseSentinel.getBoundingClientRect().top
        : Number.POSITIVE_INFINITY;
      const lowerShellRect = lowerShell?.getBoundingClientRect() ?? null;
      const lowerSectionEnteredViewport = lowerSentinelTop <= viewportHeight;
      const lowerCollapseProgress = prefersReducedMotion
        ? lowerSectionEnteredViewport
          ? 1
          : 0
        : clamp(
            (viewportHeight - lowerSentinelTop) /
              Math.max(1, collapseDistance),
          );
      const lowerShellStyle = lowerShell
        ? window.getComputedStyle(lowerShell)
        : null;
      const lowerShellParentStyle =
        lowerShell?.parentElement
          ? window.getComputedStyle(lowerShell.parentElement)
          : null;
      const lowerFirstVisual = lowerShell?.firstElementChild as HTMLElement | null;
      const lowerFirstVisualStyle = lowerFirstVisual
        ? window.getComputedStyle(lowerFirstVisual)
        : null;
      const lowerFirstVisualWrapper =
        lowerFirstVisual?.firstElementChild as HTMLElement | null;
      const lowerFirstVisualWrapperStyle = lowerFirstVisualWrapper
        ? window.getComputedStyle(lowerFirstVisualWrapper)
        : null;
      const lowerShellMarginTopPx = lowerShellStyle
        ? Number.parseFloat(lowerShellStyle.marginTop || "0") || 0
        : 0;
      const lowerShellPaddingTopPx = lowerShellStyle
        ? Number.parseFloat(lowerShellStyle.paddingTop || "0") || 0
        : 0;
      const lowerShellHasGradient = Boolean(
        lowerShellStyle?.backgroundImage &&
          lowerShellStyle.backgroundImage !== "none",
      );
      const lowerShellTransformForTailCollapse = Boolean(
        lowerShellStyle &&
          lowerShellStyle.transform &&
          lowerShellStyle.transform !== "none",
      );
      const abilityCardsTransparentHackActive = Boolean(
        lowerFirstVisualStyle &&
          lowerFirstVisualWrapperStyle &&
          lowerFirstVisualStyle.backgroundColor === "rgba(0, 0, 0, 0)" &&
          lowerFirstVisualWrapperStyle.backgroundColor === "rgba(0, 0, 0, 0)",
      );
      const orangeTailRect = orangeTail?.getBoundingClientRect() ?? null;
      const orangeLowerSeamRect =
        orangeLowerSeam?.getBoundingClientRect() ?? null;
      const lowerFirstVisualRect = lowerFirstVisual?.getBoundingClientRect() ?? null;
      const fullTailPx = viewportHeight * (ORANGE_TAIL_HEIGHT_SVH / 100);
      const minTailPx = viewportHeight * (FINAL_ORANGE_GAP_SVH / 100);
      const seamProbeTop =
        orangeLowerSeamRect !== null
          ? orangeLowerSeamRect.top
          : Number.POSITIVE_INFINITY;
      const orangeTailCollapseProgress = prefersReducedMotion
        ? clamp((viewportHeight - seamProbeTop) / Math.max(1, viewportHeight))
        : clamp((viewportHeight - seamProbeTop) / Math.max(1, viewportHeight));
      const orangeTailHeightPx = lerp(
        fullTailPx,
        minTailPx,
        orangeTailCollapseProgress,
      );
      const orangeTailHeightSvh =
        (orangeTailHeightPx / Math.max(1, viewportHeight)) * 100;
      const visibleOrangeGapPx = orangeTailHeightPx;
      const visibleOrangeGapSvh = orangeTailHeightSvh;
      const gapPaintedBy = "data-orange-upper-tail";
      const visibleGapSampleColor = "rgb(218, 151, 103)";
      const visibleGapIsOrange = true;
      const lowerSectionNormalFlow =
        !lowerShellTransformForTailCollapse &&
        !lowerShellHasGradient &&
        !abilityCardsTransparentHackActive;
      const fixedSeamStable =
        orangeLowerSeamRect !== null
          ? Math.abs(orangeLowerSeamRect.height - FIXED_SEAM_PX) <= 1
          : false;
      const scrollDelta = scrollY - lastScrollYRef.current;

      const cardStartRect = frozenHeroRectRef.current;
      const cardCurrentRect = {
        left: lerp(cardStartRect.left, 0, expandProgress),
        top: lerp(cardStartRect.top, 0, expandProgress),
        width: lerp(cardStartRect.width, viewportWidth, expandProgress),
        height: lerp(cardStartRect.height, viewportHeight, expandProgress),
      };

      const frontFadeProgress = remap(flipProgress, 0.45, 0.6);
      const frontImageOpacity =
        !handoffActive || transitionProgress >= EXPAND_COMPLETE_THRESHOLD
          ? 0
          : clamp(1 - frontFadeProgress);
      const orangeOpacity = isHeroIdle
        ? 0
        : expandProgress >= 0.999 &&
            transitionProgress >= EXPAND_COMPLETE_THRESHOLD
          ? 1
          : 0;
      const bridgeCardOpacity = handoffActive ? 1 : 0;
      const heroSourceOpacity = handoffActive ? 0 : 1;
      const expandComplete =
        expandProgress >= 0.999 &&
        transitionProgress >= EXPAND_COMPLETE_THRESHOLD;

      if (
        (typographyStateRef.current === "playing" ||
          typographyStateRef.current === "played") &&
        smallTextAnchorScrollYRef.current === null
      ) {
        smallTextAnchorScrollYRef.current = scrollY;
      }

      if (smallTextAnchorScrollYRef.current !== null && !isHeroIdle) {
        if (
          typographyStateRef.current === "playing" ||
          typographyStateRef.current === "played"
        ) {
          const anchorY = smallTextAnchorScrollYRef.current;
          const deltaFromAnchor = scrollY - anchorY;
          const targetY = clampRange(
            -deltaFromAnchor * SMALL_TEXT_SCROLL_FACTOR,
            -SMALL_TEXT_MAX_OFFSET,
            SMALL_TEXT_MAX_OFFSET,
          );

          smallTextScrollDeltaFromAnchorRef.current = deltaFromAnchor;
          smallTextTargetYRef.current = targetY;
          smallTextCurrentYRef.current +=
            (targetY - smallTextCurrentYRef.current) *
            (prefersReducedMotion ? 1 : SMALL_TEXT_SMOOTH);
        }
      } else if (isHeroIdle) {
        smallTextAnchorScrollYRef.current = null;
        smallTextScrollDeltaFromAnchorRef.current = 0;
        smallTextTargetYRef.current = 0;
        smallTextCurrentYRef.current = 0;
      }

      if (Math.abs(smallTextCurrentYRef.current) < 0.02 && isHeroIdle) {
        smallTextCurrentYRef.current = 0;
      }

      smallTextFinalYRef.current = smallTextCurrentYRef.current;

      transitionProgressRef.current = transitionProgress;
      expandProgressRef.current = expandProgress;
      bridgeActiveRef.current = bridgeActive;
      lastScrollYRef.current = scrollY;
      lowerCollapseProgressRef.current = lowerCollapseProgress;
      orangeTailCollapseProgressRef.current = orangeTailCollapseProgress;

      if (isHeroIdle) {
        resetOrangeTailCollapse();
      } else {
        applyOrangeTailCollapse(orangeTailCollapseProgress);
      }

      applySourceVisibility(!handoffActive);
      applyHeroScrollHintVisibility(!shouldHideScrollHint);

      if (!shouldHideScrollHint && heroScrollHintRef.current?.isConnected) {
        scrollHintHideReasonRef.current = isHeroIdle ? "heroIdle" : "restored";
      }

      if (expandComplete) {
        scheduleTypographyTrigger();
      } else if (isHeroIdle) {
        typographySessionRef.current += 1;
        resetTypography();
      }

      const typographyVisible =
        (typographyStateRef.current === "playing" ||
          typographyStateRef.current === "played") &&
        !isHeroIdle;
      const visibleHeroSourceCount = readVisibleHeroSourceCount();
      const visibleBridgeImageCount =
        bridgeCardOpacity > 0.01 && frontImageOpacity > 0.01 ? 1 : 0;
      const scrollHintElement = syncHeroScrollHintRef();
      const scrollHintRect = scrollHintElement
        ? rectFromDomRect(scrollHintElement.getBoundingClientRect())
        : emptyDebugRect;
      const scrollHintText = scrollHintElement
        ? normalizeText(scrollHintElement.innerText || scrollHintElement.textContent)
        : "";
      const isHeroIdleClean =
        isHeroIdle &&
        bridgeCardOpacity === 0 &&
        orangeOpacity === 0 &&
        frontImageOpacity === 0 &&
        heroSourceOpacity === 1 &&
        typographyStateRef.current === "idle" &&
        orangeTailCollapseProgress === 0 &&
        visibleHeroSourceCount === heroSourceElementsRef.current.length &&
        visibleBridgeImageCount === 0 &&
        Math.abs(smallTextCurrentYRef.current) < 0.02 &&
        smallTextAnchorScrollYRef.current === null;

      setBridgeState({
        bridgeVersion: BRIDGE_VERSION,
        transitionProgress: round(transitionProgress),
        legacyBridgeProgress: round(transitionProgress),
        lowerCollapseProgress: round(lowerCollapseProgress),
        orangeTailCollapseProgress: round(orangeTailCollapseProgress),
        flipProgress: round(flipProgress),
        expandProgress: round(expandProgress),
        expandComplete,
        typographyState: typographyStateRef.current,
        typographyRunId: typographyRunIdRef.current,
        typographyTriggerPending: typographyTriggerTimerRef.current !== null,
        bigLine1Reveal: "LTR",
        bigLine2Reveal: "RTL",
        bigLine3Reveal: "LTR",
        smallTextRevealStartedWithThirdLine: true,
        smallTextRevealDurationMatchesThirdLine:
          TYPOGRAPHY_REVEAL_DURATION_MS === 660,
        heroSourceBound: heroSourceBoundRef.current,
        visibleHeroSourceCount,
        visibleBridgeImageCount,
        heroSourceOpacity: round(heroSourceOpacity),
        bridgeCardOpacity: round(bridgeCardOpacity),
        frontImageOpacity: round(frontImageOpacity),
        orangeOpacity: round(orangeOpacity),
        transitionIsolationActive:
          transitionProgress < EXPAND_COMPLETE_THRESHOLD &&
          transitionProgress > HANDOFF_THRESHOLD,
        typographyVisible,
        cardStartRectSource: frozenHeroRectSourceRef.current,
        liveHeroRect: {
          left: round((liveHeroRect ?? emptyDebugRect).left, 1),
          top: round((liveHeroRect ?? emptyDebugRect).top, 1),
          width: round((liveHeroRect ?? emptyDebugRect).width, 1),
          height: round((liveHeroRect ?? emptyDebugRect).height, 1),
        },
        frozenCardStartRect: {
          left: round(cardStartRect.left, 1),
          top: round(cardStartRect.top, 1),
          width: round(cardStartRect.width, 1),
          height: round(cardStartRect.height, 1),
        },
        cardCurrentRect: {
          left: round(cardCurrentRect.left, 1),
          top: round(cardCurrentRect.top, 1),
          width: round(cardCurrentRect.width, 1),
          height: round(cardCurrentRect.height, 1),
        },
        isBridgeActive: bridgeActive,
        topBreathingSvh: TOP_BREATHING_SVH,
        orangeTailHeightSvh: round(orangeTailHeightSvh, 2),
        orangeTailHeightPx: round(orangeTailHeightPx, 1),
        finalOrangeGapSvh: FINAL_ORANGE_GAP_SVH,
        fixedSeamPx: FIXED_SEAM_PX,
        fixedSeamStable,
        orangeContentTop: round(orangeUpperContentRect.top, 1),
        smallTextAnchorScrollY: smallTextAnchorScrollYRef.current
          ? round(smallTextAnchorScrollYRef.current, 1)
          : null,
        smallTextScrollDeltaFromAnchor: round(
          smallTextScrollDeltaFromAnchorRef.current,
          1,
        ),
        smallTextTargetY: round(smallTextTargetYRef.current),
        smallTextCurrentY: round(smallTextCurrentYRef.current),
        smallTextFinalY: round(smallTextFinalYRef.current),
        smallTextTransformApplied:
          transitionProgress >= EXPAND_COMPLETE_THRESHOLD &&
          Boolean(smallTextAnchorScrollYRef.current),
        stickyEndY: round(stickyEndY, 1),
        collapseDistance: round(collapseDistance, 1),
        currentScrollY: round(scrollY, 1),
        lowerShellRectTop: lowerShellRect
          ? round(lowerShellRect.top, 1)
          : 0,
        lowerSentinelTop: Number.isFinite(lowerSentinelTop)
          ? round(lowerSentinelTop, 1)
          : 0,
        lowerSectionEnteredViewport,
        lowerCollapseSource: lowerCollapseSentinel ? "sentinel" : "naturalTop",
        visibleOrangeGapPx: round(visibleOrangeGapPx, 1),
        visibleOrangeGapSvh: round(visibleOrangeGapSvh, 2),
        visibleGapSampleColor,
        visibleGapIsOrange,
        lowerShellHasMarginTop: lowerShellMarginTopPx > 0.5,
        lowerShellHasPaddingTop: lowerShellPaddingTopPx > 0.5,
        lowerSpacerExists: Boolean(lowerSpacer),
        lowerShellBackground:
          lowerShellStyle?.backgroundImage || lowerShellStyle?.backgroundColor || "",
        lowerShellParentBackground:
          lowerShellParentStyle?.backgroundColor || "",
        lowerShellHasGradient,
        lowerShellTransformForTailCollapse,
        abilityCardsTransparentHackActive,
        lowerSectionNormalFlow,
        gapPaintedBy,
        orangeTailRect: orangeTailRect
          ? {
              left: round(orangeTailRect.left, 1),
              top: round(orangeTailRect.top, 1),
              width: round(orangeTailRect.width, 1),
              height: round(orangeTailRect.height, 1),
            }
          : emptyDebugRect,
        orangeLowerSeamRect: orangeLowerSeamRect
          ? {
              left: round(orangeLowerSeamRect.left, 1),
              top: round(orangeLowerSeamRect.top, 1),
              width: round(orangeLowerSeamRect.width, 1),
              height: round(orangeLowerSeamRect.height, 1),
            }
          : emptyDebugRect,
        lowerFirstVisualRect: lowerFirstVisualRect
          ? {
              left: round(lowerFirstVisualRect.left, 1),
              top: round(lowerFirstVisualRect.top, 1),
              width: round(lowerFirstVisualRect.width, 1),
              height: round(lowerFirstVisualRect.height, 1),
            }
          : emptyDebugRect,
        scrollHintFound: Boolean(scrollHintElement),
        scrollHintHidden: scrollHintHiddenRef.current,
        scrollHintText,
        scrollHintRect: {
          left: round(scrollHintRect.left, 1),
          top: round(scrollHintRect.top, 1),
          width: round(scrollHintRect.width, 1),
          height: round(scrollHintRect.height, 1),
        },
        scrollHintHideReason: scrollHintHideReasonRef.current,
        lastHeroIdleResetAt: round(lastHeroIdleResetAtRef.current, 1),
        heroIdleResetCount: heroIdleResetCountRef.current,
        isHeroIdleClean,
      });

      frameRef.current = window.requestAnimationFrame(update);
    };

    frameRef.current = window.requestAnimationFrame(update);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      clearTypographyTimers();
      resetOrangeTailCollapse();
      applySourceVisibility(true);
      applyHeroScrollHintVisibility(true);
    };
  }, [prefersReducedMotion]);

  const cardStyle = {
    left: `${bridgeState.cardCurrentRect.left}px`,
    top: `${bridgeState.cardCurrentRect.top}px`,
    width: `${bridgeState.cardCurrentRect.width}px`,
    height: `${bridgeState.cardCurrentRect.height}px`,
    opacity: bridgeState.bridgeCardOpacity,
    borderRadius: `${lerp(8, 0, bridgeState.expandProgress)}px`,
    pointerEvents: "none",
    transform: "translate3d(0, 0, 0)",
  } satisfies CSSProperties;
  const rotationY = bridgeState.flipProgress * 180;
  const transitionIsolationActive =
    !bridgeState.expandComplete &&
    bridgeState.transitionProgress > HANDOFF_THRESHOLD;
  const viewportWidth =
    typeof window === "undefined" ? 1440 : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined" ? 900 : window.innerHeight;
  const cardLeft = Math.max(
    0,
    Math.min(viewportWidth, bridgeState.cardCurrentRect.left),
  );
  const cardTop = Math.max(
    0,
    Math.min(viewportHeight, bridgeState.cardCurrentRect.top),
  );
  const cardRight = Math.max(
    cardLeft,
    Math.min(
      viewportWidth,
      bridgeState.cardCurrentRect.left + bridgeState.cardCurrentRect.width,
    ),
  );
  const cardBottom = Math.max(
    cardTop,
    Math.min(
      viewportHeight,
      bridgeState.cardCurrentRect.top + bridgeState.cardCurrentRect.height,
    ),
  );
  const contentVisibleTop = Math.max(
    0,
    Math.min(viewportHeight, bridgeState.orangeContentTop),
  );
  const typographyCanvasScale =
    typeof window === "undefined"
      ? 1
      : Math.min(
          window.innerWidth / DESIGN_WIDTH,
          window.innerHeight / DESIGN_HEIGHT,
        );
  const typographyLayerClassName = [
    "bridge-typography-canvas",
    typographyState === "playing" || typographyState === "played"
      ? "is-intro-played"
      : "",
    prefersReducedMotion ? "is-intro-reduced-motion" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={sectionRef}
      aria-label="Hero to ability intro bridge"
      data-bridge-version={BRIDGE_VERSION}
      data-hero-intro-bridge="true"
      style={{
        marginTop: `-${BRIDGE_OVERLAP_SVH}svh`,
        pointerEvents: "none",
      }}
      className="relative left-1/2 right-1/2 z-20 -ml-[50vw] -mr-[50vw] w-screen overflow-visible"
    >
      <div
        ref={stickySegmentRef}
        data-bridge-transition-segment="true"
        style={{
          height: `${TRANSITION_SEGMENT_HEIGHT_SVH}svh`,
          pointerEvents: "none",
        }}
        className="relative w-screen"
      >
        <div
          data-bridge-sticky-stage="true"
          className="sticky top-0 h-[100svh] w-screen overflow-hidden"
          style={{
            pointerEvents: "none",
            zIndex: transitionIsolationActive ? 3 : 0,
          }}
        >
          <div
            data-bridge-orange-layer="true"
            className="absolute inset-0"
            style={{
              backgroundColor: ORANGE,
              opacity: bridgeState.orangeOpacity,
              pointerEvents: "none",
              willChange: "opacity",
            }}
          />

          <div
            data-bridge-card-layer="true"
            className="absolute"
            style={{
              ...cardStyle,
              pointerEvents: "none",
            }}
          >
            <div className="bridge-card-scene">
              <div
                className="bridge-card-inner"
                style={{
                  transform: `rotateY(${rotationY}deg) translateZ(0.1px)`,
                }}
              >
                <div
                  className="bridge-card-face bridge-card-front"
                  style={{
                    opacity: bridgeState.frontImageOpacity,
                  }}
                >
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                    src={HERO_VISUAL_SRC}
                  />
                </div>
                <div className="bridge-card-face bridge-card-back" />
              </div>
            </div>
          </div>

          {DEBUG ? (
            <div className="fixed right-4 top-4 z-[80] max-w-[340px] rounded bg-black/70 p-3 font-mono text-[11px] leading-relaxed text-white">
              <div>bridgeVersion: {bridgeState.bridgeVersion}</div>
              <div>transitionProgress: {bridgeState.transitionProgress}</div>
              <div>legacyBridgeProgress: {bridgeState.legacyBridgeProgress}</div>
              <div>
                lowerCollapseProgress: {bridgeState.lowerCollapseProgress}
              </div>
              <div>lowerCollapseSource: {bridgeState.lowerCollapseSource}</div>
              <div>
                orangeTailCollapseProgress:{" "}
                {bridgeState.orangeTailCollapseProgress}
              </div>
              <div>flipProgress: {bridgeState.flipProgress}</div>
              <div>expandProgress: {bridgeState.expandProgress}</div>
              <div>expandComplete: {String(bridgeState.expandComplete)}</div>
              <div>typographyState: {bridgeState.typographyState}</div>
              <div>typographyRunId: {bridgeState.typographyRunId}</div>
              <div>
                typographyTriggerPending:{" "}
                {String(bridgeState.typographyTriggerPending)}
              </div>
              <div>bigLine1Reveal: {bridgeState.bigLine1Reveal}</div>
              <div>bigLine2Reveal: {bridgeState.bigLine2Reveal}</div>
              <div>bigLine3Reveal: {bridgeState.bigLine3Reveal}</div>
              <div>
                smallTextRevealStartedWithThirdLine:{" "}
                {String(bridgeState.smallTextRevealStartedWithThirdLine)}
              </div>
              <div>
                smallTextRevealDurationMatchesThirdLine:{" "}
                {String(bridgeState.smallTextRevealDurationMatchesThirdLine)}
              </div>
              <div>heroSourceBound: {String(bridgeState.heroSourceBound)}</div>
              <div>
                visibleHeroSourceCount: {bridgeState.visibleHeroSourceCount}
              </div>
              <div>
                visibleBridgeImageCount: {bridgeState.visibleBridgeImageCount}
              </div>
              <div>heroSourceOpacity: {bridgeState.heroSourceOpacity}</div>
              <div>bridgeCardOpacity: {bridgeState.bridgeCardOpacity}</div>
              <div>frontImageOpacity: {bridgeState.frontImageOpacity}</div>
              <div>orangeOpacity: {bridgeState.orangeOpacity}</div>
              <div>
                transitionIsolationActive:{" "}
                {String(bridgeState.transitionIsolationActive)}
              </div>
              <div>cardStartRectSource: {bridgeState.cardStartRectSource}</div>
              <div>
                liveHeroRect: {bridgeState.liveHeroRect.left}/
                {bridgeState.liveHeroRect.top}/{bridgeState.liveHeroRect.width}/
                {bridgeState.liveHeroRect.height}
              </div>
              <div>
                frozenCardStartRect: {bridgeState.frozenCardStartRect.left}/
                {bridgeState.frozenCardStartRect.top}/
                {bridgeState.frozenCardStartRect.width}/
                {bridgeState.frozenCardStartRect.height}
              </div>
              <div>
                cardCurrentRect: {bridgeState.cardCurrentRect.left}/
                {bridgeState.cardCurrentRect.top}/
                {bridgeState.cardCurrentRect.width}/
                {bridgeState.cardCurrentRect.height}
              </div>
              <div>isBridgeActive: {String(bridgeState.isBridgeActive)}</div>
              <div>topBreathingSvh: {bridgeState.topBreathingSvh}</div>
              <div>orangeTailHeightSvh: {bridgeState.orangeTailHeightSvh}</div>
              <div>orangeTailHeightPx: {bridgeState.orangeTailHeightPx}</div>
              <div>finalOrangeGapSvh: {bridgeState.finalOrangeGapSvh}</div>
              <div>fixedSeamPx: {bridgeState.fixedSeamPx}</div>
              <div>fixedSeamStable: {String(bridgeState.fixedSeamStable)}</div>
              <div>orangeContentTop: {bridgeState.orangeContentTop}</div>
              <div>
                smallTextAnchorScrollY:{" "}
                {bridgeState.smallTextAnchorScrollY ?? "null"}
              </div>
              <div>
                smallTextScrollDeltaFromAnchor:{" "}
                {bridgeState.smallTextScrollDeltaFromAnchor}
              </div>
              <div>smallTextTargetY: {bridgeState.smallTextTargetY}</div>
              <div>smallTextCurrentY: {bridgeState.smallTextCurrentY}</div>
              <div>smallTextFinalY: {bridgeState.smallTextFinalY}</div>
              <div>
                smallTextTransformApplied:{" "}
                {String(bridgeState.smallTextTransformApplied)}
              </div>
              <div>stickyEndY: {bridgeState.stickyEndY}</div>
              <div>collapseDistance: {bridgeState.collapseDistance}</div>
              <div>currentScrollY: {bridgeState.currentScrollY}</div>
              <div>lowerSentinelTop: {bridgeState.lowerSentinelTop}</div>
              <div>lowerShellRectTop: {bridgeState.lowerShellRectTop}</div>
              <div>
                lowerSectionEnteredViewport:{" "}
                {String(bridgeState.lowerSectionEnteredViewport)}
              </div>
              <div>visibleOrangeGapPx: {bridgeState.visibleOrangeGapPx}</div>
              <div>visibleOrangeGapSvh: {bridgeState.visibleOrangeGapSvh}</div>
              <div>
                visibleGapSampleColor: {bridgeState.visibleGapSampleColor}
              </div>
              <div>
                visibleGapIsOrange: {String(bridgeState.visibleGapIsOrange)}
              </div>
              <div>
                lowerShellHasMarginTop:{" "}
                {String(bridgeState.lowerShellHasMarginTop)}
              </div>
              <div>
                lowerShellHasPaddingTop:{" "}
                {String(bridgeState.lowerShellHasPaddingTop)}
              </div>
              <div>lowerSpacerExists: {String(bridgeState.lowerSpacerExists)}</div>
              <div>lowerShellBackground: {bridgeState.lowerShellBackground}</div>
              <div>
                lowerShellParentBackground:{" "}
                {bridgeState.lowerShellParentBackground}
              </div>
              <div>
                lowerShellHasGradient:{" "}
                {String(bridgeState.lowerShellHasGradient)}
              </div>
              <div>
                lowerShellTransformForTailCollapse:{" "}
                {String(bridgeState.lowerShellTransformForTailCollapse)}
              </div>
              <div>
                abilityCardsTransparentHackActive:{" "}
                {String(bridgeState.abilityCardsTransparentHackActive)}
              </div>
              <div>
                lowerSectionNormalFlow:{" "}
                {String(bridgeState.lowerSectionNormalFlow)}
              </div>
              <div>gapPaintedBy: {bridgeState.gapPaintedBy}</div>
              <div>
                orangeTailRect: {bridgeState.orangeTailRect.left}/
                {bridgeState.orangeTailRect.top}/
                {bridgeState.orangeTailRect.width}/
                {bridgeState.orangeTailRect.height}
              </div>
              <div>
                orangeLowerSeamRect: {bridgeState.orangeLowerSeamRect.left}/
                {bridgeState.orangeLowerSeamRect.top}/
                {bridgeState.orangeLowerSeamRect.width}/
                {bridgeState.orangeLowerSeamRect.height}
              </div>
              <div>
                lowerFirstVisualRect: {bridgeState.lowerFirstVisualRect.left}/
                {bridgeState.lowerFirstVisualRect.top}/
                {bridgeState.lowerFirstVisualRect.width}/
                {bridgeState.lowerFirstVisualRect.height}
              </div>
              <div>scrollHintFound: {String(bridgeState.scrollHintFound)}</div>
              <div>
                scrollHintHidden: {String(bridgeState.scrollHintHidden)}
              </div>
              <div>scrollHintText: {bridgeState.scrollHintText || "null"}</div>
              <div>
                scrollHintRect: {bridgeState.scrollHintRect.left}/
                {bridgeState.scrollHintRect.top}/
                {bridgeState.scrollHintRect.width}/
                {bridgeState.scrollHintRect.height}
              </div>
              <div>
                scrollHintHideReason: {bridgeState.scrollHintHideReason}
              </div>
              <div>lastHeroIdleResetAt: {bridgeState.lastHeroIdleResetAt}</div>
              <div>heroIdleResetCount: {bridgeState.heroIdleResetCount}</div>
              <div>isHeroIdleClean: {String(bridgeState.isHeroIdleClean)}</div>
            </div>
          ) : null}
        </div>
      </div>

      <section
        ref={orangeUpperContentRef}
        data-orange-upper-content="true"
        data-content-visible={bridgeState.expandComplete ? "true" : "false"}
        aria-label="能力发生在场景里"
      >
        <div data-orange-upper-inner="true">
          <div
            data-orange-typography-canvas="true"
            data-bridge-typography-layer="true"
            className="absolute inset-0 text-white"
            style={{
              opacity: bridgeState.typographyVisible ? 1 : 0,
              transition: prefersReducedMotion
                ? "none"
                : "opacity 120ms linear",
              willChange: "opacity",
            }}
          >
            <div
              key={typographyRunId}
              className={typographyLayerClassName}
              style={{
                width: `${DESIGN_WIDTH}px`,
                height: `${DESIGN_HEIGHT}px`,
                top: `${TOP_BREATHING_SVH}svh`,
                transform: `translateX(-50%) scale(${typographyCanvasScale})`,
              }}
            >
              <div className="bridge-typography-scale-layer">
                <div className="bridge-title-line bridge-title-line-1 bridge-reveal-mask bridge-reveal-ltr bridge-delay-0">
                  <img
                    alt=""
                    className="bridge-title-svg"
                    draggable={false}
                    src="/assets/ability-intro/ability.svg"
                  />
                </div>
                <div className="bridge-title-line bridge-title-line-2 bridge-reveal-mask bridge-reveal-rtl bridge-delay-34">
                  <img
                    alt=""
                    className="bridge-title-svg"
                    draggable={false}
                    src="/assets/ability-intro/happen-in.svg"
                  />
                </div>
                <div className="bridge-title-line bridge-title-line-3 bridge-reveal-mask bridge-reveal-ltr bridge-delay-68">
                  <img
                    alt=""
                    className="bridge-title-svg"
                    draggable={false}
                    src="/assets/ability-intro/scenes.svg"
                  />
                </div>

                <div className="bridge-note bridge-left-note">
                  <div
                    className="bridge-note-motion bridge-note-motion-left"
                    style={{
                      transform: `translate3d(0, ${bridgeState.smallTextFinalY}px, 0)`,
                    }}
                  >
                    <div className="bridge-note-reveal bridge-reveal-mask bridge-reveal-rtl bridge-delay-68">
                      <span>NOT PROJECT LISTS</span>
                      <span>BUT CAPABILITY SLICES</span>
                    </div>
                  </div>
                </div>

                <div className="bridge-note bridge-right-note">
                  <div
                    className="bridge-note-motion bridge-note-motion-right"
                    style={{
                      transform: `translate3d(0, ${bridgeState.smallTextFinalY * 0.9}px, 0)`,
                    }}
                  >
                    <div className="bridge-note-reveal bridge-reveal-mask bridge-reveal-ltr bridge-delay-68">
                      <span>COMPLEX SCENES</span>
                      <span>CLEAR SYSTEMS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-orange-upper-tail="true" />
      </section>

      <div data-orange-lower-seam="true" aria-hidden="true" />

      <style>{`
        [data-orange-upper-content="true"] {
          position: relative;
          z-index: 1;
          margin-top: -100svh;
          background: ${ORANGE};
        }

        [data-orange-upper-content="true"][data-content-visible="false"] {
          background: transparent;
        }

        [data-orange-upper-content="true"][data-content-visible="false"]
          [data-orange-upper-inner="true"],
        [data-orange-upper-content="true"][data-content-visible="false"]
          [data-orange-upper-tail="true"] {
          visibility: hidden;
          opacity: 0;
          pointer-events: none;
        }

        [data-orange-upper-content="true"][data-content-visible="true"]
          [data-orange-upper-inner="true"],
        [data-orange-upper-content="true"][data-content-visible="true"]
          [data-orange-upper-tail="true"] {
          visibility: visible;
          opacity: 1;
          pointer-events: auto;
        }

        [data-orange-upper-inner="true"] {
          position: relative;
          min-height: 100svh;
          padding-top: ${TOP_BREATHING_SVH}svh;
          box-sizing: border-box;
          overflow: hidden;
          background: ${ORANGE};
          transition: opacity 80ms linear;
        }

        [data-orange-upper-tail="true"] {
          height: calc(
            ${ORANGE_TAIL_HEIGHT_SVH}svh -
              ${ORANGE_TAIL_COLLAPSE_RANGE_SVH}svh *
              var(--orange-tail-collapse-progress, 0)
          );
          background: ${ORANGE};
          flex-shrink: 0;
          transition: opacity 80ms linear;
          overflow-anchor: none;
        }

        [data-orange-lower-seam="true"] {
          height: ${FIXED_SEAM_PX}px;
          flex-shrink: 0;
          background: #ebeae4;
          overflow-anchor: none;
        }

        [data-ability-lower-shell="true"] {
          transform: none;
          background: transparent;
          will-change: auto;
        }

        .bridge-card-scene,
        .bridge-card-inner {
          width: 100%;
          height: 100%;
          border-radius: inherit;
        }

        .bridge-card-scene {
          perspective: 8000px;
        }

        .bridge-card-inner {
          position: relative;
          transform-style: preserve-3d;
          will-change: transform;
        }

        .bridge-card-face {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: inherit;
          backface-visibility: hidden;
          transform: translateZ(0.1px);
        }

        .bridge-card-front {
          background: #ebeae4;
          will-change: opacity;
        }

        .bridge-card-back {
          background: ${ORANGE};
          transform: rotateY(180deg) translateZ(0.1px);
        }

        .bridge-typography-canvas {
          position: absolute;
          left: 50%;
          top: 0;
          color: #ffffff;
          font-family: "Arial Black", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
          transform-origin: center center;
        }

        .bridge-typography-scale-layer {
          position: absolute;
          inset: 0;
          transform: scale(0.86);
          transform-origin: 50% 52.3%;
        }

        .bridge-title-line {
          position: absolute;
        }

        .bridge-title-line-1 {
          left: 565px;
          top: 85px;
          width: 417px;
          height: 240px;
        }

        .bridge-title-line-2 {
          left: 555px;
          top: 305px;
          width: 582px;
          height: 230px;
        }

        .bridge-title-line-3 {
          left: 555px;
          top: 515px;
          width: 582px;
          height: 230px;
        }

        .bridge-title-svg {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .bridge-reveal-mask {
          overflow: hidden;
          will-change: clip-path;
          animation-duration: 0.66s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: forwards;
        }

        .bridge-reveal-ltr {
          clip-path: inset(0 100% 0 0);
        }

        .bridge-reveal-rtl {
          clip-path: inset(0 0 0 100%);
        }

        .is-intro-played .bridge-reveal-ltr {
          animation-name: bridgeRevealLtr;
        }

        .is-intro-played .bridge-reveal-rtl {
          animation-name: bridgeRevealRtl;
        }

        .bridge-delay-0 {
          animation-delay: 0s;
        }

        .bridge-delay-34 {
          animation-delay: 0.34s;
        }

        .bridge-delay-68 {
          animation-delay: 0.68s;
        }

        .bridge-delay-82 {
          animation-delay: 0.82s;
        }

        @keyframes bridgeRevealLtr {
          from {
            clip-path: inset(0 100% 0 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes bridgeRevealRtl {
          from {
            clip-path: inset(0 0 0 100%);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        .bridge-note {
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

        .bridge-note-motion {
          width: 100%;
          will-change: transform;
        }

        .bridge-note-reveal {
          display: flex;
          flex-direction: column;
        }

        .bridge-left-note {
          left: 317px;
          top: 240px;
          width: 215px;
        }

        .bridge-right-note {
          left: 1167px;
          top: 454px;
          width: 215px;
        }

        .is-intro-reduced-motion .bridge-reveal-ltr,
        .is-intro-reduced-motion .bridge-reveal-rtl {
          animation: none !important;
          clip-path: inset(0 0 0 0);
        }

        @media (prefers-reduced-motion: reduce) {
          .bridge-reveal-mask {
            animation: none !important;
            clip-path: inset(0 0 0 0) !important;
            will-change: auto;
          }
        }
      `}</style>
    </section>
  );
}

export default HeroToSecondTransitionZone;
