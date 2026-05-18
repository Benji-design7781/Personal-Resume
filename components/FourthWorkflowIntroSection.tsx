"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "@/components/FourthWorkflowIntroSection.module.css";
import { WorkflowFinalTitleSvg } from "@/components/WorkflowFinalTitleSvg";

const DESIGN_W = 2048;
const DESIGN_H = 956;
const WORKFLOW_RANGE_VH = 5.2;
const TRANSITION_RANGE_VH = 1.6;
const SCROLL_RANGE_VH = WORKFLOW_RANGE_VH + TRANSITION_RANGE_VH;
const WORKFLOW_PROGRESS_END = WORKFLOW_RANGE_VH / SCROLL_RANGE_VH;
const DEBUG_FRAME_COUNT = 185;
const CARD_RENDER_W = 400;
const FINAL_TITLE_SPLIT_Y = 120;
const CASES_BLUE = "#6fa9e7";
const CASES_SVG_W = 1000;
const CASES_SVG_H = 260;
const CASES_CENTER_X = CASES_SVG_W / 2;
const CASES_CENTER_Y = CASES_SVG_H / 2;
const CASES_TINY_VIEWBOX_W = 14000;
const CASES_ENTRY_VIEWBOX_W = 4200;
const CASES_REST_VIEWBOX_W = 760;
const CASES_FINAL_VIEWBOX_W = 9;
const CASES_MIDDLE_S_ANCHOR_X = 502.8;
const CASES_MIDDLE_S_ANCHOR_Y = 107.5;

type WorkflowCard = {
  alt: string;
  enter: number;
  exit: number;
  rotateEnd: number;
  rotateMid: number;
  rotateStart: number;
  src: string;
  xEnd: number;
  xMid: number;
  xStart: number;
  yEnd: number;
  yMid: number;
  yStart: number;
  zIndex: number;
};

type ScrollMetrics = {
  canvasScale: number;
  scrollRange: number;
  sectionHeight: number | string;
  viewportAspect: number;
};

const DEFAULT_METRICS: ScrollMetrics = {
  canvasScale: 1,
  scrollRange: 1,
  sectionHeight: "620svh",
  viewportAspect: 16 / 9,
};

