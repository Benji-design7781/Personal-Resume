"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import styles from "@/components/SiteHeader.module.css";

type NavItem = {
  label: string;
  href: string;
  width: number;
};

type RectLayout = {
  x: number;
  width: number;
};

type Layout = {
  gaps: number[];
  rects: RectLayout[];
  totalWidth: number;
};

type ThemeInterval = {
  bottom: number;
  top: number;
};

const NAV_ITEMS: NavItem[] = [
  { label: "\u573a\u666f", href: "#scenes", width: 76 },
  { label: "\u5224\u65ad", href: "#decisions", width: 76 },
  { label: "\u5de5\u4f5c\u6d41", href: "#workflow", width: 96 },
  { label: "\u6848\u4f8b", href: "#cases", width: 76 },
  { label: "\u8054\u7cfb", href: "#contact", width: 76 },
];

const NAV_H = 37;
const R = 12.5;
const HOVER_GAP = 20;
const BRIDGE_OVERLAP = 0.55;
const ANIMATION_DURATION = 300;
const EMPTY_LOGO_LIGHT_CLIP = "inset(0 0 100% 0)";
const MIN_THEME_OPACITY = 0.05;
const MIN_BLOCKER_OPACITY = 0.55;

function getGaps(hoverIndex: number | null) {
  const gaps = [0, 0, 0, 0];

  if (hoverIndex === null) {
    return gaps;
  }

  if (hoverIndex === 0) {
    gaps[0] = HOVER_GAP;
    return gaps;
  }

  if (hoverIndex === NAV_ITEMS.length - 1) {
    gaps[3] = HOVER_GAP;
    return gaps;
  }

  gaps[hoverIndex - 1] = HOVER_GAP;
  gaps[hoverIndex] = HOVER_GAP;

  return gaps;
}

function getLayout(items: NavItem[], gaps: number[]): Layout {
  let x = 0;
  const rects = items.map((item, index) => {
    const rect = { x, width: item.width };
    x += item.width;

    if (index < gaps.length) {
      x += gaps[index];
    }

    return rect;
  });

  return {
    gaps,
    rects,
    totalWidth: x,
  };
}

const MAX_NAV_WIDTH = Math.max(
  ...[null, 0, 1, 2, 3, 4].map((index) =>
    getLayout(NAV_ITEMS, getGaps(index)).totalWidth,
  ),
);

function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function mergeIntervals(intervals: ThemeInterval[]) {
  if (intervals.length <= 1) {
    return intervals;
  }

  return intervals
    .slice()
    .sort((a, b) => a.top - b.top)
    .reduce<ThemeInterval[]>((merged, interval) => {
      const previous = merged[merged.length - 1];

      if (!previous || interval.top > previous.bottom + 0.5) {
        merged.push({ ...interval });
        return merged;
      }

      previous.bottom = Math.max(previous.bottom, interval.bottom);
      return merged;
    }, []);
}

function subtractInterval(
  intervals: ThemeInterval[],
  blocker: ThemeInterval,
) {
  return intervals.flatMap((interval) => {
    if (blocker.bottom <= interval.top || blocker.top >= interval.bottom) {
      return [interval];
    }

    const next: ThemeInterval[] = [];

    if (blocker.top > interval.top) {
      next.push({
        bottom: Math.min(blocker.top, interval.bottom),
        top: interval.top,
      });
    }

    if (blocker.bottom < interval.bottom) {
      next.push({
        bottom: interval.bottom,
        top: Math.max(blocker.bottom, interval.top),
      });
    }

    return next.filter((item) => item.bottom - item.top > 0.5);
  });
}

function getThemeOpacity(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const opacity = Number.parseFloat(style.opacity);

  return {
    display: style.display,
    opacity: Number.isFinite(opacity) ? opacity : 1,
    visibility: style.visibility,
  };
}

function isThemeSurfaceVisible(element: HTMLElement, theme: string) {
  if (element.dataset.contentVisible === "false") {
    return false;
  }

  const style = getThemeOpacity(element);

  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }

  const minOpacity =
    theme === "dark" ? MIN_BLOCKER_OPACITY : MIN_THEME_OPACITY;

  return style.opacity >= minOpacity;
}

function getLogoOverlapInterval(
  logoRect: DOMRect,
  surfaceRect: DOMRect,
): ThemeInterval | null {
  const horizontalOverlap =
    Math.min(logoRect.right, surfaceRect.right) -
    Math.max(logoRect.left, surfaceRect.left);
  const verticalOverlap =
    Math.min(logoRect.bottom, surfaceRect.bottom) -
    Math.max(logoRect.top, surfaceRect.top);

  if (horizontalOverlap <= 0 || verticalOverlap <= 0) {
    return null;
  }

  const top = clamp(
    Math.max(logoRect.top, surfaceRect.top) - logoRect.top,
    0,
    logoRect.height,
  );
  const bottom = clamp(
    Math.min(logoRect.bottom, surfaceRect.bottom) - logoRect.top,
    0,
    logoRect.height,
  );

  return bottom - top > 0.5 ? { bottom, top } : null;
}

