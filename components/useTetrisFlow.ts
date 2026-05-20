"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  cardIds,
  cardSlots,
  clamp,
  type ContentRenderMode,
  easeInCubic,
  easeOutCubic,
  fullSlot,
  horizontalTravel,
  INITIAL_CARD_RECTS,
  INITIAL_VISUAL_MODE,
  interpolateRect,
  mainSlot,
  oppositeSide,
  smallSlot,
  type CardId,
  type Rect,
  type Row,
  type Side,
  type VisualMode,
  wideSlot,
} from "@/components/sceneRects";

type RowByCardId = Record<CardId, Row | null>;
type RectByCardId = Record<CardId, Rect>;
type VisualModeByCardId = Record<CardId, VisualMode>;
type ContentRenderModeByCardId = Record<CardId, ContentRenderMode>;
type ZIndexByCardId = Record<CardId, number>;

const PHASE_ONE_DURATION = 640;
const HOLD_AFTER_PHASE_ONE = 400;
const PHASE_TWO_DURATION = 640;
const PHASE_THREE_DURATION = 85;

const INITIAL_ROW_BY_CARD_ID: RowByCardId = {
  business: null,
  multi: "top",
  delivery: "bottom",
};

const INITIAL_Z_INDEX_BY_CARD_ID: ZIndexByCardId = {
  business: 3,
  multi: 2,
  delivery: 2,
};

const INITIAL_CONTENT_RENDER_MODE_BY_CARD_ID: ContentRenderModeByCardId = {
  business: "stable-main",
  multi: "stable-small",
  delivery: "stable-small",
};

function resolveRoles(currentMainId: CardId, clickedId: CardId, allCardIds: CardId[]) {
  const main = currentMainId;
  const target = clickedId;
  const other = allCardIds.find((id) => id !== main && id !== target);

  if (!other) {
    throw new Error("Failed to resolve other card.");
  }

  return { main, target, other };
}

function buildStableZIndex(currentMainId: CardId): ZIndexByCardId {
  return {
    business: currentMainId === "business" ? 3 : 2,
    multi: currentMainId === "multi" ? 3 : 2,
    delivery: currentMainId === "delivery" ? 3 : 2,
  };
}

function buildAnimatingZIndex(target: CardId, main: CardId, other: CardId): ZIndexByCardId {
  return {
    business: other === "business" ? 2 : main === "business" ? 3 : 4,
    multi: other === "multi" ? 2 : main === "multi" ? 3 : 4,
    delivery: other === "delivery" ? 2 : main === "delivery" ? 3 : 4,
  };
}

