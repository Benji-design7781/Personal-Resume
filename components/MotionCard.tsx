"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { ArrowHoverButton } from "@/components/ArrowHoverButton";
import {
  SMALL_CONTENT_RECT,
  type CardId,
  type ContentRenderMode,
  type Rect,
  type VisualMode,
} from "@/components/sceneRects";

type MotionCardProps = {
  id: CardId;
  rect: Rect;
  skins: {
    main: string;
    small: string;
  };
  visualMode: VisualMode;
  contentRenderMode: ContentRenderMode;
  isAnimating: boolean;
  zIndex: number;
  onClick: () => void;
};

const MAIN_CONTENT_SIZE = {
  width: 517,
  height: 353,
} as const;

const MAIN_SHRINK_SWAP_DURATION = 100;
const FINAL_CONTENT_SWAP_DURATION = 190;

type Presentation = {
  key: string;
  mode: ContentRenderMode;
  src: string;
};

function buildPresentation(
  contentRenderMode: ContentRenderMode,
  skins: { main: string; small: string },
): Presentation {
  let src = skins.small;

  switch (contentRenderMode) {
    case "stable-main":
    case "scaled-main":
      src = skins.main;
      break;
    default:
      src = skins.small;
      break;
  }

  return {
    key: `${contentRenderMode}:${src}`,
    mode: contentRenderMode,
    src,
  };
}

function getLayerBoxStyle(mode: ContentRenderMode, rect: Rect): CSSProperties {
  if (mode === "scaled-main") {
    const scale = Math.min(
      rect.width / MAIN_CONTENT_SIZE.width,
      rect.height / MAIN_CONTENT_SIZE.height,
    );

    return {
      position: "absolute",
      left: 0,
      top: 0,
      width: MAIN_CONTENT_SIZE.width,
      height: MAIN_CONTENT_SIZE.height,
      transformOrigin: "top left",
      transform: `scale(${scale})`,
    };
  }

  if (mode === "fixed-small") {
    return {
      position: "absolute",
      left: 0,
      top: 0,
      width: SMALL_CONTENT_RECT.width,
      height: SMALL_CONTENT_RECT.height,
    };
  }

  if (mode === "hidden") {
    return {
      position: "absolute",
      inset: 0,
      opacity: 0,
    };
  }

  return {
    position: "absolute",
    inset: 0,
  };
}

function getImageStyle(mode: ContentRenderMode): CSSProperties {
  if (mode === "scaled-main") {
    return {
      width: MAIN_CONTENT_SIZE.width,
      height: MAIN_CONTENT_SIZE.height,
      display: "block",
    };
  }

  if (mode === "fixed-small") {
    return {
      width: SMALL_CONTENT_RECT.width,
      height: SMALL_CONTENT_RECT.height,
      display: "block",
    };
  }

  return {
    width: "100%",
    height: "100%",
    display: "block",
  };
}

function shouldShowArrow(mode: ContentRenderMode) {
  return mode === "stable-small" || mode === "fixed-small";
}

