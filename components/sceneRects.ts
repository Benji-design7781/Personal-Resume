export type CardId = "business" | "multi" | "delivery";
export type Side = "left" | "right";
export type Row = "top" | "bottom";
export type VisualMode = "main" | "small";
export type ContentRenderMode =
  | "stable-main"
  | "stable-small"
  | "scaled-main"
  | "fixed-small"
  | "hidden";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const CANVAS = {
  width: 1332,
  height: 444,
} as const;

export const RIGHT_EDGE = 1306.82;

export const BLUE_PANEL = {
  x: 390,
  y: 19,
  width: 942,
  height: 406,
} as const;

export const SMALL_CONTENT_RECT = {
  width: 357.98,
  height: 168.32,
} as const;

export const SMALL_ARROW_RECT = {
  x: 27.16,
  y: 120.83,
  width: 28,
  height: 28,
} as const;

export const cardIds: CardId[] = ["business", "multi", "delivery"];

export const cardSlots = {
  LEFT_MAIN: {
    x: 415,
    y: 45,
    width: 517,
    height: 353,
  },
  RIGHT_MAIN: {
    x: 789.82,
    y: 45,
    width: 517,
    height: 353,
  },
  LEFT_TOP: {
    x: 415,
    y: 44.34,
    width: 357.98,
    height: 168.32,
  },
  LEFT_BOTTOM: {
    x: 415,
    y: 228.36,
    width: 357.98,
    height: 168.32,
  },
  RIGHT_TOP: {
    x: 948.84,
    y: 44.34,
    width: 357.98,
    height: 168.32,
  },
  RIGHT_BOTTOM: {
    x: 948.84,
    y: 228.36,
    width: 357.98,
    height: 168.32,
  },
  LEFT_TOP_WIDE: {
    x: 415,
    y: 44.34,
    width: 517,
    height: 168.32,
  },
  LEFT_BOTTOM_WIDE: {
    x: 415,
    y: 228.36,
    width: 517,
    height: 168.32,
  },
  RIGHT_TOP_WIDE: {
    x: 789.82,
    y: 44.34,
    width: 517,
    height: 168.32,
  },
  RIGHT_BOTTOM_WIDE: {
    x: 789.82,
    y: 228.36,
    width: 517,
    height: 168.32,
  },
  TOP_FULL: {
    x: 415,
    y: 44.34,
    width: 891.82,
    height: 168.32,
  },
  BOTTOM_FULL: {
    x: 415,
    y: 228.36,
    width: 891.82,
    height: 168.32,
  },
} as const;

export const INITIAL_CARD_RECTS: Record<CardId, Rect> = {
  business: cardSlots.LEFT_MAIN,
  multi: cardSlots.RIGHT_TOP,
  delivery: cardSlots.RIGHT_BOTTOM,
};

export const INITIAL_VISUAL_MODE: Record<CardId, VisualMode> = {
  business: "main",
  multi: "small",
  delivery: "small",
};

export const CARD_SKINS: Record<CardId, { main: string; small: string }> = {
  business: {
    main: "/assets/ability-scenes/card-business-main.svg",
    small: "/assets/ability-scenes/card-business-small.svg",
  },
  multi: {
    main: "/assets/ability-scenes/card-multi-main.svg",
    small: "/assets/ability-scenes/card-multi-small.svg",
  },
  delivery: {
    main: "/assets/ability-scenes/card-delivery-main.svg",
    small: "/assets/ability-scenes/card-delivery-small.svg",
  },
};

export function oppositeSide(side: Side): Side {
  return side === "left" ? "right" : "left";
}

export function mainSlot(side: Side): Rect {
  return side === "left" ? cardSlots.LEFT_MAIN : cardSlots.RIGHT_MAIN;
}

export function smallSlot(side: Side, row: Row): Rect {
  if (side === "left" && row === "top") return cardSlots.LEFT_TOP;
  if (side === "left" && row === "bottom") return cardSlots.LEFT_BOTTOM;
  if (side === "right" && row === "top") return cardSlots.RIGHT_TOP;
  return cardSlots.RIGHT_BOTTOM;
}

export function wideSlot(side: Side, row: Row): Rect {
  if (side === "left" && row === "top") return cardSlots.LEFT_TOP_WIDE;
  if (side === "left" && row === "bottom") return cardSlots.LEFT_BOTTOM_WIDE;
  if (side === "right" && row === "top") return cardSlots.RIGHT_TOP_WIDE;
  return cardSlots.RIGHT_BOTTOM_WIDE;
}

export function fullSlot(row: Row): Rect {
  return row === "top" ? cardSlots.TOP_FULL : cardSlots.BOTTOM_FULL;
}

export function interpolateRect(from: Rect, to: Rect, progress: number): Rect {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    width: from.width + (to.width - from.width) * progress,
    height: from.height + (to.height - from.height) * progress,
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function easeInCubic(t: number) {
  return t * t * t;
}

export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function movingEdge(rect: Rect, side: Side) {
  return side === "left" ? rect.x : rect.x + rect.width;
}

export function horizontalTravel(from: Rect, to: Rect, side: Side) {
  return Math.abs(movingEdge(to, side) - movingEdge(from, side));
}
