"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import styles from "./AbilityCardsTetrisStage.module.css";

const DESIGN_W = 1699;
const DESIGN_H = 794;
const PHASE_ONE_DURATION = 640;
const HOLD_DURATION = 400;
const PHASE_TWO_DURATION = 640;
const PHASE_THREE_DURATION = 85;
const TITLE_COMPACT_SCALE = 49.77 / 92;

type CardId = "business" | "system" | "delivery";
type Side = "left" | "right";
type Row = "top" | "bottom";
type PhaseName = "stable" | "phase1" | "hold" | "phase2" | "phase3";

type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
};

type Roles = {
  main: CardId;
  target: CardId;
  other: CardId;
};

type RowByCardId = Record<CardId, Row | null>;
type RectByCardId = Record<CardId, Rect>;
type ZIndexByCardId = Record<CardId, number>;

type TransitionState = {
  phase: PhaseName;
  roles: Roles | null;
  mainProgress: number;
  targetProgress: number;
};

type CardRecord = {
  id: CardId;
  meta: string;
  title: [string, string];
  body: string[];
  icon: string;
};

const cardIds: CardId[] = ["business", "system", "delivery"];

const cardSlots = {
  LEFT_MAIN: { x: 20, y: 20, w: 1099, h: 754, r: 10 },
  RIGHT_MAIN: { x: 580, y: 20, w: 1099, h: 754, r: 10 },
  LEFT_TOP: { x: 20, y: 20, w: 539, h: 367, r: 10 },
  LEFT_BOTTOM: { x: 20, y: 407, w: 539, h: 367, r: 10 },
  RIGHT_TOP: { x: 1140, y: 20, w: 539, h: 367, r: 10 },
  RIGHT_BOTTOM: { x: 1140, y: 407, w: 539, h: 367, r: 10 },
  LEFT_TOP_WIDE: { x: 20, y: 20, w: 1099, h: 367, r: 10 },
  LEFT_BOTTOM_WIDE: { x: 20, y: 407, w: 1099, h: 367, r: 10 },
  RIGHT_TOP_WIDE: { x: 580, y: 20, w: 1099, h: 367, r: 10 },
  RIGHT_BOTTOM_WIDE: { x: 580, y: 407, w: 1099, h: 367, r: 10 },
  TOP_FULL: { x: 20, y: 20, w: 1659, h: 367, r: 10 },
  BOTTOM_FULL: { x: 20, y: 407, w: 1659, h: 367, r: 10 },
} as const satisfies Record<string, Rect>;

const cards: Record<CardId, CardRecord> = {
  business: {
    id: "business",
    meta: "01 / COMPLEX SCENE",
    title: ["把复杂业务", "压缩成可执行结构"],
    body: [
      "复杂业务最容易失控的地方，不是规则多，而是规则之间没有被整理清楚。",
      "一个需求背后，往往包含主流程、分支流程、状态变化、异常情况和逆向操作。",
      "我会先拆出核心目标、参与角色、主流程、状态节点、异常分支和验收条件。再通过流程图、状态表、页面原型和说明文档，把混在一起的逻辑整理成团队可以执行的结构。",
      "产品拆解的价值，不是把所有细节推进文档，而是让团队清楚主路径、例外情况和优先处理项。",
    ],
    icon: "/assets/ability-cards/business-icon.svg",
  },
  system: {
    id: "system",
    meta: "02 / SYSTEM FLOW",
    title: ["把多端系统", "整理成清晰协同"],
    body: [
      "多端系统的混乱，通常不是页面不够多，而是不同角色、入口和权限之间没有清楚分工。当多个端承接相似任务，或同一流程在不同端重复出现，系统就会变得难维护、难协作。",
      "我会按角色和任务重新拆分系统关系：谁负责发起、处理、审核、查看结果；哪些信息在前台，哪些留在后台；哪些操作必须收束，哪些流程需要拆开。",
      "好的多端设计，应该让每个端承担正确任务，让信息流、操作流和权限边界保持清晰。",
    ],
    icon: "/assets/ability-cards/system-icon.svg",
  },
  delivery: {
    id: "delivery",
    meta: "03 / REAL DELIVERY",
    title: ["把纸面方案", "推进到真实世界"],
    body: [
      "产品方案在文档里成立，只是第一步。真正困难的，是让业务、设计、研发、测试基于同一套理解推进，并在实现过程中持续校准偏差。",
      "我会把方案拆成可执行的交付内容：页面结构、交互说明、字段规则、异常状态、接口依赖、测试重点和验收标准。推进中持续关注：设计是否理解核心逻辑，研发是否按预期实现，测试是否覆盖关键路径。",
      "产品落地不是把需求“交出去”，而是推动方案被理解、实现、验收，并在上线后继续收敛。",
    ],
    icon: "/assets/ability-cards/delivery-icon.svg",
  },
};

