"use client";

import type { CSSProperties } from "react";

import { sceneCardData, type SceneCardId } from "@/components/sceneCardData";
import type { Rect } from "@/components/sceneSlots";

type SceneCardProps = {
  cardId: SceneCardId;
  rect: Rect;
  role: "main" | "small";
  onClick: (cardId: SceneCardId) => void;
  isInteractive: boolean;
  isAnimating: boolean;
};

const COLORS = {
  panelBlue: "#3767C5",
  cardBg: "#FFFFFF",
  cardBorder: "#D9DEEA",
  line: "#CBD0D8",
  bodyBlue: "#3767C5",
  muted: "#9EA7B8",
  label: "#AAB0BB",
  accent: "#5C83CD",
  iconBlue: "#2C5AB6",
  iconSoft: "#7C95D8",
  shadow: "0 18px 48px rgba(36, 58, 103, 0.14)",
};

const serifFont = '"Noto Serif SC", "Songti SC", Georgia, serif';
const sansFont =
  '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
const interFont = '"Inter", "SF Pro Display", "Segoe UI", sans-serif';

const clampTwoLines: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
};

const clampFourLines: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 4,
  overflow: "hidden",
};

const clampThreeLines: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
  overflow: "hidden",
};

function ArrowBadge({ compact = false }: { compact?: boolean }) {
  const size = compact ? 44 : 50;
  const iconSize = compact ? 18 : 20;

  return (
    <span
      className="inline-flex items-center justify-center rounded-full border-[2px] bg-transparent"
      style={{
        width: size,
        height: size,
        borderColor: COLORS.iconBlue,
        color: COLORS.iconBlue,
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        style={{ width: iconSize, height: iconSize }}
      >
        <path
          d="M9 6L15 12L9 18"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function MainDecoration() {
  return (
    <svg
      aria-hidden="true"
      className="h-[152px] w-[196px]"
      viewBox="0 0 196 152"
      fill="none"
    >
      <path d="M1 78H194" stroke="#AAB7CF" strokeWidth="1.2" />
      <path d="M150 2V151" stroke="#85A3DF" strokeWidth="2" />
      <circle cx="150" cy="78" r="10.5" fill="#3768C6" />
      <rect x="171" y="34" width="25" height="25" fill="#B9C8ED" opacity="0.72" />
      <rect
        x="86.5"
        y="10.5"
        width="82"
        height="86"
        stroke="#CDD4DF"
        strokeWidth="1.1"
        strokeDasharray="4 4"
      />
      <circle cx="49" cy="12" r="5.5" stroke="#3768C6" strokeWidth="1.6" />
      <circle
        cx="87"
        cy="12"
        r="4.2"
        fill="#FFFFFF"
        stroke="#B8C3D4"
        strokeWidth="1.1"
      />
      <path
        d="M188.5 0L192.4 10.6L203 14.4L192.4 18.2L188.5 28.8L184.7 18.2L174.1 14.4L184.7 10.6L188.5 0Z"
        fill="#3768C6"
        transform="translate(-11 20)"
      />
    </svg>
  );
}

function MultiDecoration() {
  return (
    <svg
      aria-hidden="true"
      className="h-[76px] w-[98px]"
      viewBox="0 0 98 76"
      fill="none"
    >
      <ellipse
        cx="46"
        cy="30"
        rx="36"
        ry="13"
        transform="rotate(-28 46 30)"
        stroke="#CBD2DD"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />
      <path
        d="M69 4V72"
        stroke="#CBD2DD"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />
      <circle cx="27" cy="46" r="7.5" fill="#7B95D7" />
      <circle cx="80" cy="16" r="7.5" fill="#7C869C" />
    </svg>
  );
}

function DeliveryDecoration() {
  return (
    <svg
      aria-hidden="true"
      className="h-[82px] w-[84px]"
      viewBox="0 0 84 83"
      fill="none"
    >
      <path
        d="M1 58H12V47H23V37H35V26H47"
        stroke="#CBD2DD"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />
      <rect x="1" y="55" width="5" height="5" fill="#3768C6" />
      <rect x="23" y="35" width="5" height="5" fill="#3768C6" />
      <rect x="45" y="23" width="5" height="5" fill="#62718B" />
      <path
        d="M63 0L66.8 10.6L77.4 14.4L66.8 18.2L63 28.8L59.2 18.2L48.6 14.4L59.2 10.6L63 0Z"
        fill="#3768C6"
      />
    </svg>
  );
}

function BusinessDecoration() {
  return (
    <svg
      aria-hidden="true"
      className="h-[90px] w-[116px]"
      viewBox="0 0 116 90"
      fill="none"
    >
      <path d="M0 47H110" stroke="#C9D3E5" strokeWidth="1.2" />
      <path d="M57 0V89" stroke="#8CA8E2" strokeWidth="1.5" />
      <circle cx="57" cy="47" r="9" fill="#3768C6" />
      <circle cx="14" cy="16" r="5" stroke="#3768C6" strokeWidth="1.4" />
      <rect
        x="84.5"
        y="18.5"
        width="30"
        height="30"
        stroke="#CDD4DF"
        strokeWidth="1.1"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

function SmallDecoration({ cardId }: { cardId: SceneCardId }) {
  if (cardId === "multi") {
    return <MultiDecoration />;
  }

  if (cardId === "delivery") {
    return <DeliveryDecoration />;
  }

  return <BusinessDecoration />;
}

export function SceneCard({
  cardId,
  rect,
  role,
  onClick,
  isInteractive,
  isAnimating,
}: SceneCardProps) {
  const card = sceneCardData[cardId];

  const frameStyle: CSSProperties = {
    left: `${rect.left}%`,
    top: `${rect.top}%`,
    width: `${rect.width}%`,
    height: `${rect.height}%`,
    zIndex: role === "main" ? 30 : 20,
  };

  const interactiveClassName =
    isInteractive && !isAnimating
      ? "cursor-pointer hover:scale-[1.01] hover:shadow-[0_26px_54px_rgba(36,57,103,0.16)]"
      : "cursor-default";

  return (
    <button
      type="button"
      aria-label={card.title}
      aria-pressed={role === "main"}
      className={`absolute overflow-hidden rounded-[22px] border text-left transition-[box-shadow,transform] duration-200 ease-out ${interactiveClassName}`}
      disabled={!isInteractive}
      onClick={() => onClick(cardId)}
      style={{
        ...frameStyle,
        background: COLORS.cardBg,
        borderColor: COLORS.cardBorder,
        boxShadow: COLORS.shadow,
      }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <div
          className="absolute inset-0 transition-opacity duration-150"
          style={{ opacity: role === "main" ? 1 : 0 }}
        >
          <div className="relative h-full px-[37px] pb-[30px] pt-[30px]">
            <p
              className="text-[10px] uppercase tracking-[0.28em]"
              style={{
                color: COLORS.label,
                fontFamily: interFont,
                fontWeight: 700,
              }}
            >
              {card.indexLabel} / ACTIVE SCENE
            </p>

            <h3
              className="mt-[10px] max-w-[220px] text-[33px] leading-[47px] tracking-[-0.05em]"
              style={{
                color: COLORS.panelBlue,
                fontFamily: serifFont,
                fontWeight: 700,
              }}
            >
              {card.title}
            </h3>

            <div
              className="mt-[12px] h-[1.6px] w-[111px]"
              style={{ backgroundColor: COLORS.panelBlue }}
            />

            <p
              className="mt-[30px] max-w-[417px] text-[16px] leading-[25px]"
              style={{
                ...clampFourLines,
                color: COLORS.bodyBlue,
                fontFamily: sansFont,
                fontWeight: 400,
              }}
            >
              {card.description}
            </p>

            <p
              className="mt-[36px] max-w-[345px] text-[16px] leading-[25px]"
              style={{
                ...clampThreeLines,
                color: COLORS.bodyBlue,
                fontFamily: sansFont,
                fontWeight: 400,
              }}
            >
              {card.shortDescription}
            </p>

            <div className="absolute bottom-[18px] right-[20px] text-[#5B84DB]">
              <MainDecoration />
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 transition-opacity duration-150"
          style={{ opacity: role === "small" ? 1 : 0 }}
        >
          <div className="relative h-full px-[27px] pb-[22px] pt-[20px]">
            <p
              className="text-[9.4px] uppercase tracking-[0.24em]"
              style={{
                color: COLORS.muted,
                fontFamily: interFont,
                fontWeight: 700,
              }}
            >
              SCENE {card.indexLabel}
            </p>

            <h3
              className="mt-[8px] max-w-[155px] text-[25.2px] leading-[36px] tracking-[-0.045em]"
              style={{
                ...clampTwoLines,
                color: COLORS.panelBlue,
                fontFamily: serifFont,
                fontWeight: 700,
              }}
            >
              {card.title}
            </h3>

            <div
              className="mt-[10px] h-[1.4px] w-[83px]"
              style={{ backgroundColor: COLORS.line }}
            />

            <p
              className="mt-[18px] max-w-[225px] text-[15.8px] leading-[19px]"
              style={{
                ...clampTwoLines,
                color: COLORS.accent,
                fontFamily: sansFont,
                fontWeight: 700,
              }}
            >
              {card.keywords.join(" / ")}
            </p>

            <div className="absolute bottom-[26px] left-[27px]">
              <ArrowBadge compact />
            </div>

            <div className="absolute bottom-[15px] right-[14px] text-[#7997D8]">
              <SmallDecoration cardId={cardId} />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default SceneCard;
