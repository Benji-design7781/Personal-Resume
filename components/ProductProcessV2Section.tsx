"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { FloatingPlatform } from "./FloatingPlatform";

const DESIGN_W = 1699;
const DESIGN_H = 1050;
const ACTIVE_TOP = 10;
const ACTIVE_H = 794;
const TAIL_H = 246;
const PRE_SCROLL_DESIGN = ACTIVE_TOP;
const ROUTE_SCROLL_DESIGN = ACTIVE_H * 1.65;
const FINALE_SCROLL_DESIGN = ACTIVE_H * 0.42;
const TAIL_SCROLL_DESIGN = TAIL_H * 1.35;
const TAIL_SCROLL_MIN_DESIGN = ACTIVE_H * 0.32;
const BACKGROUND_ORANGE = "#F19252";
const ORANGE_PANEL_X = 20;
const ORANGE_PANEL_W = 1660;
const TEXT_FONT_STACK =
  'var(--font-sans-cjk), "Noto Sans CJK SC", "Helvetica Neue", Arial, sans-serif';
const COPY_SWITCH_01 = 0.3;
const COPY_SWITCH_02 = 0.63;
const PATH_MASTER_OFFSET_X = 543;
const PATH_MASTER_OFFSET_Y = 131.5;
const PATH_MASTER_VIEWBOX_W = 855;
const PATH_MASTER_VIEWBOX_H = 681;
const PATH_MASTER_D =
  "M1.5 681V508.25C1.5 429.688 65.1875 366 143.75 366C222.313 366 286 429.687 286 508.25V536V317.75C286 239.464 349.464 176 427.75 176C506.036 176 569.5 239.464 569.5 317.75V391V143.25C569.5 64.9636 632.964 1.5 711.25 1.5C789.536 1.5 853 64.9636 853 143.25V246";
const STAR_COLOR = BACKGROUND_ORANGE;
const BALL_RADIUS = 10;
const FINAL_BADGE_RADIUS = 58;
const DEFAULT_START_POINT = { x: 1.5, y: 681 };
const DEFAULT_FINAL_POINT = { x: 853, y: 246 };

const PLATFORMS = [
  { id: "platform-tail", x: 400, y: 841, w: 283, h: 57 },
  { id: "platform-01", x: 686, y: 696, w: 283, h: 57 },
  { id: "platform-02", x: 969, y: 551, w: 283, h: 57 },
  { id: "platform-03", x: 1252, y: 406, w: 283, h: 57 },
] as const;

const COPY_STATES = [
  {
    id: "copy-01",
    titleLines: ["从不确定里", "收敛问题"],
    bodyLines: [
      "需求最初往往不是答案，",
      "而是分散的诉求、反馈和判断。",
      "产品的第一步，",
      "是先判断真正要解决的核心问题。",
    ],
  },
  {
    id: "copy-02",
    titleLines: ["把分散理解", "变成共同方案"],
    bodyLines: [
      "好的方案不是写给自己看的，",
      "而是让业务、设计、研发和测试",
      "能在同一套理解里协作推进。",
    ],
  },
  {
    id: "copy-03",
    titleLines: ["让纸面方案", "接受真实验证"],
    bodyLines: [
      "方案成立不等于落地成立。",
      "产品需要在实现、验收和反馈中不断校准，",
      "直到它真正能被使用。",
    ],
  },
] as const;
const BOTTOM_LINES = [
  "\u6700\u7ec8\u7684\u4ea7\u54c1\u4e0d\u662f\u4e00\u6b21\u8bbe\u8ba1\u51fa\u6765\u7684\uff0c",
  "\u800c\u662f\u5728\u6301\u7eed\u5224\u65ad\u3001\u534f\u4f5c\u63a8\u8fdb\u548c\u771f\u5b9e\u53cd\u9988\u4e2d\u4e00\u70b9\u70b9\u6210\u578b\u3002",
  "\u6bcf\u4e00\u6b21\u4fee\u6b63\uff0c\u90fd\u662f\u8ba9\u65b9\u6848\u66f4\u63a5\u8fd1\u771f\u5b9e\u7ed3\u679c\u7684\u8fc7\u7a0b\u3002",
] as const;

type Point = {
  x: number;
  y: number;
};