const initialRows: RowByCardId = {
  business: null,
  system: "top",
  delivery: "bottom",
};

const initialRects: RectByCardId = {
  business: cardSlots.LEFT_MAIN,
  system: cardSlots.RIGHT_TOP,
  delivery: cardSlots.RIGHT_BOTTOM,
};

function oppositeSide(side: Side): Side {
  return side === "left" ? "right" : "left";
}

function mainSlot(side: Side): Rect {
  return side === "left" ? cardSlots.LEFT_MAIN : cardSlots.RIGHT_MAIN;
}

function smallSlot(side: Side, row: Row): Rect {
  if (side === "left" && row === "top") return cardSlots.LEFT_TOP;
  if (side === "left" && row === "bottom") return cardSlots.LEFT_BOTTOM;
  if (side === "right" && row === "top") return cardSlots.RIGHT_TOP;
  return cardSlots.RIGHT_BOTTOM;
}

function wideSlot(side: Side, row: Row): Rect {
  if (side === "left" && row === "top") return cardSlots.LEFT_TOP_WIDE;
  if (side === "left" && row === "bottom") return cardSlots.LEFT_BOTTOM_WIDE;
  if (side === "right" && row === "top") return cardSlots.RIGHT_TOP_WIDE;
  return cardSlots.RIGHT_BOTTOM_WIDE;
}

function fullSlot(row: Row): Rect {
  return row === "top" ? cardSlots.TOP_FULL : cardSlots.BOTTOM_FULL;
}

function movingEdge(rect: Rect, mainSide: Side) {
  return mainSide === "left" ? rect.x : rect.x + rect.w;
}

function horizontalTravel(from: Rect, to: Rect, mainSide: Side) {
  return Math.abs(movingEdge(to, mainSide) - movingEdge(from, mainSide));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function easeInCubic(t: number) {
  return t * t * t;
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const sampleCurveX = (t: number) =>
    ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t * t + 3 * x1 * t;
  const sampleCurveY = (t: number) =>
    ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t * t + 3 * y1 * t;
  const sampleDerivativeX = (t: number) =>
    (3 * (1 - 3 * x2 + 3 * x1) * t + 2 * (3 * x2 - 6 * x1)) * t + 3 * x1;

  return (x: number) => {
    let t = x;

    for (let i = 0; i < 5; i += 1) {
      const derivative = sampleDerivativeX(t);

      if (Math.abs(derivative) < 0.001) {
        break;
      }

      t -= (sampleCurveX(t) - x) / derivative;
    }

    return sampleCurveY(clamp(t, 0, 1));
  };
}

const phaseThreeEase = cubicBezier(0.16, 1, 0.3, 1);

function interpolateRect(from: Rect, to: Rect, progress: number): Rect {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    w: from.w + (to.w - from.w) * progress,
    h: from.h + (to.h - from.h) * progress,
    r: from.r + (to.r - from.r) * progress,
  };
}

function smoothStep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);

  return t * t * (3 - 2 * t);
}

function resolveRoles(currentMainId: CardId, target: CardId): Roles {
  const other = cardIds.find((id) => id !== currentMainId && id !== target);

  if (!other) {
    throw new Error("Unable to resolve the third card.");
  }

  return {
    main: currentMainId,
    target,
    other,
  };
}

function buildPhaseTargets(
  roles: Roles,
  mainSide: Side,
  rowByCardId: RowByCardId,
) {
  const { main, target, other } = roles;

  const oldMainSide = mainSide;
  const oldSmallSide = oppositeSide(oldMainSide);

  const targetRow = rowByCardId[target];
  const otherRow = rowByCardId[other];

  if (!targetRow || !otherRow) {
    return null;
  }

  const mainShrink = smallSlot(oldMainSide, targetRow);
  const targetWide = wideSlot(oldSmallSide, targetRow);
  const otherFull = fullSlot(otherRow);
  const otherShrink = smallSlot(oldMainSide, otherRow);
  const targetMain = mainSlot(oldSmallSide);

  return {
    targetRow,
    otherRow,
    oldMainSide,
    oldSmallSide,
    phase1: {
      [main]: mainShrink,
      [target]: targetWide,
      [other]: otherFull,
    },
    phase2: {
      [main]: mainShrink,
      [target]: targetWide,
      [other]: otherShrink,
    },
    phase3: {
      [main]: mainShrink,
      [target]: targetMain,
      [other]: otherShrink,
    },
  };
}