export function useTetrisFlow() {
  const [currentMainId, setCurrentMainId] = useState<CardId>("business");
  const [mainSide, setMainSide] = useState<Side>("left");
  const [rowByCardId, setRowByCardId] = useState<RowByCardId>(INITIAL_ROW_BY_CARD_ID);
  const [rectByCardId, setRectByCardId] = useState<RectByCardId>(INITIAL_CARD_RECTS);
  const [visualModeByCardId, setVisualModeByCardId] =
    useState<VisualModeByCardId>(INITIAL_VISUAL_MODE);
  const [contentRenderModeByCardId, setContentRenderModeByCardId] =
    useState<ContentRenderModeByCardId>(INITIAL_CONTENT_RENDER_MODE_BY_CARD_ID);
  const [zIndexByCardId, setZIndexByCardId] =
    useState<ZIndexByCardId>(INITIAL_Z_INDEX_BY_CARD_ID);
  const [isAnimating, setIsAnimating] = useState(false);

  const mountedRef = useRef(true);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const currentMainIdRef = useRef(currentMainId);
  const mainSideRef = useRef(mainSide);
  const rowByCardIdRef = useRef(rowByCardId);
  const rectByCardIdRef = useRef(rectByCardId);
  const visualModeByCardIdRef = useRef(visualModeByCardId);
  const contentRenderModeByCardIdRef = useRef(contentRenderModeByCardId);
  const zIndexByCardIdRef = useRef(zIndexByCardId);
  const isAnimatingRef = useRef(isAnimating);

  const commitRects = useCallback((nextRects: RectByCardId) => {
    rectByCardIdRef.current = nextRects;
    setRectByCardId(nextRects);
  }, []);

  const commitRows = useCallback((nextRows: RowByCardId) => {
    rowByCardIdRef.current = nextRows;
    setRowByCardId(nextRows);
  }, []);

  const commitVisualModes = useCallback((nextModes: VisualModeByCardId) => {
    visualModeByCardIdRef.current = nextModes;
    setVisualModeByCardId(nextModes);
  }, []);

  const commitContentRenderModes = useCallback(
    (nextModes: ContentRenderModeByCardId) => {
      contentRenderModeByCardIdRef.current = nextModes;
      setContentRenderModeByCardId(nextModes);
    },
    [],
  );

  const commitZIndices = useCallback((nextZIndices: ZIndexByCardId) => {
    zIndexByCardIdRef.current = nextZIndices;
    setZIndexByCardId(nextZIndices);
  }, []);

  const commitMainState = useCallback((nextMainId: CardId, nextSide: Side) => {
    currentMainIdRef.current = nextMainId;
    mainSideRef.current = nextSide;
    setCurrentMainId(nextMainId);
    setMainSide(nextSide);
  }, []);

  const commitAnimating = useCallback((value: boolean) => {
    isAnimatingRef.current = value;
    setIsAnimating(value);
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

  const wait = useCallback((duration: number) => {
    return new Promise<void>((resolve) => {
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        resolve();
      }, duration);
    });
  }, []);

  useEffect(() => {
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

  const handleCardClick = useCallback(
    async (clickedId: CardId) => {
      if (isAnimatingRef.current || clickedId === currentMainIdRef.current) {
        return;
      }

      const { main, target, other } = resolveRoles(
        currentMainIdRef.current,
        clickedId,
        cardIds,
      );

      const oldMainSide = mainSideRef.current;
      const oldSmallSide = oppositeSide(oldMainSide);

      const targetRow = rowByCardIdRef.current[target];
      const otherRow = rowByCardIdRef.current[other];

      if (!targetRow || !otherRow) {
        return;
      }

      const mainStart = rectByCardIdRef.current[main];
      const targetStart = rectByCardIdRef.current[target];
      const otherStart = rectByCardIdRef.current[other];

      const mainShrink = smallSlot(oldMainSide, targetRow);
      const targetWide = wideSlot(oldSmallSide, targetRow);
      const otherFull = fullSlot(otherRow);
      const otherShrink = smallSlot(oldMainSide, otherRow);
      const targetMain = mainSlot(oldSmallSide);

      const otherDistance = horizontalTravel(otherStart, otherFull, oldMainSide);
      const targetDistance = horizontalTravel(targetStart, targetWide, oldMainSide);
      const rawThreshold = otherDistance === 0 ? 1 : targetDistance / otherDistance;
      const targetThreshold = clamp(rawThreshold, 0.0001, 1);

      commitAnimating(true);
      commitZIndices(buildAnimatingZIndex(target, main, other));
      commitContentRenderModes({
        business: "stable-small",
        multi: "stable-small",
        delivery: "stable-small",
        [main]: "scaled-main",
        [target]: "fixed-small",
        [other]: "fixed-small",
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
      });

      commitRects({
        ...rectByCardIdRef.current,
        [main]: mainShrink,
        [target]: targetWide,
        [other]: otherFull,
      });

      commitContentRenderModes({
        business: "stable-small",
        multi: "stable-small",
        delivery: "stable-small",
        [main]: "stable-small",
        [target]: "fixed-small",
        [other]: "fixed-small",
      });

      await wait(HOLD_AFTER_PHASE_ONE);

      await animate(PHASE_TWO_DURATION, easeInCubic, (progress) => {
        commitRects({
          ...rectByCardIdRef.current,
          [main]: mainShrink,
          [target]: targetWide,
          [other]: interpolateRect(otherFull, otherShrink, progress),
        });
      });

      commitRects({
        ...rectByCardIdRef.current,
        [main]: mainShrink,
        [target]: targetWide,
        [other]: otherShrink,
      });

      commitContentRenderModes({
        business: "stable-small",
        multi: "stable-small",
        delivery: "stable-small",
        [main]: "stable-small",
        [target]: "fixed-small",
      });

      await animate(PHASE_THREE_DURATION, easeOutCubic, (progress) => {
        commitRects({
          ...rectByCardIdRef.current,
          [main]: mainShrink,
          [target]: interpolateRect(targetWide, targetMain, progress),
          [other]: otherShrink,
        });
      });

      const finalRects: RectByCardId = {
        ...rectByCardIdRef.current,
        [main]: smallSlot(oldMainSide, targetRow),
        [target]: mainSlot(oldSmallSide),
        [other]: smallSlot(oldMainSide, otherRow),
      };

      const finalRows: RowByCardId = {
        ...rowByCardIdRef.current,
        [target]: null,
        [main]: targetRow,
        [other]: otherRow,
      };

      const finalVisualModes: VisualModeByCardId = {
        business: "small",
        multi: "small",
        delivery: "small",
        [target]: "main",
      };

      commitRects(finalRects);
      commitRows(finalRows);
      commitVisualModes(finalVisualModes);
      commitContentRenderModes({
        business: "stable-small",
        multi: "stable-small",
        delivery: "stable-small",
        [target]: "stable-main",
      });
      commitMainState(target, oldSmallSide);
      commitZIndices(buildStableZIndex(target));
      commitAnimating(false);
    },
    [
      animate,
      commitAnimating,
      commitContentRenderModes,
      commitMainState,
      commitRects,
      commitRows,
      commitVisualModes,
      commitZIndices,
      wait,
    ],
  );

  return {
    currentMainId,
    mainSide,
    rowByCardId,
    rectByCardId,
    visualModeByCardId,
    contentRenderModeByCardId,
    zIndexByCardId,
    isAnimating,
    handleCardClick,
    cardIds,
    cardSlots,
  };
}

export default useTetrisFlow;
