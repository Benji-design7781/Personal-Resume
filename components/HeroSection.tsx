"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";

import styles from "@/components/HeroSection.module.css";
import { HeroTitleSplitHover } from "@/components/HeroTitleSplitHover";

const DESIGN_WIDTH = 1699;
const DESIGN_HEIGHT = 794;
const PRELOADER_DIGIT_STAGGER = 100;
const PRELOADER_ROLL_DURATION = 700;
const PRELOADER_ROLL_TOTAL =
  PRELOADER_ROLL_DURATION + PRELOADER_DIGIT_STAGGER * 2 + 60;
const PRELOADER_INITIAL_DELAY = 320;
const PRELOADER_AFTER_INITIAL_HOLD = 420;
const PRELOADER_AFTER_MID_HOLD = 560;
const PRELOADER_AFTER_FINAL_HOLD = 940;
const PRELOADER_LEAVE_DURATION = 900;
const PRELOADER_REMOVE_PADDING = 120;
const PRELOADER_LEAVE_DELAY =
  PRELOADER_INITIAL_DELAY +
  PRELOADER_ROLL_TOTAL +
  PRELOADER_AFTER_INITIAL_HOLD +
  PRELOADER_ROLL_TOTAL +
  PRELOADER_AFTER_MID_HOLD +
  PRELOADER_ROLL_TOTAL +
  PRELOADER_AFTER_FINAL_HOLD;
const TITLE_ENTRY_SWEEP_DELAY = PRELOADER_LEAVE_DELAY + 480;
const INTRO_COMPLETE_DELAY = 8800;

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
  transform: "translateX(-50%) translateY(var(--hero-title-intro-y, 0%))",
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

type HeroIntroState = "pending" | "running" | "complete";
type PreloaderPhase = "idle" | "initial" | "hold" | "update" | "leave" | "done";

function getPreloaderRollType(phase: PreloaderPhase) {
  if (phase === "initial" || phase === "update" || phase === "leave") {
    return phase;
  }

  return "hold";
}

function splitDigits(value: string) {
  return value.padStart(3, "0").slice(-3).split("");
}

