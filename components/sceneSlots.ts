export type Side = "left" | "right";
export type Row = "top" | "bottom";

export type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const slots = {
  LEFT_MAIN: { left: 0, top: 0, width: 58.03, height: 100 },
  RIGHT_MAIN: { left: 41.97, top: 0, width: 58.03, height: 100 },

  LEFT_TOP: { left: 0, top: 0, width: 40.18, height: 47.68 },
  LEFT_BOTTOM: { left: 0, top: 52.32, width: 40.18, height: 47.68 },

  RIGHT_TOP: { left: 59.82, top: 0, width: 40.18, height: 47.68 },
  RIGHT_BOTTOM: { left: 59.82, top: 52.32, width: 40.18, height: 47.68 },

  LEFT_TOP_WIDE: { left: 0, top: 0, width: 58.03, height: 47.68 },
  LEFT_BOTTOM_WIDE: { left: 0, top: 52.32, width: 58.03, height: 47.68 },

  RIGHT_TOP_WIDE: { left: 41.97, top: 0, width: 58.03, height: 47.68 },
  RIGHT_BOTTOM_WIDE: { left: 41.97, top: 52.32, width: 58.03, height: 47.68 },

  TOP_FULL: { left: 0, top: 0, width: 100, height: 47.68 },
  BOTTOM_FULL: { left: 0, top: 52.32, width: 100, height: 47.68 },
} as const;

export function oppositeSide(side: Side): Side {
  return side === "left" ? "right" : "left";
}

export function mainSlot(side: Side): Rect {
  return side === "left" ? slots.LEFT_MAIN : slots.RIGHT_MAIN;
}

export function smallSlot(side: Side, row: Row): Rect {
  if (side === "left") {
    return row === "top" ? slots.LEFT_TOP : slots.LEFT_BOTTOM;
  }

  return row === "top" ? slots.RIGHT_TOP : slots.RIGHT_BOTTOM;
}

export function wideSlot(side: Side, row: Row): Rect {
  if (side === "left") {
    return row === "top" ? slots.LEFT_TOP_WIDE : slots.LEFT_BOTTOM_WIDE;
  }

  return row === "top" ? slots.RIGHT_TOP_WIDE : slots.RIGHT_BOTTOM_WIDE;
}

export function fullSlot(row: Row): Rect {
  return row === "top" ? slots.TOP_FULL : slots.BOTTOM_FULL;
}

export function interpolateRect(from: Rect, to: Rect, progress: number): Rect {
  return {
    left: from.left + (to.left - from.left) * progress,
    top: from.top + (to.top - from.top) * progress,
    width: from.width + (to.width - from.width) * progress,
    height: from.height + (to.height - from.height) * progress,
  };
}

export function movingEdge(rect: Rect, mainSide: Side): number {
  return mainSide === "left" ? rect.left : rect.left + rect.width;
}

export function horizontalTravel(from: Rect, to: Rect, mainSide: Side): number {
  return Math.abs(movingEdge(to, mainSide) - movingEdge(from, mainSide));
}