const workflowCards: WorkflowCard[] = [
  {
    alt: "需求反问",
    enter: 0.075,
    exit: 0.58,
    rotateEnd: 8.5,
    rotateMid: 2.5,
    rotateStart: -11.5,
    src: "/assets/workflow-cards/workflow-card-01-demand.png",
    xEnd: -520,
    xMid: 980,
    xStart: 2096,
    yEnd: 206,
    yMid: 186,
    yStart: 214,
    zIndex: 22,
  },
  {
    alt: "结构拆解",
    enter: 0.15,
    exit: 0.64,
    rotateEnd: -6.5,
    rotateMid: -1.2,
    rotateStart: 8.2,
    src: "/assets/workflow-cards/workflow-card-02-structure.png",
    xEnd: -486,
    xMid: 1048,
    xStart: 2162,
    yEnd: 166,
    yMid: 178,
    yStart: 150,
    zIndex: 24,
  },
  {
    alt: "异常推演",
    enter: 0.225,
    exit: 0.7,
    rotateEnd: 7.4,
    rotateMid: 1.1,
    rotateStart: -8.8,
    src: "/assets/workflow-cards/workflow-card-03-exception.png",
    xEnd: -430,
    xMid: 1018,
    xStart: 2118,
    yEnd: 228,
    yMid: 194,
    yStart: 222,
    zIndex: 26,
  },
  {
    alt: "原型拆屏",
    enter: 0.3,
    exit: 0.8,
    rotateEnd: -8.4,
    rotateMid: -2.4,
    rotateStart: 10.4,
    src: "/assets/workflow-cards/workflow-card-04-prototype.png",
    xEnd: -520,
    xMid: 930,
    xStart: 2296,
    yEnd: 174,
    yMid: 180,
    yStart: 154,
    zIndex: 28,
  },
  {
    alt: "Vibe Coding",
    enter: 0.375,
    exit: 0.9,
    rotateEnd: 6.8,
    rotateMid: 1.6,
    rotateStart: -7.6,
    src: "/assets/workflow-cards/workflow-card-05-vibe-coding.png",
    xEnd: -588,
    xMid: 872,
    xStart: 2282,
    yEnd: 214,
    yMid: 190,
    yStart: 204,
    zIndex: 30,
  },
  {
    alt: "交付校准",
    enter: 0.45,
    exit: 1.02,
    rotateEnd: -7.8,
    rotateMid: -1.8,
    rotateStart: 9.6,
    src: "/assets/workflow-cards/workflow-card-06-delivery.png",
    xEnd: -506,
    xMid: 735,
    xStart: 2363,
    yEnd: 178,
    yMid: 184,
    yStart: 156,
    zIndex: 32,
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function remap(value: number, inputStart: number, inputEnd: number) {
  return clamp((value - inputStart) / (inputEnd - inputStart));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = remap(value, edge0, edge1);
  return t * t * (3 - 2 * t);
}

function easeOutCubic(value: number) {
  const t = clamp(value);
  return 1 - (1 - t) ** 3;
}

function throughMid(start: number, mid: number, end: number, progress: number) {
  if (progress < 0.5) {
    return lerp(start, mid, progress / 0.5);
  }

  return lerp(mid, end, (progress - 0.5) / 0.5);
}

function getForcedProgress() {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const progressParam = params.get("workflowProgress");
  const frameParam = params.get("workflowFrame");

  if (progressParam !== null) {
    const parsedProgress = Number(progressParam);
    return Number.isFinite(parsedProgress) ? clamp(parsedProgress) : null;
  }

  if (frameParam !== null) {
    const parsedFrame = Number(frameParam);
    return Number.isFinite(parsedFrame)
      ? clamp(parsedFrame / DEBUG_FRAME_COUNT)
      : null;
  }

  return null;
}

function cardOpacity(cardProgress: number) {
  const fadeIn = smoothstep(0, 0.045, cardProgress);
  const fadeOut = 1 - smoothstep(0.955, 1, cardProgress);

  return fadeIn * fadeOut;
}

export function FourthWorkflowIntroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [metrics, setMetrics] = useState<ScrollMetrics>(DEFAULT_METRICS);
  const [progress, setProgress] = useState(0);
  const [forcedProgress, setForcedProgress] = useState<number | null>(null);

  useEffect(() => {
    setForcedProgress(getForcedProgress());
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const readMetrics = (): ScrollMetrics => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const stageRect = stageRef.current?.getBoundingClientRect();
      const aspectWidth =
        stageRect && stageRect.width > 0 ? stageRect.width : viewportWidth;
      const aspectHeight =
        stageRect && stageRect.height > 0 ? stageRect.height : viewportHeight;
      const scrollRange = viewportHeight * SCROLL_RANGE_VH;
      const canvasScale = Math.min(
        viewportWidth / DESIGN_W,
        viewportHeight / DESIGN_H,
      );

      return {
        canvasScale,
        scrollRange,
        sectionHeight: viewportHeight + scrollRange,
        viewportAspect: aspectWidth / Math.max(1, aspectHeight),
      };
    };

    const update = () => {
      frameRef.current = null;
      const nextMetrics = readMetrics();

      setMetrics(nextMetrics);

      if (forcedProgress === null) {
        const rect = section.getBoundingClientRect();
        const nextProgress = clamp(-rect.top / nextMetrics.scrollRange);

        setProgress(nextProgress);
      }
    };

    const scheduleUpdate = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(update);
    };

    update();
    if (forcedProgress === null) {
      window.addEventListener("scroll", scheduleUpdate, { passive: true });
    }

    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (forcedProgress === null) {
        window.removeEventListener("scroll", scheduleUpdate);
      }

      window.removeEventListener("resize", scheduleUpdate);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [forcedProgress]);

  const rawProgress = forcedProgress ?? progress;
  const visualProgress = remap(rawProgress, 0, WORKFLOW_PROGRESS_END);
  const transitionProgress = remap(rawProgress, WORKFLOW_PROGRESS_END, 1);
  const titleExitProgress = smoothstep(0.08, 0.24, visualProgress);
  const titleOpacity = 1 - titleExitProgress;
  const titleScale = lerp(1, 0.965, titleExitProgress);
  const titleTranslateY = lerp(0, -34, titleExitProgress);
  const finalProgress = smoothstep(0.66, 0.86, visualProgress);
  const cardCompletionP = smoothstep(0, 0.16, transitionProgress);
  const cardMotionProgress = visualProgress + cardCompletionP * 0.02;
  const titleSplitP = smoothstep(0.16, 0.48, transitionProgress);
  const titleExitP = smoothstep(0.42, 0.56, transitionProgress);
  const finalOpacity = finalProgress * (1 - titleExitP);
  const finalTranslateY = lerp(34, 0, finalProgress);
  const finalScale = lerp(0.965, 1, finalProgress) * (1 + titleSplitP * 8);
  const finalTitleTopTransform = `translate(0 ${(
    -FINAL_TITLE_SPLIT_Y * titleSplitP
  ).toFixed(3)})`;
  const finalTitleBottomTransform = `translate(0 ${(
    FINAL_TITLE_SPLIT_Y * titleSplitP
  ).toFixed(3)})`;
  const casesBirthP = smoothstep(0.415, 0.5, transitionProgress);
  const casesGrowP = smoothstep(0.5, 0.64, transitionProgress);
  const casesZoomP = smoothstep(0.64, 0.86, transitionProgress);
  const casesOpacityP = smoothstep(0.415, 0.43, transitionProgress);
  const whiteFillP = smoothstep(0.84, 0.88, transitionProgress);
  const blueSwitchP = smoothstep(0.94, 1, transitionProgress);
  const casesOpacity = casesOpacityP * (1 - blueSwitchP);
  const casesZoomEase = easeOutCubic(casesZoomP);
  const casesBirthViewBoxW = lerp(
    CASES_TINY_VIEWBOX_W,
    CASES_ENTRY_VIEWBOX_W,
    casesBirthP,
  );
  const casesGrowViewBoxW = lerp(
    CASES_ENTRY_VIEWBOX_W,
    CASES_REST_VIEWBOX_W,
    casesGrowP,
  );
  const casesZoomViewBoxW = lerp(
    CASES_REST_VIEWBOX_W,
    CASES_FINAL_VIEWBOX_W,
    casesZoomEase,
  );
  const casesViewBoxW =
    casesZoomP > 0
      ? casesZoomViewBoxW
      : casesGrowP > 0
        ? casesGrowViewBoxW
        : casesBirthViewBoxW;
  const casesViewBoxH = casesViewBoxW / metrics.viewportAspect;
  const casesViewBoxCenterX = lerp(
    CASES_CENTER_X,
    CASES_MIDDLE_S_ANCHOR_X,
    casesZoomEase,
  );
  const casesViewBoxCenterY = lerp(
    CASES_CENTER_Y,
    CASES_MIDDLE_S_ANCHOR_Y,
    casesZoomEase,
  );
  const casesViewBox = [
    casesViewBoxCenterX - casesViewBoxW / 2,
    casesViewBoxCenterY - casesViewBoxH / 2,
    casesViewBoxW,
    casesViewBoxH,
  ]
    .map((value) => value.toFixed(4))
    .join(" ");
  const whiteFillOpacity = whiteFillP * (1 - blueSwitchP);
  const stageStyle = {
    "--workflow-canvas-scale": metrics.canvasScale,
    "--workflow-progress": visualProgress.toFixed(4),
    "--workflow-raw-progress": rawProgress.toFixed(4),
    "--workflow-transition-progress": transitionProgress.toFixed(4),
    "--cases-color": "#ffffff",
    "--cases-blue-color": CASES_BLUE,
    "--cases-white-fill-opacity": whiteFillOpacity.toFixed(4),
    "--cases-blue-fill-opacity": blueSwitchP.toFixed(4),
    height: metrics.sectionHeight,
  } as CSSProperties;

  const cardStates = useMemo(
    () =>
      workflowCards.map((card) => {
        const localProgress = remap(cardMotionProgress, card.enter, card.exit);
        const x = throughMid(
          card.xStart,
          card.xMid,
          card.xEnd - CARD_RENDER_W * 0.12,
          localProgress,
        );
        const drift = Math.sin(localProgress * Math.PI * 2) * 8;
        const y =
          throughMid(card.yStart, card.yMid, card.yEnd, localProgress) + drift;
        const rotate = throughMid(
          card.rotateStart,
          card.rotateMid,
          card.rotateEnd,
          localProgress,
        );
        const opacity = cardOpacity(localProgress);
        const scale = lerp(0.98, 1.02, Math.sin(localProgress * Math.PI));

        return {
          ...card,
          opacity,
          transform: `translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, 0) rotate(${rotate.toFixed(
            3,
          )}deg) scale(${scale.toFixed(4)})`,
        };
      }),
    [cardMotionProgress],
  );

  return (
    <section
      id="workflow"
      aria-label="AI Agent 产品工作流"
      className={styles.fourthWorkflowIntro}
      data-transition-progress={transitionProgress.toFixed(4)}
      data-workflow-raw-progress={rawProgress.toFixed(4)}
      data-workflow-progress={visualProgress.toFixed(4)}
      ref={sectionRef}
      style={stageStyle}
    >
      <div className={styles.fourthWorkflowIntro__stage} ref={stageRef}>
        <div className={styles.fourthWorkflowIntro__canvas}>
          <div
            className={styles.initialTitle}
            style={{
              opacity: titleOpacity,
              transform: `translate3d(-50%, calc(-50% + ${titleTranslateY.toFixed(
                3,
              )}px), 0) scale(${titleScale.toFixed(4)})`,
            }}
          >
            <img
              alt="AI Agent"
              className={styles.initialTitle__agent}
              draggable={false}
              src="/assets/workflow-intro/ai-agent-title.svg"
            />
            <img
              alt="产品工作流"
              className={styles.initialTitle__workflow}
              draggable={false}
              src="/assets/workflow-intro/workflow-title-cn.svg"
            />
          </div>

          <div className={styles.cardRail} aria-hidden={finalProgress >= 1}>
            {cardStates.map((card) => (
              <img
                alt={card.alt}
                className={styles.workflowCard}
                draggable={false}
                key={card.src}
                src={card.src}
                style={{
                  opacity: card.opacity,
                  transform: card.transform,
                  zIndex: card.zIndex,
                }}
              />
            ))}
          </div>

          <WorkflowFinalTitleSvg
            ariaLabel="工具生成可能，产品决定方向"
            bottomTransform={finalTitleBottomTransform}
            className={styles.finalTitle}
            style={{
              opacity: finalOpacity,
              transform: `translate3d(-50%, calc(-50% + ${finalTranslateY.toFixed(
                3,
              )}px), 0) scale(${finalScale.toFixed(4)})`,
            }}
            topTransform={finalTitleTopTransform}
          />

          <div className={styles.debugProgress} aria-hidden="true">
            {visualProgress.toFixed(4)}
          </div>
        </div>

        <div className={styles.casesTypographyLayer} aria-hidden="true">
          <svg
            className={styles.casesSvg}
            focusable="false"
            preserveAspectRatio="xMidYMid slice"
            viewBox={casesViewBox}
            style={{
              opacity: casesOpacity,
            }}
          >
            <text
              className={styles.casesSvgText}
              dominantBaseline="middle"
              textAnchor="middle"
              x={CASES_CENTER_X}
              y={CASES_CENTER_Y}
            >
              CASES
            </text>
          </svg>
          <div className={styles.casesWhiteFill} />
          <div className={styles.casesBlueFill} />
        </div>
      </div>
    </section>
  );
}