function HeroIntroPreloader() {
  const [phase, setPhase] = useState<PreloaderPhase>("idle");
  const [digits, setDigits] = useState(() => splitDigits("000"));
  const [nextDigits, setNextDigits] = useState(() => splitDigits("000"));
  const [rollKey, setRollKey] = useState(0);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (motionQuery.matches) {
      setPhase("done");
      return;
    }

    const timers: number[] = [];
    const scheduleAt = (callback: () => void, delay: number) => {
      const timerId = window.setTimeout(callback, delay);

      timers.push(timerId);
    };
    const startUpdate = (targetDigits: string[]) => {
      setNextDigits(targetDigits);
      setRollKey((currentKey) => currentKey + 1);
      setPhase("update");
    };
    const finishRoll = (targetDigits: string[]) => {
      setDigits(targetDigits);
      setPhase("hold");
    };
    const intermediateDigits = splitDigits(
      String(Math.floor(24 + Math.random() * 63)),
    );
    const finalDigits = splitDigits("100");
    let cursor = PRELOADER_INITIAL_DELAY;

    scheduleAt(() => {
      setRollKey((currentKey) => currentKey + 1);
      setPhase("initial");
    }, cursor);

    cursor += PRELOADER_ROLL_TOTAL;
    scheduleAt(() => {
      setPhase("hold");
    }, cursor);

    cursor += PRELOADER_AFTER_INITIAL_HOLD;
    scheduleAt(() => {
      startUpdate(intermediateDigits);
    }, cursor);

    cursor += PRELOADER_ROLL_TOTAL;
    scheduleAt(() => {
      finishRoll(intermediateDigits);
    }, cursor);

    cursor += PRELOADER_AFTER_MID_HOLD;
    scheduleAt(() => {
      startUpdate(finalDigits);
    }, cursor);

    cursor += PRELOADER_ROLL_TOTAL;
    scheduleAt(() => {
      finishRoll(finalDigits);
    }, cursor);

    cursor += PRELOADER_AFTER_FINAL_HOLD;
    scheduleAt(() => {
      setRollKey((currentKey) => currentKey + 1);
      setPhase("leave");
    }, cursor);

    cursor += PRELOADER_LEAVE_DURATION + PRELOADER_REMOVE_PADDING;
    scheduleAt(() => {
      setPhase("done");
    }, cursor);

    return () => {
      timers.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
    };
  }, []);

  if (phase === "done") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={styles.heroIntroPreloader}
      data-preloader-phase={phase}
      data-preloader-roll={getPreloaderRollType(phase)}
    >
      <div className={styles.heroIntroPreloaderNumber}>
        {digits.map((digit, index) => (
          <span
            className={styles.heroIntroPreloaderDigitWrap}
            key={`digit-wrap-${index}`}
            style={{ "--digit-delay": `${index * 100}ms` } as CSSProperties}
          >
            <span
              className={styles.heroIntroPreloaderDigitCurrent}
              key={`current-${rollKey}-${index}`}
            >
              {digit}
            </span>
            <span
              className={styles.heroIntroPreloaderDigitNext}
              key={`next-${rollKey}-${index}`}
            >
              {nextDigits[index]}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  const [introState, setIntroState] = useState<HeroIntroState>("pending");

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrameId: number | null = null;
    let completeTimerId: number | null = null;

    if (motionQuery.matches) {
      setIntroState("complete");
      return;
    }

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    animationFrameId = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      setIntroState("running");
    });
    completeTimerId = window.setTimeout(() => {
      setIntroState("complete");
    }, INTRO_COMPLETE_DELAY);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      if (completeTimerId !== null) {
        window.clearTimeout(completeTimerId);
      }
    };
  }, []);

  return (
    <section
      id="home"
      className={`${styles.heroIntroSection} relative flex min-h-screen w-full justify-center overflow-hidden bg-[#EBEAE4]`}
      data-intro-state={introState}
    >
      <HeroIntroPreloader />

      <div style={stageStyle}>
        <HeroTitleSplitHover
          autoSweepDelay={TITLE_ENTRY_SWEEP_DELAY}
          autoSweepVariant="referenceEntry"
          className={`${styles.heroPosterText} ${styles.heroTitleIntro}`}
          style={titleStyle}
          text="PRODUCT MANAGER"
        />

        <p
          className={`${styles.heroPosterText} ${styles.heroIntroTextReveal}`}
          data-hero-intro="side-copy"
          data-debug-name="hero-left-copy"
          style={{
            ...sideCopyStyle,
            color: "#F19252",
            left: "214px",
            width: "191px",
          }}
        >
          AI AGENT
        </p>

        <p
          className={`${styles.heroPosterText} ${styles.heroIntroTextReveal}`}
          data-hero-intro="side-copy"
          data-debug-name="hero-right-copy"
          style={{
            ...sideCopyStyle,
            color: "#6FA9E7",
            left: "1273px",
            width: "234px",
          }}
        >
          WORKFLOW
        </p>

        <div
          aria-hidden="true"
          className={`${styles.heroVisualWrap} ${styles.heroIntroMedia}`}
          data-debug-name="hero-center-visual"
          data-hero-intro="media"
        >
          <Image
            alt=""
            className={`${styles.heroVisualImage} ${styles.heroIntroMediaImage}`}
            decoding="async"
            draggable={false}
            fetchPriority="high"
            height={289}
            priority
            sizes="514px"
            src="/assets/hero/hero-center-visual.jpg"
            width={514}
          />
        </div>

        <p
          className={`${styles.heroPosterMetaText} ${styles.heroIntroTextReveal}`}
          data-hero-intro="media-caption"
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
          className={`${styles.heroPosterYear} ${styles.heroIntroTextReveal}`}
          data-hero-intro="media-caption"
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
          className={`${styles.heroPosterScroll} ${styles.heroIntroScrollReveal}`}
          data-hero-intro="scroll"
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
