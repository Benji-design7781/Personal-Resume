"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const BASE_W = 1684;
const BASE_H = 729;
const DEBUG_REFERENCE = false;
const DEBUG_PANEL = false;
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const MOBILE_BREAKPOINT = 900;
const TRACK_WHEEL_GAIN = 2.6;
const FINALE_WHEEL_GAIN = 1.6;
const ORANGE = "#4567BE";
const BALL_RADIUS = 8;
const FINAL_BADGE_RADIUS = 54;
const TRACK_STROKE_WIDTH = 3;
const SAFE_OFFSET = BALL_RADIUS + TRACK_STROKE_WIDTH / 2 + 2;
const PATH_SAMPLE_POINTS = 48;
const GROW_LENGTH_RATIO = 0.26;
const ROUTE_FOLLOW_EASE = 0.03;
const ROUTE_SNAP_THRESHOLD = 0.1;
const THIRD_SCREEN_ENTRANCE_VH = 0.1;
const MAIN_TITLE = "\u4ea7\u54c1\u662f\u5982\u4f55\u88ab\u505a\u51fa\u6765\u7684";
const REFERENCE_IMAGES = [
  "/third-screen/ThirdScreen_Stage_State_01.png",
  "/third-screen/ThirdScreen_Stage_State_02.png",
  "/third-screen/ThirdScreen_Stage_State_03.png",
] as const;

const PLATFORM_SLOTS = [
  { id: "platform-01", label: "\u770b\u6e05\u95ee\u9898", x: 674, y: 565.3, w: 374, h: 153 },
  { id: "platform-02", label: "\u5f62\u6210\u5171\u8bc6", x: 927, y: 412.3, w: 374, h: 153 },
  { id: "platform-03", label: "\u9a8c\u8bc1\u843d\u5730", x: 1183, y: 259.3, w: 374, h: 153 },
] as const;

const PATHS = [
  {
    id: "path-01",
    d: "M600.5 730.8V541.8C600.5 469.4507 659.1507 410.8 731.5 410.8C803.849 410.8 862.5 469.4507 862.5 541.8V577.8",
  },
  {
    id: "path-02",
    d: "M862.5 577.8V388.8C862.5 316.4507 921.1507 257.8 993.5 257.8C1065.849 257.8 1124.5 316.4507 1124.5 388.8V424.8",
  },
  {
    id: "path-03",
    d: "M1124.5 424.8V235.8C1124.5 163.4507 1183.1507 104.8 1255.5 104.8C1327.849 104.8 1386.5 163.4507 1386.5 235.8V271.8",
  },
] as const;

function buildRoundedStarPath(
  outerRadius: number,
  innerRadius: number,
  cornerRadius: number,
) {
  const vertexCount = 10;
  const vertices = Array.from({ length: vertexCount }, (_, index) => {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });
  const rounded = vertices.map((vertex, index) => {
    const previous = vertices[(index - 1 + vertexCount) % vertexCount];
    const next = vertices[(index + 1) % vertexCount];
    const previousLength = Math.hypot(previous.x - vertex.x, previous.y - vertex.y);
    const nextLength = Math.hypot(next.x - vertex.x, next.y - vertex.y);
    const radius = Math.min(cornerRadius, previousLength * 0.42, nextLength * 0.42);
    const before = {
      x: vertex.x + ((previous.x - vertex.x) / previousLength) * radius,
      y: vertex.y + ((previous.y - vertex.y) / previousLength) * radius,
    };
    const after = {
      x: vertex.x + ((next.x - vertex.x) / nextLength) * radius,
      y: vertex.y + ((next.y - vertex.y) / nextLength) * radius,
    };

    return { after, before, vertex };
  });
  const formatPoint = (point: { x: number; y: number }) =>
    `${point.x.toFixed(3)} ${point.y.toFixed(3)}`;
  const commands = [`M${formatPoint(rounded[0].after)}`];

  for (let index = 1; index < vertexCount; index += 1) {
    commands.push(
      `L${formatPoint(rounded[index].before)}`,
      `Q${formatPoint(rounded[index].vertex)} ${formatPoint(rounded[index].after)}`,
    );
  }

  commands.push(
    `L${formatPoint(rounded[0].before)}`,
    `Q${formatPoint(rounded[0].vertex)} ${formatPoint(rounded[0].after)}`,
    "Z",
  );

  return commands.join("");
}

const ROUNDED_STAR_PATH = buildRoundedStarPath(23, 12.2, 5.6);