function buildBubbleStarPath(
  outerRadius: number,
  innerRadius: number,
  smoothing: number,
) {
  const pointCount = 10;
  const step = (Math.PI * 2) / pointCount;
  const outerScale = [1.02, 0.98, 1.03, 0.99, 1.01];
  const innerScale = [1.0, 1.03, 0.97, 1.02, 0.99];
  const angleWobble = [0, 0.01, -0.014, 0.012, -0.008, 0.01, -0.012, 0.008, -0.01, 0.006];
  const points = Array.from({ length: pointCount }, (_, index) => {
    const isOuter = index % 2 === 0;
    const baseRadius = isOuter ? outerRadius : innerRadius;
    const scale = isOuter
      ? outerScale[Math.floor(index / 2) % outerScale.length]
      : innerScale[Math.floor(index / 2) % innerScale.length];
    const angle = -Math.PI / 2 + step * index + angleWobble[index];
    const radius = baseRadius * scale;

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });

  const controlPoint = (
    previous: Point,
    current: Point,
    next: Point,
    reverse = false,
  ) => {
    const lineLength = Math.hypot(next.x - previous.x, next.y - previous.y) * smoothing;
    const lineAngle =
      Math.atan2(next.y - previous.y, next.x - previous.x) +
      (reverse ? Math.PI : 0);

    return {
      x: current.x + Math.cos(lineAngle) * lineLength,
      y: current.y + Math.sin(lineAngle) * lineLength,
    };
  };

  const formatPoint = (point: Point) => `${point.x.toFixed(3)} ${point.y.toFixed(3)}`;
  const commands = [`M${formatPoint(points[0])}`];

  for (let index = 0; index < pointCount; index += 1) {
    const previous = points[(index - 1 + pointCount) % pointCount];
    const current = points[index];
    const next = points[(index + 1) % pointCount];
    const afterNext = points[(index + 2) % pointCount];
    const controlStart = controlPoint(previous, current, next);
    const controlEnd = controlPoint(current, next, afterNext, true);

    commands.push(
      `C${formatPoint(controlStart)} ${formatPoint(controlEnd)} ${formatPoint(next)}`,
    );
  }

  commands.push("Z");
  return commands.join("");
}

const ROUNDED_STAR_PATH = buildBubbleStarPath(24, 15.8, 0.22);