function buildStableZIndex(currentMainId: CardId): ZIndexByCardId {
  return {
    business: currentMainId === "business" ? 3 : 2,
    system: currentMainId === "system" ? 3 : 2,
    delivery: currentMainId === "delivery" ? 3 : 2,
  };
}

function buildAnimatingZIndex(roles: Roles): ZIndexByCardId {
  return {
    business:
      roles.target === "business" ? 4 : roles.main === "business" ? 3 : 2,
    system: roles.target === "system" ? 4 : roles.main === "system" ? 3 : 2,
    delivery:
      roles.target === "delivery" ? 4 : roles.main === "delivery" ? 3 : 2,
  };
}

function HeaderGroup({ card, scale }: { card: CardRecord; scale: number }) {
  return (
    <div
      className={styles.headerGroup}
      style={{ transform: `scale(${scale})` }}
    >
      <div className={styles.iconTile}>
        <img
          src={card.icon}
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable={false}
          loading="lazy"
        />
      </div>
      <div className={styles.meta}>{card.meta}</div>
      <div className={styles.underline} />
      <h2 className={styles.title}>
        {card.title.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h2>
    </div>
  );
}

function BodyGroup({
  card,
  opacity,
  scale,
}: {
  card: CardRecord;
  opacity: number;
  scale: number;
}) {
  return (
    <div
      className={styles.bodyText}
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {card.body.map((paragraph) => (
        <p key={paragraph}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function CompactButton({
  opacity,
}: {
  opacity: number;
}) {
  return (
    <span
      className={styles.compactButton}
      aria-hidden="true"
      style={{ opacity }}
    >
      <span className={styles.compactArrow} aria-hidden="true" />
    </span>
  );
}

export function AbilityCardsTetrisStage() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const currentMainIdRef = useRef<CardId>("business");
  const mainSideRef = useRef<Side>("left");
  const rowByCardIdRef = useRef<RowByCardId>(initialRows);
  const rectByCardIdRef = useRef<RectByCardId>(initialRects);

  const [scale, setScale] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMainId, setCurrentMainId] = useState<CardId>("business");
  const [mainSide, setMainSide] = useState<Side>("left");
  const [rowByCardId, setRowByCardId] = useState<RowByCardId>(initialRows);
  const [rectByCardId, setRectByCardId] = useState<RectByCardId>(initialRects);
  const [zIndexByCardId, setZIndexByCardId] = useState<ZIndexByCardId>(
    buildStableZIndex("business"),
  );
  const [transition, setTransition] = useState<TransitionState>({
    phase: "stable",
    roles: null,
    mainProgress: 0,
    targetProgress: 0,
  });

  const commitRects = useCallback((nextRects: RectByCardId) => {
    rectByCardIdRef.current = nextRects;
    setRectByCardId(nextRects);
  }, []);

  const commitRows = useCallback((nextRows: RowByCardId) => {
    rowByCardIdRef.current = nextRows;
    setRowByCardId(nextRows);
  }, []);

  const commitAnimating = useCallback((value: boolean) => {
    isAnimatingRef.current = value;
    setIsAnimating(value);
  }, []);

  const commitMain = useCallback((nextMainId: CardId, nextMainSide: Side) => {
    currentMainIdRef.current = nextMainId;
    mainSideRef.current = nextMainSide;
    setCurrentMainId(nextMainId);
    setMainSide(nextMainSide);
  }, []);

  const animate = useCallback(
    (
      duration: number,
      easing: (value: number) => number,
      update: (progress: number) => void,
    ) =>
      new Promise<void>((resolve) => {
        const start = performance.now();

        const tick = (timestamp: number) => {
          if (!mountedRef.current) {
            resolve();
            return;
          }

          const rawT = clamp((timestamp - start) / duration, 0, 1);
          update(easing(rawT));

          if (rawT < 1) {
            rafRef.current = window.requestAnimationFrame(tick);
            return;
          }

          rafRef.current = null;
          resolve();
        };

        rafRef.current = window.requestAnimationFrame(tick);
      }),
    [],
  );

  const wait = useCallback(
    (duration: number) =>
      new Promise<void>((resolve) => {
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null;
          resolve();
        }, duration);
      }),
    [],
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return;
    }

    let scaleFrameId: number | null = null;

    const updateScale = () => {
      const rect = wrapper.getBoundingClientRect();
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const availableWidth = rect.width > 0 ? rect.width : viewportWidth;
      const nextScale = Math.min(
        availableWidth / DESIGN_W,
        viewportHeight / DESIGN_H,
      );

      setScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1);
    };
    const scheduleUpdateScale = () => {
      if (scaleFrameId !== null) {
        return;
      }

      scaleFrameId = window.requestAnimationFrame(() => {
        scaleFrameId = null;
        updateScale();
      });
    };

    updateScale();

    const observer = new ResizeObserver(scheduleUpdateScale);
    observer.observe(wrapper);
    window.addEventListener("resize", scheduleUpdateScale);
    window.visualViewport?.addEventListener("resize", scheduleUpdateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleUpdateScale);
      window.visualViewport?.removeEventListener("resize", scheduleUpdateScale);

      if (scaleFrameId !== null) {
        window.cancelAnimationFrame(scaleFrameId);
      }
    };
  }, []);

  const handleCardClick = useCallback(
    async (clickedId: CardId) => {
      if (isAnimatingRef.current || clickedId === currentMainIdRef.current) {
        return;
      }

      const roles = resolveRoles(currentMainIdRef.current, clickedId);
      const targets = buildPhaseTargets(
        roles,
        mainSideRef.current,
        rowByCardIdRef.current,
      );

      if (!targets) {
        return;
      }

      const { main, target, other } = roles;
      const mainStart = rectByCardIdRef.current[main];
      const targetStart = rectByCardIdRef.current[target];
      const otherStart = rectByCardIdRef.current[other];
      const oldMainSide = targets.oldMainSide;
      const oldSmallSide = targets.oldSmallSide;
      const targetRow = targets.targetRow;
      const otherRow = targets.otherRow;
      const mainShrink = targets.phase1[main];
      const targetWide = targets.phase1[target];
      const otherFull = targets.phase1[other];
      const otherShrink = targets.phase2[other];
      const targetMain = targets.phase3[target];
      const otherDistance = horizontalTravel(otherStart, otherFull, oldMainSide);
      const targetDistance = horizontalTravel(
        targetStart,
        targetWide,
        oldMainSide,
      );
      const rawThreshold = otherDistance === 0 ? 1 : targetDistance / otherDistance;
      const targetThreshold = clamp(rawThreshold, 0.0001, 1);

      commitAnimating(true);
      setZIndexByCardId(buildAnimatingZIndex(roles));
      setTransition({
        phase: "phase1",
        roles,
        mainProgress: 0,
        targetProgress: 0,
      });

      await animate(PHASE_ONE_DURATION, easeInCubic, (progress) => {
        const otherProgress = progress;
        const targetProgress = Math.min(progress / targetThreshold, 1);
        const mainProgress = targetProgress;

        commitRects({
          ...rectByCardIdRef.current,
          [main]: interpolateRect(mainStart, mainShrink, mainProgress),
          [target]: interpolateRect(targetStart, targetWide, targetProgress),
          [other]: interpolateRect(otherStart, otherFull, otherProgress),
        });
        setTransition({
          phase: "phase1",
          roles,
          mainProgress,
          targetProgress,
        });
      });

      if (!mountedRef.current) {
        return;
      }

      commitRects({
        ...rectByCardIdRef.current,
        [main]: mainShrink,
        [target]: targetWide,
        [other]: otherFull,
      });
      setTransition({
        phase: "hold",
        roles,
        mainProgress: 1,
        targetProgress: 1,
      });

      await wait(HOLD_DURATION);

      if (!mountedRef.current) {
        return;
      }

      setTransition({
        phase: "phase2",
        roles,
        mainProgress: 1,
        targetProgress: 1,
      });
      await animate(PHASE_TWO_DURATION, easeInCubic, (progress) => {
        commitRects({
          ...rectByCardIdRef.current,
          [main]: mainShrink,
          [target]: targetWide,
          [other]: interpolateRect(otherFull, otherShrink, progress),
        });
      });

      if (!mountedRef.current) {
        return;
      }

      commitRects({
        ...rectByCardIdRef.current,
        [main]: mainShrink,
        [target]: targetWide,
        [other]: otherShrink,
      });
      setTransition({
        phase: "phase3",
        roles,
        mainProgress: 1,
        targetProgress: 0,
      });

      await animate(PHASE_THREE_DURATION, phaseThreeEase, (progress) => {
        commitRects({
          ...rectByCardIdRef.current,
          [main]: mainShrink,
          [target]: interpolateRect(targetWide, targetMain, progress),
          [other]: otherShrink,
        });
        setTransition({
          phase: "phase3",
          roles,
          mainProgress: 1,
          targetProgress: progress,
        });
      });

      if (!mountedRef.current) {
        return;
      }

      const finalRects: RectByCardId = {
        ...rectByCardIdRef.current,
        [main]: smallSlot(oldMainSide, targetRow),
        [target]: mainSlot(oldSmallSide),
        [other]: smallSlot(oldMainSide, otherRow),
      };
      const finalRows: RowByCardId = {
        ...rowByCardIdRef.current,
        [main]: targetRow,
        [target]: null,
        [other]: otherRow,
      };

      commitRects(finalRects);
      commitRows(finalRows);
      commitMain(target, oldSmallSide);
      setZIndexByCardId(buildStableZIndex(target));
      setTransition({
        phase: "stable",
        roles: null,
        mainProgress: 0,
        targetProgress: 0,
      });
      commitAnimating(false);
    },
    [animate, commitAnimating, commitMain, commitRects, commitRows, wait],
  );

  const getContentState = (id: CardId) => {
    if (!transition.roles || transition.phase === "stable") {
      return {
        isMain: id === currentMainId,
        headerScale: id === currentMainId ? 1 : TITLE_COMPACT_SCALE,
        bodyOpacity: id === currentMainId ? 1 : 0,
        bodyScale: id === currentMainId ? 1 : TITLE_COMPACT_SCALE,
        buttonOpacity: id === currentMainId ? 0 : 1,
      };
    }

    const { roles, phase, mainProgress, targetProgress } = transition;

    if (id === roles.main && phase === "phase1") {
      const headerScale =
        1 - (1 - TITLE_COMPACT_SCALE) * clamp(mainProgress, 0, 1);

      return {
        isMain: false,
        headerScale,
        bodyOpacity: 1 - smoothStep(0.32, 0.78, mainProgress),
        bodyScale: headerScale,
        buttonOpacity: smoothStep(0.68, 1, mainProgress),
      };
    }

    if (id === roles.target && phase === "phase3") {
      const headerScale =
        TITLE_COMPACT_SCALE +
        (1 - TITLE_COMPACT_SCALE) * clamp(targetProgress, 0, 1);

      return {
        isMain: true,
        headerScale,
        bodyOpacity: smoothStep(0.42, 1, targetProgress),
        bodyScale: 1,
        buttonOpacity: 1 - smoothStep(0, 0.34, targetProgress),
      };
    }

    return {
      isMain: false,
      headerScale: TITLE_COMPACT_SCALE,
      bodyOpacity: 0,
      bodyScale: TITLE_COMPACT_SCALE,
      buttonOpacity: 1,
    };
  };

  return (
    <section
      className={styles.section}
      aria-label="Ability Cards Tetris Flow"
      style={{ "--ability-cards-scale": scale } as CSSProperties}
    >
      <div
        ref={wrapperRef}
        className={styles.wrapper}
      >
        <div className={styles.canvas}>
          {cardIds.map((id) => {
            const card = cards[id];
            const rect = rectByCardId[id];
            const content = getContentState(id);
            const isCurrentMain = id === currentMainId;
            const canInteract = !isAnimating && !isCurrentMain;
            const hasCompactButton = content.buttonOpacity > 0;

            return (
              <article
                key={id}
                className={`${styles.card} ${canInteract ? styles.cardInteractive : ""} ${
                  hasCompactButton ? styles.compactCard : ""
                }`}
                data-logo-theme="light"
                style={
                  {
                    left: `${rect.x}px`,
                    top: `${rect.y}px`,
                    width: `${rect.w}px`,
                    height: `${rect.h}px`,
                    borderRadius: `${rect.r}px`,
                    zIndex: zIndexByCardId[id],
                  } as CSSProperties
                }
                aria-current={isCurrentMain ? "true" : undefined}
                onClick={() => handleCardClick(id)}
              >
                <HeaderGroup card={card} scale={content.headerScale} />
                <BodyGroup
                  card={card}
                  opacity={content.bodyOpacity}
                  scale={content.bodyScale}
                />
                <CompactButton opacity={content.buttonOpacity} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AbilityCardsTetrisStage;