const STATES = [
  {
    title: "\u4ece\u4e0d\u786e\u5b9a\u91cc\u6536\u655b\u95ee\u9898",
    body: `\u9700\u6c42\u6700\u521d\u5f80\u5f80\u4e0d\u662f\u6e05\u6670\u7b54\u6848\uff0c
\u800c\u662f\u5206\u6563\u7684\u8bc9\u6c42\u3001\u53cd\u9988\u548c\u5224\u65ad\u3002

\u6211\u4e0d\u4f1a\u6025\u7740\u8fdb\u5165\u529f\u80fd\u8bbe\u8ba1\uff0c
\u800c\u662f\u5148\u5224\u65ad\u771f\u6b63\u8981\u89e3\u51b3\u7684\u662f\u4ec0\u4e48\uff0c
\u54ea\u4e9b\u53ea\u662f\u8868\u5c42\u8868\u8fbe\uff0c
\u54ea\u4e9b\u624d\u662f\u9700\u8981\u4f18\u5148\u5904\u7406\u7684\u6838\u5fc3\u77db\u76fe\u3002

\u4ea7\u54c1\u7684\u7b2c\u4e00\u6b65\uff0c
\u662f\u8ba9\u95ee\u9898\u5148\u53d8\u5f97\u8db3\u591f\u6e05\u695a\u3002`,
  },
  {
    title: "\u628a\u5206\u6563\u7406\u89e3\u53d8\u6210\u5171\u540c\u65b9\u6848",
    body: `\u4ea7\u54c1\u65b9\u6848\u4e0d\u662f\u5199\u7ed9\u81ea\u5df1\u770b\u7684\uff0c
\u5b83\u5fc5\u987b\u8ba9\u4e1a\u52a1\u3001\u8bbe\u8ba1\u3001\u7814\u53d1\u3001\u6d4b\u8bd5
\u5728\u540c\u4e00\u5957\u7406\u89e3\u91cc\u5de5\u4f5c\u3002

\u6211\u4f1a\u901a\u8fc7\u6d41\u7a0b\u3001\u539f\u578b\u548c\u7ed3\u6784\u5316\u8bf4\u660e\uff0c
\u628a\u590d\u6742\u903b\u8f91\u8f6c\u5316\u6210\u56e2\u961f\u53ef\u4ee5\u8ba8\u8bba\u3001
\u4fee\u6b63\u5e76\u6267\u884c\u7684\u5171\u540c\u8bed\u8a00\u3002

\u597d\u7684\u65b9\u6848\uff0c
\u4e0d\u53ea\u662f\u5b8c\u6574\uff0c
\u800c\u662f\u80fd\u88ab\u56e2\u961f\u4e00\u8d77\u63a8\u8fdb\u3002`,
  },
  {
    title: "\u8ba9\u7eb8\u9762\u5171\u8bc6\u63a5\u53d7\u771f\u5b9e\u9a8c\u8bc1",
    body: `\u65b9\u6848\u5728\u6587\u6863\u91cc\u6210\u7acb\uff0c
\u4e0d\u4ee3\u8868\u5b83\u5728\u771f\u5b9e\u73af\u5883\u91cc\u4e5f\u6210\u7acb\u3002

\u6211\u5173\u6ce8\u843d\u5730\u8fc7\u7a0b\u4e2d\u7684\u504f\u5dee\uff1a
\u7406\u89e3\u662f\u5426\u4e00\u81f4\uff0c
\u5b9e\u73b0\u662f\u5426\u51c6\u786e\uff0c
\u9a8c\u6536\u662f\u5426\u5b8c\u6574\uff0c
\u53cd\u9988\u662f\u5426\u6709\u6548\u3002

\u4ea7\u54c1\u4e0d\u662f\u5199\u5b8c\u7684\uff0c
\u800c\u662f\u5728\u771f\u5b9e\u534f\u4f5c\u4e2d\u88ab\u4e0d\u65ad\u6821\u51c6\u51fa\u6765\u7684\u3002`,
  },
] as const;

const COPY_STATES = [
  {
    id: "problem",
    title: "从不确定里收敛问题",
    paragraphs: [
      "需求最初往往不是清晰答案，\n而是分散的诉求、反馈和判断。",
      "我不会急着进入功能设计，\n而是先判断真正要解决的是什么，\n哪些只是表层表达，\n哪些才是需要优先处理的核心矛盾。",
      "产品的第一步，\n是让问题先变得足够清楚。",
    ],
  },
  {
    id: "consensus",
    title: "把分散理解变成共同方案",
    paragraphs: [
      "产品方案不是写给自己看的，\n它必须让业务、设计、研发、测试\n在同一套理解里工作。",
      "我会通过流程、原型和结构化说明，\n把复杂逻辑转化成团队可以讨论、\n修正并执行的共同语言。",
      "好的方案，\n不只是完整，\n而是能被团队一起推进。",
    ],
  },
  {
    id: "validation",
    title: "让纸面共识接受真实验证",
    paragraphs: [
      "方案在文档里成立，\n不代表它在真实环境里也成立。",
      "我关注落地过程中的偏差：\n理解是否一致，\n实现是否准确，\n验收是否完整，\n反馈是否有效。",
      "产品不是写完的，\n而是在真实协作中被不断校准出来的。",
    ],
  },
] as const;

type LayoutMetrics = {
  availableHeight: number;
  availableWidth: number;
  headerHeight: number;
  scale: number;
  stickyHeight: number;
  stickyTop: number;
};

type RectMetrics = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
};

type DebugMetrics = {
  availableHeightRaw: number;
  devicePixelRatio: number;
  headerHeight: number;
  innerHeight: number;
  innerWidth: number;
  sectionRect: RectMetrics;
  stickyRect: RectMetrics;
};

