"use client";

import { SMALL_ARROW_RECT } from "@/components/sceneRects";

type ArrowHoverButtonProps = {
  isActive: boolean;
};

const ARROW_BLUE = "#2C5AB6";
const HOVER_DURATION = 260;
const ICON_DURATION = 180;

export function ArrowHoverButton({ isActive }: ArrowHoverButtonProps) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        left: SMALL_ARROW_RECT.x,
        top: SMALL_ARROW_RECT.y,
        width: SMALL_ARROW_RECT.width,
        height: SMALL_ARROW_RECT.height,
        borderRadius: 999,
        overflow: "hidden",
        border: `1.6px solid ${ARROW_BLUE}`,
        background: "transparent",
        color: ARROW_BLUE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
      }}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: ARROW_BLUE,
          transform: isActive ? "scale(1)" : "scale(0)",
          transformOrigin: "center",
          transition: `transform ${HOVER_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      />
      <svg
        viewBox="0 0 28 28"
        className="relative z-[2]"
        style={{
          width: 28,
          height: 28,
          color: isActive ? "#FFFFFF" : ARROW_BLUE,
          transition: `color ${ICON_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      >
        <path
          d="M11.7249 19.95C11.5499 19.95 11.3749 19.88 11.2349 19.74C10.9549 19.46 10.9549 19.0225 11.2349 18.7425L16.4849 13.4925C16.7649 13.2125 17.2024 13.2125 17.4824 13.4925C17.7624 13.7725 17.7624 14.21 17.4824 14.49L12.2324 19.74C12.0749 19.88 11.8999 19.95 11.7249 19.95Z"
          fill="currentColor"
        />
        <path
          d="M16.9749 14.7C16.7999 14.7 16.6249 14.63 16.4849 14.49L11.2349 9.23997C10.9549 8.95997 10.9549 8.52247 11.2349 8.24247C11.5149 7.96247 11.9524 7.96247 12.2324 8.24247L17.4824 13.4925C17.7624 13.7725 17.7624 14.21 17.4824 14.49C17.3249 14.63 17.1499 14.7 16.9749 14.7Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export default ArrowHoverButton;