export function MotionCard({
  id,
  rect,
  skins,
  visualMode,
  contentRenderMode,
  isAnimating,
  zIndex,
  onClick,
}: MotionCardProps) {
  const radius = contentRenderMode === "stable-main" ? 24 : 22;
  const targetPresentation = useMemo(
    () => buildPresentation(contentRenderMode, skins),
    [contentRenderMode, skins],
  );
  const [currentPresentation, setCurrentPresentation] =
    useState<Presentation>(targetPresentation);
  const [previousPresentation, setPreviousPresentation] =
    useState<null | Presentation>(null);
  const [isContentEntering, setIsContentEntering] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const transitionTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentPresentation.key === targetPresentation.key) {
      return;
    }

    setPreviousPresentation(currentPresentation);
    setCurrentPresentation(targetPresentation);
    setIsContentEntering(false);

    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = window.requestAnimationFrame(() => {
      setIsContentEntering(true);
    });

    transitionTimerRef.current = window.setTimeout(() => {
      setPreviousPresentation(null);
      setIsContentEntering(false);
      transitionTimerRef.current = null;
    }, 220);
  }, [currentPresentation, targetPresentation]);

  const style: CSSProperties = {
    position: "absolute",
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
    zIndex,
    padding: 0,
    margin: 0,
    border: "none",
    background: "transparent",
    overflow: "hidden",
    borderRadius: radius,
  };

  const currentLayerBoxStyle = getLayerBoxStyle(currentPresentation.mode, rect);
  const currentImageStyle = getImageStyle(currentPresentation.mode);
  const previousLayerBoxStyle = previousPresentation
    ? getLayerBoxStyle(previousPresentation.mode, rect)
    : null;
  const previousImageStyle = previousPresentation
    ? getImageStyle(previousPresentation.mode)
    : null;
  const isMainShrinkSwap =
    previousPresentation?.mode === "scaled-main" &&
    currentPresentation.mode === "stable-small";
  const swapDuration = isMainShrinkSwap
    ? MAIN_SHRINK_SWAP_DURATION
    : FINAL_CONTENT_SWAP_DURATION;
  const previousExitScale =
    isMainShrinkSwap || previousPresentation?.mode === "scaled-main"
      ? previousLayerBoxStyle?.transform
      : `${previousLayerBoxStyle?.transform ?? ""} scale(0.995)`.trim();
  const currentEnterScale =
    isMainShrinkSwap || currentPresentation.mode === "stable-small"
      ? currentLayerBoxStyle.transform
      : `${currentLayerBoxStyle.transform ?? ""} scale(0.985)`.trim();
  const shouldRenderArrow = shouldShowArrow(contentRenderMode);

  return (
    <button
      type="button"
      aria-label={id}
      data-card-id={id}
      data-content-mode={contentRenderMode}
      onClick={onClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="appearance-none select-none outline-none focus:outline-none focus-visible:outline-none"
      style={{
        ...style,
        cursor: isAnimating ? "default" : "pointer",
        outline: "none",
        caretColor: "transparent",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "#FFFFFF",
          borderRadius: radius,
          border: "1px solid rgba(231, 236, 246, 0.92)",
          boxShadow: "0 14px 34px rgba(40, 74, 138, 0.08)",
        }}
      />
      {previousPresentation ? (
        <>
          <div
            aria-hidden="true"
            className="current-content pointer-events-none absolute left-0 top-0 select-none"
            style={{
              ...previousLayerBoxStyle,
              opacity: isContentEntering ? 0 : 1,
              transform: isContentEntering
                ? previousExitScale
                : previousLayerBoxStyle?.transform,
              filter: isContentEntering ? "blur(1px)" : "blur(0px)",
              transition:
                `opacity ${swapDuration}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${swapDuration}ms cubic-bezier(0.22, 1, 0.36, 1), filter ${swapDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            <img
              src={previousPresentation.src}
              alt=""
              draggable={false}
              className="pointer-events-none select-none"
              style={previousImageStyle ?? undefined}
            />
          </div>
          <div
            aria-hidden="true"
            data-content-mode={contentRenderMode}
            className="next-content pointer-events-none absolute left-0 top-0 select-none"
            style={{
              ...currentLayerBoxStyle,
              opacity: isContentEntering ? 1 : 0,
              transform: isContentEntering
                ? currentLayerBoxStyle.transform
                : currentEnterScale,
              filter: isContentEntering ? "blur(0px)" : "blur(2px)",
              transition:
                `opacity ${swapDuration}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${swapDuration}ms cubic-bezier(0.22, 1, 0.36, 1), filter ${swapDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            <img
              src={currentPresentation.src}
              alt=""
              draggable={false}
              className="pointer-events-none select-none"
              style={currentImageStyle}
            />
          </div>
        </>
      ) : (
        <div
          aria-hidden="true"
          data-content-mode={contentRenderMode}
          className="current-content pointer-events-none absolute left-0 top-0 select-none"
          style={currentLayerBoxStyle}
        >
          <img
            src={currentPresentation.src}
            alt=""
            draggable={false}
            className="pointer-events-none select-none"
            style={currentImageStyle}
          />
        </div>
      )}
      {shouldRenderArrow ? <ArrowHoverButton isActive={isHovered} /> : null}
    </button>
  );
}

export default MotionCard;
