"use client";

import type { CSSProperties } from "react";

export const ABILITY_INTRO_DESIGN_WIDTH = 1699;
export const ABILITY_INTRO_DESIGN_HEIGHT = 794;

type AbilityScenesIntroContentProps = {
  bottomBufferSvh: number;
  canvasScale: number;
  leftNoteY: number;
  revealRunId: number;
  revealStarted: boolean;
  rightNoteY: number;
  surface: "fixed" | "sticky";
};

const noteBaseStyle = {
  color: "#ffffff",
  display: "flex",
  flexDirection: "column",
  fontFamily: 'var(--font-sans-latin), "Helvetica Neue", Arial, sans-serif',
  fontSize: "18px",
  fontWeight: 700,
  letterSpacing: 0,
  lineHeight: "24px",
  position: "absolute",
  textAlign: "left",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  width: "215px",
} satisfies CSSProperties;

const titleImageStyle = {
  display: "block",
  height: "100%",
  objectFit: "contain",
  width: "100%",
} satisfies CSSProperties;

export function AbilityScenesIntroContent({
  bottomBufferSvh,
  canvasScale,
  leftNoteY,
  revealRunId,
  revealStarted,
  rightNoteY,
  surface,
}: AbilityScenesIntroContentProps) {
  const canvasStyle = {
    height: `${ABILITY_INTRO_DESIGN_HEIGHT}px`,
    left: "50%",
    top: "50%",
    transform: `translate(-50%, -50%) scale(${canvasScale})`,
    transformOrigin: "center center",
    width: `${ABILITY_INTRO_DESIGN_WIDTH}px`,
  } satisfies CSSProperties;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: "#DA9767",
        pointerEvents: "none",
        ["--intro-left-note-y" as string]: `${leftNoteY}px`,
        ["--intro-right-note-y" as string]: `${rightNoteY}px`,
        ["--intro-bottom-buffer-height" as string]: `${bottomBufferSvh}svh`,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 z-0 bg-[#DA9767]"
        style={{ height: "var(--intro-bottom-buffer-height, 30svh)" }}
      />

      <div
        data-transition-intro-canvas={surface}
        key={revealRunId}
        className={`ability-transition-intro-canvas absolute text-white ${
          revealStarted ? "is-intro-played" : ""
        }`}
        style={{
          ...canvasStyle,
          opacity: revealStarted ? 1 : 0,
          zIndex: 1,
        }}
      >
        <div className="typography-scale-layer">
          <div className="ability-scenes-intro-title-svg-line ability-scenes-intro-title-line-1 intro-reveal-mask intro-reveal-ltr intro-delay-0">
            <img
              alt=""
              aria-hidden="true"
              decoding="async"
              loading="lazy"
              src="/assets/ability-intro/ability.svg"
              style={titleImageStyle}
            />
          </div>
          <div className="ability-scenes-intro-title-svg-line ability-scenes-intro-title-line-2 intro-reveal-mask intro-reveal-rtl intro-delay-34">
            <img
              alt=""
              aria-hidden="true"
              decoding="async"
              loading="lazy"
              src="/assets/ability-intro/happen-in.svg"
              style={titleImageStyle}
            />
          </div>
          <div className="ability-scenes-intro-title-svg-line ability-scenes-intro-title-line-3 intro-reveal-mask intro-reveal-ltr intro-delay-68">
            <img
              alt=""
              aria-hidden="true"
              decoding="async"
              loading="lazy"
              src="/assets/ability-intro/scenes.svg"
              style={titleImageStyle}
            />
          </div>

          <div
            className="ability-scenes-intro-note ability-scenes-intro-left-note"
            style={{ ...noteBaseStyle, left: "317px", top: "240px" }}
          >
            <div
              className="ability-scenes-intro-note-motion"
              style={{
                transform:
                  "translate3d(0, var(--intro-left-note-y, 0px), 0)",
              }}
            >
              <div
                className="ability-scenes-intro-note-reveal intro-reveal-mask intro-reveal-rtl intro-delay-82"
              >
                <span>NOT PROJECT LISTS</span>
                <span>BUT CAPABILITY SLICES</span>
              </div>
            </div>
          </div>

          <div
            className="ability-scenes-intro-note ability-scenes-intro-right-note"
            style={{ ...noteBaseStyle, left: "1167px", top: "454px" }}
          >
            <div
              className="ability-scenes-intro-note-motion"
              style={{
                transform:
                  "translate3d(0, var(--intro-right-note-y, 0px), 0)",
              }}
            >
              <div
                className="ability-scenes-intro-note-reveal intro-reveal-mask intro-reveal-ltr intro-delay-82"
              >
                <span>COMPLEX SCENES</span>
                <span>CLEAR SYSTEMS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ability-transition-intro-canvas {
          font-family: "Arial Black", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
        }

        .typography-scale-layer {
          position: absolute;
          inset: 0;
          transform: scale(0.86);
          transform-origin: 50% 52.3%;
        }

        .ability-scenes-intro-title-svg-line {
          position: absolute;
        }

        .ability-scenes-intro-title-line-1 {
          left: 565px;
          top: 85px;
          width: 417px;
          height: 240px;
        }

        .ability-scenes-intro-title-line-2 {
          left: 555px;
          top: 305px;
          width: 582px;
          height: 230px;
        }

        .ability-scenes-intro-title-line-3 {
          left: 555px;
          top: 515px;
          width: 582px;
          height: 230px;
        }

        .intro-reveal-mask {
          overflow: hidden;
          will-change: clip-path;
          animation-duration: 0.66s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: forwards;
        }

        .intro-reveal-ltr {
          clip-path: inset(0 100% 0 0);
        }

        .intro-reveal-rtl {
          clip-path: inset(0 0 0 100%);
        }

        .is-intro-played .intro-reveal-ltr {
          animation-name: introRevealLtr;
        }

        .is-intro-played .intro-reveal-rtl {
          animation-name: introRevealRtl;
        }

        .intro-delay-0 {
          animation-delay: 0s;
        }

        .intro-delay-34 {
          animation-delay: 0.34s;
        }

        .intro-delay-68 {
          animation-delay: 0.68s;
        }

        .intro-delay-82 {
          animation-delay: 0.82s;
        }

        @keyframes introRevealLtr {
          from {
            clip-path: inset(0 100% 0 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes introRevealRtl {
          from {
            clip-path: inset(0 0 0 100%);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        .ability-scenes-intro-note-reveal {
          display: flex;
          flex-direction: column;
        }

        .ability-scenes-intro-note-motion {
          display: flex;
          flex-direction: column;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-reveal-mask {
            animation: none !important;
            clip-path: inset(0 0 0 0) !important;
            will-change: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default AbilityScenesIntroContent;