type PointLike = {
  x: number;
  y: number;
};

type TrackWindow = {
  fullLength: number;
  revealStart: number;
  revealLength: number;
};

type MotionGeometry = {
  masterPathD: string;
  stageBreakpoints: [number, number];
  totalLength: number;
  trackWindows: [TrackWindow, TrackWindow, TrackWindow];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createDefaultLayout(): LayoutMetrics {
  return {
    availableHeight: BASE_H,
    availableWidth: BASE_W,
    headerHeight: 0,
    scale: 1,
    stickyHeight: BASE_H,
    stickyTop: 0,
  };
}

function toRectMetrics(rect: DOMRect): RectMetrics {
  return {
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width,
    x: rect.x,
    y: rect.y,
  };
}

function formatRect(rect: RectMetrics) {
  return `x:${rect.x.toFixed(1)} y:${rect.y.toFixed(1)} w:${rect.width.toFixed(1)} h:${rect.height.toFixed(1)} t:${rect.top.toFixed(1)} r:${rect.right.toFixed(1)} b:${rect.bottom.toFixed(1)} l:${rect.left.toFixed(1)}`;
}

function distanceBetween(a: PointLike, b: PointLike) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function buildPathString(points: PointLike[]) {
  if (!points.length) {
    return "";
  }

  return points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"}${point.x.toFixed(3)} ${point.y.toFixed(3)}`,
    )
    .join("");
}

function pushUniquePoint(points: PointLike[], point: PointLike) {
  const previous = points.at(-1);

  if (
    !previous ||
    Math.abs(previous.x - point.x) > 0.001 ||
    Math.abs(previous.y - point.y) > 0.001
  ) {
    points.push(point);
  }
}

function segmentPointsLength(points: PointLike[]) {
  let total = 0;

  for (let index = 1; index < points.length; index += 1) {
    total += distanceBetween(points[index - 1], points[index]);
  }

  return total;
}

function samplePathPoints(
  path: SVGPathElement,
  startLength: number,
  endLength: number,
  sampleCount = PATH_SAMPLE_POINTS,
) {
  const points: PointLike[] = [];
  const clampedStart = Math.max(startLength, 0);
  const clampedEnd = Math.max(endLength, clampedStart);
  const steps = Math.max(sampleCount, 2);

  for (let step = 0; step < steps; step += 1) {
    const t = steps === 1 ? 0 : step / (steps - 1);
    const length = clampedStart + (clampedEnd - clampedStart) * t;
    const point = path.getPointAtLength(length);

    points.push({ x: point.x, y: point.y });
  }

  return points;
}

function createDefaultMotionGeometry(): MotionGeometry {
  return {
    masterPathD: "",
    stageBreakpoints: [0, 0],
    totalLength: 1,
    trackWindows: [
      { fullLength: 1, revealStart: 0, revealLength: 0 },
      { fullLength: 1, revealStart: 0, revealLength: 0 },
      { fullLength: 1, revealStart: 0, revealLength: 0 },
    ],
  };
}

function buildMotionGeometry(paths: SVGPathElement[]): MotionGeometry {
  const [path1, path2, path3] = paths;
  const fullLengths = paths.map((path) => path.getTotalLength());
  const [len1, len2, len3] = fullLengths;

  const safeTail1 = Math.max(len1 - SAFE_OFFSET, 0);
  const safeTail2 = Math.max(len2 - SAFE_OFFSET, 0);
  const safeTail3 = Math.max(len3 - SAFE_OFFSET, 0);

  const firstStart = path1.getPointAtLength(0);
  const firstNext = path1.getPointAtLength(Math.min(1, len1));
  const firstDx = firstNext.x - firstStart.x;
  const firstDy = firstNext.y - firstStart.y;
  const firstMag = Math.hypot(firstDx, firstDy) || 1;
  const leadStart = {
    x: firstStart.x - (firstDx / firstMag) * SAFE_OFFSET,
    y: firstStart.y - (firstDy / firstMag) * SAFE_OFFSET,
  };

  const safeEnd1 = path1.getPointAtLength(safeTail1);
  const start2 = path2.getPointAtLength(0);
  const safeEnd2 = path2.getPointAtLength(safeTail2);
  const start3 = path3.getPointAtLength(0);

  const allPoints: PointLike[] = [];
  pushUniquePoint(allPoints, leadStart);
  pushUniquePoint(allPoints, { x: firstStart.x, y: firstStart.y });

  const sampled1 = samplePathPoints(path1, 0, safeTail1);
  sampled1.forEach((point) => pushUniquePoint(allPoints, point));
  pushUniquePoint(allPoints, { x: start2.x, y: start2.y });

  const sampled2 = samplePathPoints(path2, 0, safeTail2);
  sampled2.forEach((point) => pushUniquePoint(allPoints, point));
  pushUniquePoint(allPoints, { x: start3.x, y: start3.y });

  const sampled3 = samplePathPoints(path3, 0, safeTail3);
  sampled3.forEach((point) => pushUniquePoint(allPoints, point));

  const preLeadLength = distanceBetween(leadStart, {
    x: firstStart.x,
    y: firstStart.y,
  });
  const track1Length = segmentPointsLength(sampled1);
  const connector1Length = distanceBetween(safeEnd1, start2);
  const track2Length = segmentPointsLength(sampled2);
  const connector2Length = distanceBetween(safeEnd2, start3);
  const track3Length = segmentPointsLength(sampled3);

  const track1Start = preLeadLength;
  const track2Start = track1Start + track1Length + connector1Length;
  const track3Start = track2Start + track2Length + connector2Length;
  const totalLength = track3Start + track3Length;

  return {
    masterPathD: buildPathString(allPoints),
    stageBreakpoints: [track2Start, track3Start],
    totalLength: Math.max(totalLength, 1),
    trackWindows: [
      {
        fullLength: len1,
        revealStart: track1Start,
        revealLength: Math.max(safeTail1, 0),
      },
      {
        fullLength: len2,
        revealStart: track2Start,
        revealLength: Math.max(safeTail2, 0),
      },
      {
        fullLength: len3,
        revealStart: track3Start,
        revealLength: Math.max(safeTail3, 0),
      },
    ],
  };
}