function intervalToClip(interval: ThemeInterval | null, logoHeight: number) {
  if (!interval || logoHeight <= 0) {
    return EMPTY_LOGO_LIGHT_CLIP;
  }

  const topPct = (interval.top / logoHeight) * 100;
  const bottomPct = ((logoHeight - interval.bottom) / logoHeight) * 100;

  return `inset(${topPct.toFixed(3)}% 0 ${bottomPct.toFixed(3)}% 0)`;
}

function resolveLogoLightClip(logoElement: HTMLElement | null) {
  if (!logoElement) {
    return EMPTY_LOGO_LIGHT_CLIP;
  }

  const logoRect = logoElement.getBoundingClientRect();

  if (logoRect.width <= 0 || logoRect.height <= 0) {
    return EMPTY_LOGO_LIGHT_CLIP;
  }

  const lightIntervals: ThemeInterval[] = [];
  const blockerIntervals: ThemeInterval[] = [];
  const surfaces = document.querySelectorAll<HTMLElement>("[data-logo-theme]");

  surfaces.forEach((surface) => {
    if (surface === logoElement || logoElement.contains(surface)) {
      return;
    }

    const theme = surface.dataset.logoTheme;

    if (theme !== "light" && theme !== "dark") {
      return;
    }

    if (!isThemeSurfaceVisible(surface, theme)) {
      return;
    }

    const interval = getLogoOverlapInterval(
      logoRect,
      surface.getBoundingClientRect(),
    );

    if (!interval) {
      return;
    }

    if (theme === "dark") {
      blockerIntervals.push(interval);
      return;
    }

    lightIntervals.push(interval);
  });

  let visibleIntervals = mergeIntervals(lightIntervals);

  blockerIntervals.forEach((blocker) => {
    visibleIntervals = subtractInterval(visibleIntervals, blocker);
  });

  const primaryInterval = visibleIntervals
    .slice()
    .sort(
      (a, b) =>
        b.bottom - b.top - (a.bottom - a.top),
    )[0] ?? null;

  return intervalToClip(primaryInterval, logoRect.height);
}

