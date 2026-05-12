import type { CSSProperties } from "react";

import styles from "@/components/HeroSection.module.css";
import { HeroTitleSplitHover } from "@/components/HeroTitleSplitHover";

const DESIGN_WIDTH = 1699;
const DESIGN_HEIGHT = 794;

const posterFont = {
  fontFamily:
    'var(--font-gravitica-compressed), Impact, "Arial Narrow", sans-serif',
  color: "#090909",
  letterSpacing: "0.01em",
} satisfies CSSProperties;

const smallPosterText = {
  color: "#090909",
  letterSpacing: "0.01em",
} satisfies CSSProperties;

const stageStyle = {
  position: "relative",
  width: `${DESIGN_WIDTH}px`,
  height: `${DESIGN_HEIGHT}px`,
  flex: "0 0 auto",
} satisfies CSSProperties;

const titleStyle = {
  ...posterFont,
  position: "absolute",
  left: "50%",
  top: "95px",
  transform: "translateX(-50%)",
  margin: 0,
  fontSize: "320px",
  fontWeight: 800,
  lineHeight: 0.82,
  whiteSpace: "nowrap",
} satisfies CSSProperties;

const sideCopyStyle = {
  ...posterFont,
  position: "absolute",
  top: "502px",
  height: "110px",
  margin: 0,
  fontSize: "88px",
  fontWeight: 600,
  lineHeight: "110px",
  whiteSpace: "nowrap",
} satisfies CSSProperties;

const microCopyStyle = {
  ...smallPosterText,
  position: "absolute",
  top: "401px",
  height: "14px",
  margin: 0,
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "14px",
  whiteSpace: "nowrap",
} satisfies CSSProperties;

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen w-full justify-center overflow-hidden bg-[#F3F3F7]"
    >
      <div style={stageStyle}>
        <HeroTitleSplitHover
          className={styles.heroPosterText}
          style={titleStyle}
          text="PRODUCT MANAGER"
        />

        <p
          className={styles.heroPosterText}
          data-debug-name="hero-left-copy"
          style={{
            ...sideCopyStyle,
            color: "#EA9B45",
            left: "214px",
            width: "191px",
          }}
        >
          AI AGENT
        </p>

        <p
          className={styles.heroPosterText}
          data-debug-name="hero-right-copy"
          style={{
            ...sideCopyStyle,
            color: "#2FBFED",
            left: "1273px",
            width: "234px",
          }}
        >
          WORKFLOW
        </p>

        <div
          aria-hidden="true"
          className={styles.heroVisualWrap}
          data-debug-name="hero-center-visual"
        >
          <img
            alt=""
            className={styles.heroVisualImage}
            draggable={false}
            src="/assets/hero/hero-center-visual.jpg"
          />
        </div>

        <p
          className={styles.heroPosterMetaText}
          data-debug-name="hero-system-design"
          style={{
            ...microCopyStyle,
            left: "619px",
            width: "97px",
          }}
        >
          SYSTEM DESIGN
        </p>

        <p
          className={styles.heroPosterYear}
          data-debug-name="hero-year"
          style={{
            ...microCopyStyle,
            left: "1103px",
            width: "30px",
          }}
        >
          2026
        </p>

        <p
          className={styles.heroPosterScroll}
          data-debug-name="hero-scroll-down"
          style={{
            ...smallPosterText,
            position: "absolute",
            left: "820px",
            top: "764px",
            width: "112px",
            height: "18px",
            margin: 0,
            fontSize: "15px",
            fontWeight: 600,
            lineHeight: "18px",
            whiteSpace: "nowrap",
          }}
        >
          SCROLL DOWN
        </p>
      </div>
    </section>
  );
}