function rectStyle(x: number, y: number, w: number, h: number): CSSProperties {
  return {
    height: `${(h / DESIGN_H) * 100}%`,
    left: `${(x / DESIGN_W) * 100}%`,
    position: "absolute",
    top: `${(y / DESIGN_H) * 100}%`,
    width: `${(w / DESIGN_W) * 100}%`,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smootherstep(value: number) {
  return value * value * value * (value * (value * 6 - 15) + 10);
}

function copyIndexFromRoute(routeProgress: number) {
  if (routeProgress < COPY_SWITCH_01) {
    return 0;
  }

  if (routeProgress < COPY_SWITCH_02) {
    return 1;
  }

  return 2;
}

const textBaseStyle: CSSProperties = {
  color: "#FFFFFF",
  fontFamily: TEXT_FONT_STACK,
  letterSpacing: "0.03em",
  margin: 0,
  padding: 0,
  textShadow: "0 8px 18px rgba(126, 58, 24, 0.12)",
  whiteSpace: "nowrap",
};

type ScrollMetrics = {
  finaleScroll: number;
  preScroll: number;
  routeScroll: number;
  sectionHeight: number;
  stageHeight: number;
  stageWidth: number;
  stickyHeight: number;
  tailScroll: number;
  totalScrollRange: number;
};

const DEFAULT_SCROLL_METRICS: ScrollMetrics = {
  finaleScroll: 1,
  preScroll: 1,
  routeScroll: 1,
  sectionHeight: 1000,
  stageHeight: ACTIVE_H,
  stageWidth: DESIGN_W,
  stickyHeight: 1000,
  tailScroll: 1,
  totalScrollRange: 3,
};

export function ProductProcessV2Section() {
  const [scrollMetrics, setScrollMetrics] = useState(DEFAULT_SCROLL_METRICS);
  const [scrollProgress, setScrollProgress] = useState({
    finale: 0,
    pre: 0,
    route: 0,
    tail: 0,
  });
  const [pathMetrics, setPathMetrics] = useState({
    ballPoint: DEFAULT_START_POINT,
    drawnLength: 0,
    finalPoint: DEFAULT_FINAL_POINT,
    pathLength: 0,
  });
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyStageRef = useRef<HTMLDivElement | null>(null);
  const activeViewportRef = useRef<HTMLDivElement | null>(null);
  const pathMeasureRef = useRef<SVGPathElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const visualRouteProgress = scrollProgress.route;
  const finaleProgress = scrollProgress.finale;
  const preProgress = scrollProgress.pre;
  const tailProgress = scrollProgress.tail;
  const activeCopyIndex = copyIndexFromRoute(visualRouteProgress);
  const cameraY = -ACTIVE_TOP * preProgress - tailProgress * TAIL_H;
  const pathLength = pathMetrics.pathLength;
  const dashLength = pathLength || 1;
  const dashOffset = pathLength > 0 ? pathLength - pathMetrics.drawnLength : dashLength;
  const easedFinaleProgress = smootherstep(finaleProgress);
  const badgeRadius =
    BALL_RADIUS + (FINAL_BADGE_RADIUS - BALL_RADIUS) * easedFinaleProgress;
  const badgeCx = pathMetrics.finalPoint.x;
  const badgeCy = pathMetrics.finalPoint.y - (badgeRadius - BALL_RADIUS);
  const smallStarProgress = clamp((finaleProgress - 0.1) / 0.62, 0, 1);
  const bigStarProgress = clamp((finaleProgress - 0.18) / 0.64, 0, 1);
  const sharedRotateProgress = clamp((finaleProgress - 0.12) / 0.58, 0, 1);
  const easedSmallStar = smootherstep(smallStarProgress);
  const easedBigStar = smootherstep(bigStarProgress);
  const easedRotateProgress = smootherstep(sharedRotateProgress);
  const smallStarStartX = -0.34 * badgeRadius;
  const smallStarStartY = -0.24 * badgeRadius;
  const smallStarFinalX = -0.18 * badgeRadius;
  const smallStarFinalY = -0.14 * badgeRadius;
  const smallStarX =
    smallStarStartX + (smallStarFinalX - smallStarStartX) * easedSmallStar;
  const smallStarY =
    smallStarStartY + (smallStarFinalY - smallStarStartY) * easedSmallStar;
  const bigStarX = 0.1 * badgeRadius;
  const bigStarY = 0.08 * badgeRadius;
  const orangePanelWidth =
    scrollMetrics.stageWidth * (ORANGE_PANEL_W / DESIGN_W);

  useEffect(() => {
    const section = sectionRef.current;
    const stickyStage = stickyStageRef.current;
    const activeViewport = activeViewportRef.current;

    if (!section || !stickyStage || !activeViewport) {
      return;
    }

    const readMetrics = (): ScrollMetrics => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = stickyStage.getBoundingClientRect().width || window.innerWidth;
      const scale = Math.max(
        Math.min(viewportWidth / DESIGN_W, viewportHeight / ACTIVE_H),
        0.0001,
      );
      const stageWidth = DESIGN_W * scale;
      const stageHeight = ACTIVE_H * scale;
      const stickyHeight = viewportHeight;
      const preScroll = PRE_SCROLL_DESIGN * scale;
      const routeScroll = ROUTE_SCROLL_DESIGN * scale;
      const finaleScroll = FINALE_SCROLL_DESIGN * scale;
      const tailScroll =
        Math.max(TAIL_SCROLL_DESIGN, TAIL_SCROLL_MIN_DESIGN) * scale;
      const totalScrollRange = preScroll + routeScroll + finaleScroll + tailScroll;

      return {
        finaleScroll,
        preScroll,
        routeScroll,
        sectionHeight: stickyHeight + totalScrollRange,
        stageHeight,
        stageWidth,
        stickyHeight,
        tailScroll,
        totalScrollRange,
      };
    };

    const calculateProgress = (metrics: ScrollMetrics) => {
      const rect = section.getBoundingClientRect();
      const rawScrolled = clamp(
        -rect.top,
        0,
        metrics.totalScrollRange,
      );
      const preScroll = clamp(rawScrolled, 0, metrics.preScroll);
      const interactionScrolled = clamp(
        rawScrolled - metrics.preScroll,
        0,
        metrics.routeScroll + metrics.finaleScroll + metrics.tailScroll,
      );
      const routeScroll = clamp(interactionScrolled, 0, metrics.routeScroll);
      const finaleScroll = clamp(
        interactionScrolled - metrics.routeScroll,
        0,
        metrics.finaleScroll,
      );
      const tailScroll = clamp(
        interactionScrolled - metrics.routeScroll - metrics.finaleScroll,
        0,
        metrics.tailScroll,
      );

      setScrollProgress({
        finale: metrics.finaleScroll > 0 ? finaleScroll / metrics.finaleScroll : 0,
        pre: metrics.preScroll > 0 ? preScroll / metrics.preScroll : 1,
        route: metrics.routeScroll > 0 ? routeScroll / metrics.routeScroll : 0,
        tail: metrics.tailScroll > 0 ? tailScroll / metrics.tailScroll : 0,
      });
    };

    const update = () => {
      frameRef.current = null;
      const nextMetrics = readMetrics();

      setScrollMetrics(nextMetrics);
      calculateProgress(nextMetrics);
    };

    const scheduleUpdate = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const path = pathMeasureRef.current;

    if (!path) {
      return;
    }

    const nextPathLength = path.getTotalLength();
    const drawnLength = nextPathLength * visualRouteProgress;
    const nextBallPoint = path.getPointAtLength(drawnLength);
    const nextFinalPoint = path.getPointAtLength(nextPathLength);

    setPathMetrics({
      ballPoint: { x: nextBallPoint.x, y: nextBallPoint.y },
      drawnLength,
      finalPoint: { x: nextFinalPoint.x, y: nextFinalPoint.y },
      pathLength: nextPathLength,
    });
  }, [visualRouteProgress]);

  return (
    <section
      id="decisions"
      aria-label="\u4ea7\u54c1\u63a8\u8fdb\u8fc7\u7a0b V2 \u9759\u6001\u7a3f"
      className="relative hidden w-full overflow-x-clip py-0 min-[900px]:block"
      ref={sectionRef}
      style={{ height: scrollMetrics.sectionHeight }}
    >
      <div
        className="relative w-full"
        ref={stickyStageRef}
        style={{
          background: "transparent",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          height: "100svh",
          overflow: "hidden",
          position: "sticky",
          top: 0,
        }}
      >
        <div
          aria-hidden="true"
          data-logo-theme="light"
          style={{
            background: BACKGROUND_ORANGE,
            height: "100%",
            left: "50%",
            pointerEvents: "none",
            position: "absolute",
            top: 0,
            transform: "translateX(-50%)",
            width: `${orangePanelWidth}px`,
            zIndex: 0,
          }}
        />

        <div
          className="relative mx-auto w-full max-w-[1699px]"
          ref={activeViewportRef}
          style={{
            containerType: "inline-size",
            flex: "0 0 auto",
            height: `${scrollMetrics.stageHeight}px`,
            maxWidth: "none",
            overflow: "hidden",
            width: `${scrollMetrics.stageWidth}px`,
            zIndex: 1,
          }}
        >
          <div
            className="absolute left-0 top-0 w-full"
            style={{
              aspectRatio: `${DESIGN_W} / ${DESIGN_H}`,
              transform: `translateY(${(cameraY / DESIGN_H) * 100}%)`,
            }}
          >
            <div
              aria-hidden="true"
              data-logo-theme="light"
              style={{
                ...rectStyle(ORANGE_PANEL_X, 0, ORANGE_PANEL_W, 1050),
                background: BACKGROUND_ORANGE,
                borderRadius: 10,
              }}
            />

          <svg
            aria-hidden="true"
            height={PATH_MASTER_VIEWBOX_H}
            style={{
              ...rectStyle(
                PATH_MASTER_OFFSET_X,
                PATH_MASTER_OFFSET_Y,
                PATH_MASTER_VIEWBOX_W,
                PATH_MASTER_VIEWBOX_H,
              ),
              overflow: "visible",
              pointerEvents: "none",
              zIndex: 2,
            }}
            viewBox={`0 0 ${PATH_MASTER_VIEWBOX_W} ${PATH_MASTER_VIEWBOX_H}`}
            width={PATH_MASTER_VIEWBOX_W}
          >
            <path
              d={PATH_MASTER_D}
              fill="none"
              stroke="#FFFFFF"
              strokeDasharray={dashLength}
              strokeDashoffset={dashOffset}
              strokeWidth={3}
              style={{
                opacity: pathLength > 0 ? 1 : 0,
              }}
            />
          </svg>

          {PLATFORMS.map((platform) => (
            <FloatingPlatform
              key={platform.id}
              style={{
                ...rectStyle(platform.x, platform.y, platform.w, platform.h),
                zIndex: 3,
              }}
            />
          ))}

          <svg
            aria-hidden="true"
            height={PATH_MASTER_VIEWBOX_H}
            style={{
              ...rectStyle(
                PATH_MASTER_OFFSET_X,
                PATH_MASTER_OFFSET_Y,
                PATH_MASTER_VIEWBOX_W,
                PATH_MASTER_VIEWBOX_H,
              ),
              overflow: "visible",
              pointerEvents: "none",
              zIndex: 4,
            }}
            viewBox={`0 0 ${PATH_MASTER_VIEWBOX_W} ${PATH_MASTER_VIEWBOX_H}`}
            width={PATH_MASTER_VIEWBOX_W}
          >
            <path
              d={PATH_MASTER_D}
              fill="none"
              ref={pathMeasureRef}
              stroke="transparent"
              strokeWidth={3}
            />
            <circle
              cx={finaleProgress > 0 ? badgeCx : pathMetrics.ballPoint.x}
              cy={finaleProgress > 0 ? badgeCy : pathMetrics.ballPoint.y}
              fill="#FFFFFF"
              r={finaleProgress > 0 ? badgeRadius : BALL_RADIUS}
            />
            <g
              style={{ pointerEvents: "none" }}
              transform={`translate(${badgeCx.toFixed(3)}, ${badgeCy.toFixed(3)})`}
            >
              <g
                opacity={smallStarProgress}
                transform={`translate(${smallStarX.toFixed(3)}, ${smallStarY.toFixed(3)})`}
              >
                <path
                  d={ROUNDED_STAR_PATH}
                  fill="#FFFFFF"
                  stroke={STAR_COLOR}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  vectorEffect="non-scaling-stroke"
                  transform={`rotate(${(easedRotateProgress * 420).toFixed(3)}) scale(${(
                    0.62 * easedSmallStar
                  ).toFixed(4)})`}
                />
              </g>
              <g
                opacity={bigStarProgress}
                transform={`translate(${bigStarX.toFixed(3)}, ${bigStarY.toFixed(3)})`}
              >
                <path
                  d={ROUNDED_STAR_PATH}
                  fill="#FFFFFF"
                  stroke={STAR_COLOR}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  vectorEffect="non-scaling-stroke"
                  transform={`rotate(${(easedRotateProgress * 360).toFixed(3)}) scale(${(
                    0.94 * easedBigStar
                  ).toFixed(4)})`}
                />
              </g>
            </g>
          </svg>

          {COPY_STATES.map((copyState, index) => {
            const isActive = activeCopyIndex === index;

            return (
              <div key={copyState.id}>
                <h2
                  aria-hidden={!isActive}
                  style={{
                    ...rectStyle(80, 71, 512, 240),
                    ...textBaseStyle,
                    fontSize: "5.886cqw",
                    fontWeight: 900,
                    lineHeight: 1.2,
                    opacity: isActive ? 1 : 0,
                    pointerEvents: "none",
                    transform: `translateY(${isActive ? 0 : 0.7}cqw)`,
                    transition: "opacity 220ms ease, transform 220ms ease",
                    zIndex: 5,
                  }}
                >
                  {copyState.titleLines.map((line) => (
                    <span
                      key={line}
                      style={{ display: "block", whiteSpace: "nowrap" }}
                    >
                      {line}
                    </span>
                  ))}
                </h2>

                <p
                  aria-hidden={!isActive}
                  style={{
                    ...rectStyle(80, 344, 525, 164),
                    ...textBaseStyle,
                    fontSize: "2.001cqw",
                    fontWeight: 500,
                    lineHeight: 41 / 34,
                    opacity: isActive ? 1 : 0,
                    pointerEvents: "none",
                    textShadow: "0 6px 16px rgba(126, 58, 24, 0.12)",
                    transform: `translateY(${isActive ? 0 : 0.7}cqw)`,
                    transition: "opacity 220ms ease, transform 220ms ease",
                    zIndex: 5,
                  }}
                >
                  {copyState.bodyLines.map((line) => (
                    <span
                      key={line}
                      style={{ display: "block", whiteSpace: "nowrap" }}
                    >
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            );
          })}

          <p
            style={{
              ...rectStyle(850, 870, 741, 108),
              ...textBaseStyle,
              fontSize: "1.766cqw",
              fontWeight: 500,
              lineHeight: 1.2,
              zIndex: 5,
            }}
          >
            {BOTTOM_LINES.map((line) => (
              <span key={line} style={{ display: "block", whiteSpace: "nowrap" }}>
                {line}
              </span>
            ))}
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}

export default ProductProcessV2Section;