function useAnimatedGaps(targetGaps: number[]) {
  const [animatedGaps, setAnimatedGaps] = useState(targetGaps);
  const animatedGapsRef = useRef(animatedGaps);
  const rafRef = useRef<number | null>(null);
  const targetGapsKey = targetGaps.join(",");

  useEffect(() => {
    animatedGapsRef.current = animatedGaps;
  }, [animatedGaps]);

  useEffect(() => {
    const from = animatedGapsRef.current;
    const to = targetGaps;
    const start = performance.now();

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    function frame(now: number) {
      const t = Math.min(1, (now - start) / ANIMATION_DURATION);
      const eased = easeOutQuart(t);
      const next = to.map((value, index) => from[index] + (value - from[index]) * eased);

      animatedGapsRef.current = next;
      setAnimatedGaps(next);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [targetGapsKey]);

  return animatedGaps;
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  return [
    `M ${x} ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
    "Z",
  ].join(" ");
}

function buildRectPath(rect: RectLayout) {
  return roundedRectPath(rect.x, 0, rect.width, NAV_H, R);
}

function buildBridgePath(leftRectEnd: number, rightRectStart: number, h: number) {
  const gap = Math.max(rightRectStart - leftRectEnd, 0);
  const effectiveGap = Math.max(gap, 1);
  const x1 = leftRectEnd - BRIDGE_OVERLAP;
  const x2 = rightRectStart + BRIDGE_OVERLAP;
  const topY = gap > 0 ? 7.37 : 8.28;
  const bottomY = h - topY;
  const waistTopY = 13.4;
  const waistBottomY = h - 13.4;
  const handle = effectiveGap * 0.22;

  return [
    `M ${x1} ${bottomY}`,
    `C ${x1 + handle} ${waistBottomY}, ${x2 - handle} ${waistBottomY}, ${x2} ${bottomY}`,
    `L ${x2} ${topY}`,
    `C ${x2 - handle} ${waistTopY}, ${x1 + handle} ${waistTopY}, ${x1} ${topY}`,
    "Z",
  ].join(" ");
}

function buildBridgePaths(rects: RectLayout[]) {
  return rects
    .slice(0, -1)
    .map((rect, index) =>
      buildBridgePath(rect.x + rect.width, rects[index + 1].x, NAV_H),
    )
    .join(" ");
}

export function SiteHeader() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [logoLightClip, setLogoLightClip] = useState(EMPTY_LOGO_LIGHT_CLIP);
  const logoRef = useRef<HTMLSpanElement | null>(null);
  const logoClipRef = useRef(EMPTY_LOGO_LIGHT_CLIP);
  const logoFrameRef = useRef<number | null>(null);
  const reactId = useId().replace(/:/g, "");
  const clipId = `metaClip-${reactId}`;
  const glowId = `metaGlow-${reactId}`;
  const targetGaps = useMemo(() => getGaps(hoveredIndex), [hoveredIndex]);
  const animatedGaps = useAnimatedGaps(targetGaps);
  const layout = useMemo(() => getLayout(NAV_ITEMS, animatedGaps), [animatedGaps]);
  const bridgePath = useMemo(() => buildBridgePaths(layout.rects), [layout.rects]);
  const rectPaths = useMemo(() => layout.rects.map(buildRectPath), [layout.rects]);
  const hoveredRect =
    hoveredIndex === null ? null : layout.rects[hoveredIndex] ?? null;
  const glowCx = hoveredRect ? hoveredRect.x + hoveredRect.width / 2 : 0;

  useEffect(() => {
    const updateLogoClip = () => {
      logoFrameRef.current = null;
      const nextClip = resolveLogoLightClip(logoRef.current);

      if (nextClip === logoClipRef.current) {
        return;
      }

      logoClipRef.current = nextClip;
      setLogoLightClip(nextClip);
    };

    const scheduleLogoClipUpdate = () => {
      if (logoFrameRef.current !== null) {
        return;
      }

      logoFrameRef.current = window.requestAnimationFrame(updateLogoClip);
    };

    updateLogoClip();
    window.addEventListener("scroll", scheduleLogoClipUpdate, { passive: true });
    window.addEventListener("resize", scheduleLogoClipUpdate);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleLogoClipUpdate);

    if (logoRef.current) {
      resizeObserver?.observe(logoRef.current);
    }

    const mutationObserver =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(scheduleLogoClipUpdate);

    mutationObserver?.observe(document.body, {
      attributeFilter: ["data-content-visible", "data-logo-theme", "style"],
      attributes: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("scroll", scheduleLogoClipUpdate);
      window.removeEventListener("resize", scheduleLogoClipUpdate);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();

      if (logoFrameRef.current !== null) {
        window.cancelAnimationFrame(logoFrameRef.current);
        logoFrameRef.current = null;
      }
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a className={styles.logoLink} href="#home">
          <span
            className={styles.logoStack}
            ref={logoRef}
            style={
              {
                "--logo-light-clip": logoLightClip,
              } as CSSProperties
            }
          >
            <Image
              alt="BENJI"
              className={`${styles.logoImage} ${styles.logoImageBase}`}
              data-logo-src="/assets/logo/Benji1.svg"
              height={26}
              priority
              src="/assets/logo/Benji1.svg"
              width={106}
            />
            <Image
              alt=""
              aria-hidden="true"
              className={`${styles.logoImage} ${styles.logoImageLight}`}
              height={26}
              priority
              src="/assets/logo/Benji1.svg"
              width={106}
            />
          </span>
        </a>

        <nav className={styles.navWrap} aria-label="Primary">
          <div
            className={styles.navFrame}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ width: `${MAX_NAV_WIDTH}px` }}
          >
            <div
              className={styles.navRoot}
              style={{ width: `${layout.totalWidth}px` }}
            >
              <svg
                className={styles.navSvg}
                data-meta-row-shape
                preserveAspectRatio="none"
                viewBox={`0 0 ${layout.totalWidth} ${NAV_H}`}
              >
                <path
                  className={styles.shapePath}
                  d={bridgePath}
                  data-meta-row-shape-bridges
                />
                {rectPaths.map((path, index) => (
                  <path
                    className={styles.shapePath}
                    d={path}
                    data-meta-row-rect={index}
                    key={`rect-${NAV_ITEMS[index].href}`}
                  />
                ))}

                <defs>
                  <radialGradient id={glowId}>
                    <stop offset="20%" stopColor="#e9e77847" />
                    <stop offset="100%" stopColor="#e9e77800" />
                  </radialGradient>
                  <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                    <path d={bridgePath} data-meta-row-shape-bridges-clip />
                    {rectPaths.map((path, index) => (
                      <path
                        d={path}
                        data-meta-row-rect-clip={index}
                        key={`clip-${NAV_ITEMS[index].href}`}
                      />
                    ))}
                  </clipPath>
                </defs>

                <g clipPath={`url(#${clipId})`}>
                  <ellipse
                    className={styles.glow}
                    cx={glowCx}
                    cy={NAV_H / 2}
                    fill={`url(#${glowId})`}
                    id="glow"
                    rx={hoveredRect ? 30 : 0}
                    ry={hoveredRect ? 30 : 0}
                  />
                </g>
              </svg>

              <div className={styles.navHitLayer}>
                {NAV_ITEMS.map((item, index) => {
                  const rect = layout.rects[index];

                  return (
                    <a
                      className={styles.navLink}
                      href={item.href}
                      key={item.href}
                      onFocus={() => setHoveredIndex(index)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      style={
                        {
                          left: `${rect.x}px`,
                          width: `${rect.width}px`,
                        } as CSSProperties
                      }
                    >
                      <span className={styles.navText}>{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