function ProductProcessCopySwitcher({
  activeIndex,
}: {
  activeIndex: number;
}) {
  return (
    <div
      className="absolute z-10"
      style={{
        left: 176,
        top: 205.04,
        width: 410,
        height: 512.17,
      }}
    >
      {COPY_STATES.map((state, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            aria-hidden={!isActive}
            className="absolute inset-0"
            key={state.id}
            style={{
              opacity: isActive ? 1 : 0,
              pointerEvents: isActive ? "auto" : "none",
              transform: isActive
                ? "translate3d(0, 0, 0)"
                : "translate3d(0, 10px, 0)",
              transition:
                "opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "opacity, transform",
            }}
          >
            <h3
              className="m-0"
              style={{
                width: 397,
                height: 40.8,
                color: ORANGE,
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.03em",
                textShadow: "0 4px 14px rgba(69, 103, 190, 0.20)",
              }}
            >
              {state.title}
            </h3>

            <div
              style={{
                marginTop: 33.07,
                width: 410,
                height: 439.17,
                opacity: isActive ? 1 : 0,
                transform: isActive
                  ? "translate3d(0, 0, 0)"
                  : "translate3d(0, 12px, 0)",
                transition:
                  "opacity 420ms cubic-bezier(0.22, 1, 0.36, 1) 50ms, transform 420ms cubic-bezier(0.22, 1, 0.36, 1) 50ms",
                willChange: "opacity, transform",
              }}
            >
              {state.paragraphs.map((paragraph) => (
                <p
                  className="m-0 whitespace-pre-line"
                  key={paragraph}
                  style={{
                    width: 410,
                    color: "#4F5B6D",
                    fontSize: 22,
                    fontWeight: 400,
                    lineHeight: 1.48,
                    letterSpacing: "-0.02em",
                    marginBottom: 18,
                    textShadow: "0 3px 10px rgba(20, 30, 60, 0.12)",
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProductProcessDesktop() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const stageShellRef = useRef<HTMLDivElement | null>(null);
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const ballCircleRef = useRef<SVGCircleElement | null>(null);
  const starsGroupRef = useRef<SVGGElement | null>(null);
  const smallStarRef = useRef<SVGGElement | null>(null);
  const bigStarRef = useRef<SVGGElement | null>(null);
  const smallStarShapeRef = useRef<SVGGElement | null>(null);
  const bigStarShapeRef = useRef<SVGGElement | null>(null);
  const measureFrameRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const targetProgressRef = useRef(0);
  const routeTargetRef = useRef(0);
  const routeDisplayRef = useRef(0);
  const entranceDistanceRef = useRef(BASE_H * THIRD_SCREEN_ENTRANCE_VH);
  const motionGeometryRef = useRef<MotionGeometry>(createDefaultMotionGeometry());
  const pathLengthsRef = useRef<number[]>([590, 590, 590]);
  const totalPathLengthRef = useRef(1770);
  const contactCenterRef = useRef<PointLike>({ x: 1386.5, y: 271.8 });
  const contentActiveIndexRef = useRef(0);
  const [layout, setLayout] = useState<LayoutMetrics>(createDefaultLayout);
  const [debugMetrics, setDebugMetrics] = useState<DebugMetrics | null>(null);
  const [pathLengths, setPathLengths] = useState<number[]>([590, 590, 590]);
  const [contentActiveIndex, setContentActiveIndex] = useState(0);
  const [motionGeometry, setMotionGeometry] = useState<MotionGeometry>(
    createDefaultMotionGeometry,
  );

  const renderScene = (routeDisplay: number) => {
    const ballCircle = ballCircleRef.current;
    const starsGroup = starsGroupRef.current;
    const smallStar = smallStarRef.current;
    const bigStar = bigStarRef.current;
    const smallStarShape = smallStarShapeRef.current;
    const bigStarShape = bigStarShapeRef.current;
    const [len1 = 590, len2 = 590, len3 = 590] = pathLengthsRef.current;
    const totalLength = Math.max(totalPathLengthRef.current, 1);

    if (!ballCircle) {
      return;
    }

    const growLength = totalLength * GROW_LENGTH_RATIO;
    const pathDistance = clamp(routeDisplay, 0, totalLength);
    const growRaw = clamp((routeDisplay - totalLength) / Math.max(growLength, 1), 0, 1);
    const revealLengths = [
      clamp(pathDistance, 0, len1),
      clamp(pathDistance - len1, 0, len2),
      clamp(pathDistance - len1 - len2, 0, len3),
    ];

    pathRefs.current.forEach((path, index) => {
      if (!path) {
        return;
      }

      const fullLength = pathLengthsRef.current[index] ?? 590;
      path.setAttribute("stroke-dasharray", String(fullLength));
      path.setAttribute("stroke-dashoffset", String(fullLength - revealLengths[index]));
    });

    const breakpoint1 = len1;
    const breakpoint2 = len1 + len2;
    const hysteresis = totalLength * 0.02;
    let nextContentIndex = contentActiveIndexRef.current;

    if (nextContentIndex === 0) {
      if (pathDistance > breakpoint1 + hysteresis) {
        nextContentIndex = 1;
      }
    } else if (nextContentIndex === 1) {
      if (pathDistance > breakpoint2 + hysteresis) {
        nextContentIndex = 2;
      } else if (pathDistance < breakpoint1 - hysteresis) {
        nextContentIndex = 0;
      }
    } else if (pathDistance < breakpoint2 - hysteresis) {
      nextContentIndex = 1;
    }

    if (nextContentIndex !== contentActiveIndexRef.current) {
      contentActiveIndexRef.current = nextContentIndex;
      setContentActiveIndex(nextContentIndex);
    }

    const [path1, path2, path3] = pathRefs.current;
    let point: DOMPoint | SVGPoint | PointLike = contactCenterRef.current;

    if (pathDistance <= len1 && path1) {
      const localDistance = pathDistance;
      point = path1.getPointAtLength(localDistance);
    } else if (pathDistance <= len1 + len2 && path2) {
      const localDistance = pathDistance - len1;
      point = path2.getPointAtLength(localDistance);
    } else if (path3) {
      const localDistance = pathDistance - len1 - len2;
      point = path3.getPointAtLength(localDistance);
    }

    const growProgress = growRaw;
    const easedGrowProgress =
      growProgress <= 0
        ? 0
        : growProgress >= 1
          ? 1
          : growProgress *
            growProgress *
            growProgress *
            (growProgress * (growProgress * 6 - 15) + 10);

    if (!starsGroup || !smallStar || !bigStar || !smallStarShape || !bigStarShape) {
      ballCircle.setAttribute("cx", point.x.toFixed(3));
      ballCircle.setAttribute("cy", point.y.toFixed(3));
      ballCircle.setAttribute("r", String(BALL_RADIUS));
      ballCircle.style.opacity = "1";
      return;
    }

    if (easedGrowProgress <= 0.0001) {
      ballCircle.setAttribute("cx", point.x.toFixed(3));
      ballCircle.setAttribute("cy", point.y.toFixed(3));
      ballCircle.setAttribute("r", String(BALL_RADIUS));
      ballCircle.style.opacity = "1";
      smallStar.style.opacity = "0";
      bigStar.style.opacity = "0";
      smallStar.setAttribute("transform", "translate(0, 0)");
      bigStar.setAttribute("transform", "translate(0, 0)");
      smallStarShape.setAttribute("transform", "rotate(0) scale(0)");
      bigStarShape.setAttribute("transform", "rotate(0) scale(0)");
      return;
    }

    const finalPoint = contactCenterRef.current;
    const badgeRadius =
      BALL_RADIUS + (FINAL_BADGE_RADIUS - BALL_RADIUS) * easedGrowProgress;
    const badgeCx = finalPoint.x;
    const badgeCy = finalPoint.y - (badgeRadius - BALL_RADIUS);

    ballCircle.setAttribute("cx", badgeCx.toFixed(3));
    ballCircle.setAttribute("cy", badgeCy.toFixed(3));
    ballCircle.setAttribute("r", badgeRadius.toFixed(3));
    ballCircle.style.opacity = "1";

    starsGroup.setAttribute(
      "transform",
      `translate(${badgeCx.toFixed(3)}, ${badgeCy.toFixed(3)})`,
    );

    const smallStarProgress = clamp((growProgress - 0.1) / 0.62, 0, 1);
    const bigStarProgress = clamp((growProgress - 0.18) / 0.64, 0, 1);
    const sharedRotateProgress = clamp((growProgress - 0.12) / 0.58, 0, 1);
    const easedSmallStar =
      smallStarProgress *
      smallStarProgress *
      smallStarProgress *
      (smallStarProgress * (smallStarProgress * 6 - 15) + 10);
    const easedBigStar =
      bigStarProgress *
      bigStarProgress *
      bigStarProgress *
      (bigStarProgress * (bigStarProgress * 6 - 15) + 10);
    const easedRotateProgress =
      sharedRotateProgress *
      sharedRotateProgress *
      sharedRotateProgress *
      (sharedRotateProgress * (sharedRotateProgress * 6 - 15) + 10);
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

    smallStar.setAttribute(
      "transform",
      `translate(${smallStarX.toFixed(3)}, ${smallStarY.toFixed(3)})`,
    );
    smallStarShape.setAttribute(
      "transform",
      `rotate(${(easedRotateProgress * 420).toFixed(3)}) scale(${(
        0.52 * easedSmallStar
      ).toFixed(4)})`,
    );
    smallStar.style.opacity = smallStarProgress.toFixed(3);

    bigStar.setAttribute(
      "transform",
      `translate(${bigStarX.toFixed(3)}, ${bigStarY.toFixed(3)})`,
    );
    bigStarShape.setAttribute(
      "transform",
      `rotate(${(easedRotateProgress * 360).toFixed(3)}) scale(${(
        0.79 * easedBigStar
      ).toFixed(4)})`,
    );
    bigStar.style.opacity = bigStarProgress.toFixed(3);
  };

  useLayoutEffect(() => {
    const visiblePaths = pathRefs.current.filter(
      (path): path is SVGPathElement => Boolean(path),
    );

    if (visiblePaths.length !== 3) {
      return;
    }

    const nextLengths = visiblePaths.map((path) => path.getTotalLength());
    const nextGeometry = buildMotionGeometry(visiblePaths);
    const finalVisiblePoint = visiblePaths[2].getPointAtLength(nextLengths[2]);

    pathLengthsRef.current = nextLengths;
    totalPathLengthRef.current = nextLengths.reduce((total, length) => total + length, 0);
    motionGeometryRef.current = nextGeometry;
    contactCenterRef.current = {
      x: finalVisiblePoint.x,
      y: finalVisiblePoint.y,
    };

    setPathLengths(nextLengths);
    setMotionGeometry(nextGeometry);

    requestAnimationFrame(() => {
      renderScene(routeDisplayRef.current);
    });
  }, []);

  useEffect(() => {
    motionGeometryRef.current = motionGeometry;
    pathLengthsRef.current = pathLengths;
    totalPathLengthRef.current = pathLengths.reduce((total, length) => total + length, 0);
    renderScene(routeDisplayRef.current);
  }, [motionGeometry, pathLengths]);

  useEffect(() => {
    const measureLayout = () => {
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      const stageShell = stageShellRef.current;
      const header = document.querySelector("header");

      const headerHeight = header
        ? Math.ceil(header.getBoundingClientRect().height)
        : 0;
      const availableWidth = stageShell
        ? stageShell.clientWidth
        : window.innerWidth;
      const availableHeightRaw = Math.max(window.innerHeight - headerHeight, 0);
      const scale = clamp(
        Math.min(availableWidth / BASE_W, availableHeightRaw / BASE_H, 1),
        0.0001,
        1,
      );
      const nextLayout = {
        availableHeight: availableHeightRaw,
        availableWidth,
        headerHeight,
        scale,
        stickyHeight: availableHeightRaw,
        stickyTop: headerHeight,
      };

      setLayout((previous) => {
        if (
          Math.abs(previous.availableHeight - nextLayout.availableHeight) < 0.5 &&
          Math.abs(previous.availableWidth - nextLayout.availableWidth) < 0.5 &&
          Math.abs(previous.headerHeight - nextLayout.headerHeight) < 0.5 &&
          Math.abs(previous.scale - nextLayout.scale) < 0.001 &&
          Math.abs(previous.stickyHeight - nextLayout.stickyHeight) < 0.5 &&
          Math.abs(previous.stickyTop - nextLayout.stickyTop) < 0.5
        ) {
          return previous;
        }

        return nextLayout;
      });

      entranceDistanceRef.current = Math.max(
        availableHeightRaw * THIRD_SCREEN_ENTRANCE_VH,
        0,
      );

      if (IS_DEVELOPMENT && DEBUG_PANEL && section && sticky) {
        setDebugMetrics({
          availableHeightRaw,
          devicePixelRatio: window.devicePixelRatio,
          headerHeight,
          innerHeight: window.innerHeight,
          innerWidth: window.innerWidth,
          sectionRect: toRectMetrics(section.getBoundingClientRect()),
          stickyRect: toRectMetrics(sticky.getBoundingClientRect()),
        });
      }
    };

    const updateTargetProgress = () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
      const scrolledWithinSection = clamp(-rect.top, 0, scrollable);
      const entranceDistance = Math.min(
        entranceDistanceRef.current,
        Math.max(scrollable - 1, 0),
      );
      const interactionRange = Math.max(scrollable - entranceDistance, 1);

      if (scrolledWithinSection <= entranceDistance) {
        targetProgressRef.current = 0;
        return;
      }

      targetProgressRef.current = clamp(
        (scrolledWithinSection - entranceDistance) / interactionRange,
        0,
        1,
      );
    };

    const scheduleFrame = () => {
      if (measureFrameRef.current !== null) {
        cancelAnimationFrame(measureFrameRef.current);
      }

      measureFrameRef.current = requestAnimationFrame(() => {
        measureLayout();
        updateTargetProgress();
      });
    };

    scheduleFrame();
    window.addEventListener("resize", scheduleFrame);
    window.addEventListener("scroll", scheduleFrame, { passive: true });

    const amplifyWheel = (event: WheelEvent) => {
      const section = sectionRef.current;

      if (!section || window.innerWidth < MOBILE_BREAKPOINT) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
      const scrolledWithinSection = clamp(-rect.top, 0, scrollable);
      const interactionStartReached =
        scrolledWithinSection >= entranceDistanceRef.current - 1;
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      const isAnimatingSection =
        targetProgressRef.current > 0 && targetProgressRef.current < 1;

      if (!isVisible && !isAnimatingSection) {
        return;
      }

      if (!interactionStartReached) {
        return;
      }

      const wheelGain =
        routeTargetRef.current < Math.max(totalPathLengthRef.current, 1)
          ? TRACK_WHEEL_GAIN
          : FINALE_WHEEL_GAIN;
      const extraDeltaY = event.deltaY * (wheelGain - 1);

      if (Math.abs(extraDeltaY) < 0.01) {
        return;
      }

      window.scrollBy({
        top: extraDeltaY,
        left: 0,
        behavior: "auto",
      });
    };

    window.addEventListener("wheel", amplifyWheel, { passive: true });

    return () => {
      if (measureFrameRef.current !== null) {
        cancelAnimationFrame(measureFrameRef.current);
      }

      window.removeEventListener("resize", scheduleFrame);
      window.removeEventListener("scroll", scheduleFrame);
      window.removeEventListener("wheel", amplifyWheel);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const totalPathLength = Math.max(totalPathLengthRef.current, 1);
      const routeLength = totalPathLength + totalPathLength * GROW_LENGTH_RATIO;
      const nextRouteTarget = targetProgressRef.current * routeLength;
      let routeDisplay = routeDisplayRef.current;
      const routeDiff = nextRouteTarget - routeDisplay;

      routeDisplay += routeDiff * ROUTE_FOLLOW_EASE;

      if (Math.abs(routeDiff) < ROUTE_SNAP_THRESHOLD) {
        routeDisplay = nextRouteTarget;
      }

      routeDisplay = clamp(routeDisplay, 0, routeLength);
      routeTargetRef.current = nextRouteTarget;
      routeDisplayRef.current = routeDisplay;

      renderScene(routeDisplay);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative hidden h-[340vh] min-[900px]:block"
      style={{ marginTop: 80 }}
    >
      <div
        ref={stickyRef}
        className="sticky overflow-hidden"
        style={{
          top: layout.stickyTop,
          height: layout.stickyHeight,
        }}
      >
        <div ref={stageShellRef} className="relative h-full w-full overflow-hidden">
          <div
            className="relative"
            style={{
              width: BASE_W,
              height: BASE_H,
              transformOrigin: "top left",
              transform: `scale(${layout.scale})`,
              willChange: "transform",
            }}
          >
            {DEBUG_REFERENCE ? (
              <Image
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-30"
                height={BASE_H}
                src={REFERENCE_IMAGES[contentActiveIndex]}
                style={{ opacity: 0.26, mixBlendMode: "multiply" }}
                width={BASE_W}
              />
            ) : null}

            <h2
              className="absolute m-0"
              style={{
                left: 176,
                top: 69,
                width: 498,
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1.03,
                letterSpacing: "-0.045em",
                color: "#2E3445",
                textShadow: "0 4px 14px rgba(20, 30, 60, 0.14)",
                zIndex: 10,
              }}
            >
              {MAIN_TITLE}
            </h2>

            <div
              className="absolute z-10"
              style={{
                left: 176,
                top: 158,
                width: 80,
                height: 3,
                background: ORANGE,
                transformOrigin: "left center",
              }}
            />

            <ProductProcessCopySwitcher activeIndex={contentActiveIndex} />

            <svg
              className="absolute inset-0 pointer-events-none z-20"
              height={BASE_H}
              viewBox={`0 0 ${BASE_W} ${BASE_H}`}
              width={BASE_W}
            >
              {motionGeometry.masterPathD ? (
                <path
                  d={motionGeometry.masterPathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={0}
                />
              ) : null}
              {PATHS.map((path, index) => (
                <path
                  d={path.d}
                  fill="none"
                  key={path.id}
                  ref={(node) => {
                    pathRefs.current[index] = node;
                  }}
                  stroke={ORANGE}
                  strokeDasharray={pathLengths[index] ?? 590}
                  strokeDashoffset={pathLengths[index] ?? 590}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  style={{ filter: "drop-shadow(0 5px 14px rgba(69, 103, 190, 0.28))" }}
                />
              ))}
            </svg>

            {PLATFORM_SLOTS.map((platform, index) => (
              <div
                className="absolute z-10"
                key={platform.id}
                style={{
                  left: platform.x,
                  top: platform.y,
                  width: platform.w,
                  height: platform.h,
                }}
              >
                <Image
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none select-none"
                  height={platform.h}
                  priority={index === 0}
                  src="/third-screen/platform.png"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                  width={platform.w}
                />
              </div>
            ))}

            {PLATFORM_SLOTS.map((platform) => (
              <div
                className="absolute z-[40] flex items-center justify-center"
                key={`${platform.id}-label`}
                style={{
                  left: platform.x,
                  top: platform.y,
                  width: platform.w,
                  height: platform.h,
                  color: "rgba(91, 74, 62, 0.7)",
                  fontSize: 27,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  transform: "translateY(-2px)",
                }}
              >
                {platform.label}
              </div>
            ))}

            <svg
              className="absolute inset-0 pointer-events-none z-[30]"
              height={BASE_H}
              viewBox={`0 0 ${BASE_W} ${BASE_H}`}
              width={BASE_W}
            >
              <circle
                cx={600.5}
                cy={730.8}
                fill={ORANGE}
                r={BALL_RADIUS}
                ref={ballCircleRef}
              />
              <g style={{ pointerEvents: "none" }}>
                <g
                  ref={starsGroupRef}
                  style={{ pointerEvents: "none" }}
                >
                  <g
                    ref={smallStarRef}
                    style={{ opacity: 0, transformOrigin: "center", pointerEvents: "none" }}
                  >
                    <g ref={smallStarShapeRef}>
                      <path
                        d={ROUNDED_STAR_PATH}
                        fill={ORANGE}
                        stroke="#FFFFFF"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                      />
                    </g>
                  </g>
                  <g
                    ref={bigStarRef}
                    style={{ opacity: 0, transformOrigin: "center", pointerEvents: "none" }}
                  >
                    <g ref={bigStarShapeRef}>
                      <path
                        d={ROUNDED_STAR_PATH}
                        fill={ORANGE}
                        stroke="#FFFFFF"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                      />
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
      {IS_DEVELOPMENT && DEBUG_PANEL && debugMetrics ? (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 99999,
            background: "rgba(0, 0, 0, 0.76)",
            color: "#fff",
            fontSize: 12,
            lineHeight: 1.45,
            padding: "10px 12px",
            borderRadius: 10,
            width: 380,
            pointerEvents: "none",
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          }}
        >
          <div>{`window.innerWidth: ${debugMetrics.innerWidth}`}</div>
          <div>{`window.innerHeight: ${debugMetrics.innerHeight}`}</div>
          <div>{`window.devicePixelRatio: ${debugMetrics.devicePixelRatio}`}</div>
          <div>{`header.getBoundingClientRect().height: ${debugMetrics.headerHeight.toFixed(1)}`}</div>
          <div>{`availableHeight = window.innerHeight - headerHeight: ${debugMetrics.availableHeightRaw.toFixed(1)}`}</div>
          <div>{`section rect: ${formatRect(debugMetrics.sectionRect)}`}</div>
          <div>{`sticky rect: ${formatRect(debugMetrics.stickyRect)}`}</div>
          <div>{`stage base: ${BASE_W} x ${BASE_H}`}</div>
          <div>{`stageScale: ${layout.scale.toFixed(4)}`}</div>
          <div>{`stage displayed: ${(BASE_W * layout.scale).toFixed(1)} x ${(BASE_H * layout.scale).toFixed(1)}`}</div>
        </div>
      ) : null}
    </section>
  );
}

function ProductProcessMobile() {
  return (
    <section className="mt-[80px] px-6 py-20 min-[900px]:hidden">
      <div className="mx-auto max-w-[720px]">
        <h2
          className="m-0 text-[34px] font-bold leading-[1.08] tracking-[-0.045em] text-[#2E3445]"
          style={{ textShadow: "0 4px 14px rgba(20, 30, 60, 0.14)" }}
        >
          {MAIN_TITLE}
        </h2>
        <div className="mt-5 h-[3px] w-[80px] bg-[#4567BE]" />
        <div className="mt-10 space-y-8">
          {STATES.map((state, index) => (
            <article className="rounded-[28px] bg-white/65 px-6 py-7" key={state.title}>
              <div className="mb-5 flex h-[96px] items-center">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none select-none"
                  height={96}
                  src="/third-screen/platform.png"
                  style={{
                    width: 208,
                    height: 96,
                    objectFit: "contain",
                    display: "block",
                  }}
                  width={208}
                />
              </div>
              <div className="text-sm font-semibold tracking-[0.24em] text-[#4567BE]">
                {`0${index + 1}`}
              </div>
              <h3
                className="mt-3 text-[28px] font-bold leading-[1.2] tracking-[-0.03em] text-[#4567BE]"
                style={{ textShadow: "0 4px 14px rgba(69, 103, 190, 0.20)" }}
              >
                {state.title}
              </h3>
              <p
                className="mt-5 whitespace-pre-line text-[18px] leading-[1.68] text-[#4F5B6D]"
                style={{ textShadow: "0 3px 10px rgba(20, 30, 60, 0.12)" }}
              >
                {state.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductProcessSection() {
  return (
    <>
      <ProductProcessDesktop />
      <ProductProcessMobile />
    </>
  );
}

export default ProductProcessSection;
