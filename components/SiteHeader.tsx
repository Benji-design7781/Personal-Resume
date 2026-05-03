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

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a className={styles.logoLink} href="#home">
          <Image
            alt="BENJI"
            data-logo-src="/assets/logo/Benji1.svg"
            className={styles.logoImage}
            height={26}
            priority
            src="/assets/logo/Benji1.svg"
            width={106}
          />
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
