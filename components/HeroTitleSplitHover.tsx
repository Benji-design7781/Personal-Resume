"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useEffect, useRef } from "react";

import styles from "@/components/HeroSection.module.css";

type HeroTitleSplitHoverProps = {
  className?: string;
  style?: CSSProperties;
  text: string;
};

type LetterAnimationState = {
  currentAnimation: Animation | null;
  nextAnimation: Animation | null;
  rafId: number | null;
  token: string | null;
};

const LETTER_DURATION = 560;
const LETTER_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
const AUTO_SWEEP_DELAY = 220;
const AUTO_SWEEP_STAGGER = 34;

const CURRENT_KEYFRAMES: Keyframe[] = [
  { transform: "translateX(0%)", offset: 0 },
  { transform: "translateX(-32%)", offset: 0.32 },
  { transform: "translateX(-72%)", offset: 0.68 },
  { transform: "translateX(-100%)", offset: 1 },
];

const NEXT_KEYFRAMES: Keyframe[] = [
  { transform: "translateX(100%)", offset: 0 },
  { transform: "translateX(68%)", offset: 0.32 },
  { transform: "translateX(28%)", offset: 0.68 },
  { transform: "translateX(0%)", offset: 1 },
];

function createLetterState(): LetterAnimationState {
  return {
    currentAnimation: null,
    nextAnimation: null,
    rafId: null,
    token: null,
  };
}

export function HeroTitleSplitHover({
  className,
  style,
  text,
}: HeroTitleSplitHoverProps) {
  const wrapperLetterRefs = useRef(new Map<number, HTMLSpanElement>());
  const currentLetterRefs = useRef(new Map<number, HTMLSpanElement>());
  const nextLetterRefs = useRef(new Map<number, HTMLSpanElement>());
  const letterStatesRef = useRef(new Map<number, LetterAnimationState>());
  const pendingAutoSweepTimersRef = useRef<number[]>([]);
  const animationTokenRef = useRef(0);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    reduceMotionRef.current = motionQuery.matches;

    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reduceMotionRef.current = event.matches;
    };

    motionQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      pendingAutoSweepTimersRef.current.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      pendingAutoSweepTimersRef.current = [];

      letterStatesRef.current.forEach((state) => {
        if (state.rafId !== null) {
          cancelAnimationFrame(state.rafId);
        }
        state.currentAnimation?.cancel();
        state.nextAnimation?.cancel();
      });

      letterStatesRef.current.clear();
    };
  }, []);

  const setIdleTransform = (charIndex: number) => {
    const currentLetter = currentLetterRefs.current.get(charIndex);
    const nextLetter = nextLetterRefs.current.get(charIndex);

    if (!currentLetter || !nextLetter) {
      return;
    }

    currentLetter.style.transform = "translateX(0%)";
    nextLetter.style.transform = "translateX(100%)";
  };

  const clearLetterWork = (state: LetterAnimationState) => {
    if (state.rafId !== null) {
      cancelAnimationFrame(state.rafId);
    }
    state.currentAnimation?.cancel();
    state.nextAnimation?.cancel();
    state.currentAnimation = null;
    state.nextAnimation = null;
    state.rafId = null;
  };

  const playLetterAnimation = (charIndex: number) => {
    const currentLetter = currentLetterRefs.current.get(charIndex);
    const nextLetter = nextLetterRefs.current.get(charIndex);
    const state = letterStatesRef.current.get(charIndex) ?? createLetterState();

    if (!currentLetter || !nextLetter) {
      clearLetterWork(state);
      state.token = null;
      letterStatesRef.current.set(charIndex, state);
      return;
    }

    clearLetterWork(state);
    animationTokenRef.current += 1;
    const token = `${charIndex}-${animationTokenRef.current}`;
    state.token = token;
    setIdleTransform(charIndex);
    letterStatesRef.current.set(charIndex, state);

    if (reduceMotionRef.current) {
      return;
    }

    state.rafId = requestAnimationFrame(() => {
      const latestState = letterStatesRef.current.get(charIndex);

      if (!latestState || latestState.token !== token) {
        return;
      }

      latestState.rafId = null;

      const currentAnimation = currentLetter.animate(CURRENT_KEYFRAMES, {
        delay: 0,
        duration: LETTER_DURATION,
        easing: LETTER_EASING,
        fill: "both",
      });
      const nextAnimation = nextLetter.animate(NEXT_KEYFRAMES, {
        delay: 0,
        duration: LETTER_DURATION,
        easing: LETTER_EASING,
        fill: "both",
      });

      latestState.currentAnimation = currentAnimation;
      latestState.nextAnimation = nextAnimation;
      letterStatesRef.current.set(charIndex, latestState);

      Promise.allSettled([
        currentAnimation.finished.catch(() => undefined),
        nextAnimation.finished.catch(() => undefined),
      ]).then(() => {
        const finishedState = letterStatesRef.current.get(charIndex);

        if (!finishedState || finishedState.token !== token) {
          return;
        }

        currentAnimation.cancel();
        nextAnimation.cancel();
        finishedState.currentAnimation = null;
        finishedState.nextAnimation = null;
        setIdleTransform(charIndex);
        letterStatesRef.current.set(charIndex, finishedState);
      });
    });

    letterStatesRef.current.set(charIndex, state);
  };

  useEffect(() => {
    Array.from(text).forEach((character, charIndex) => {
      if (character !== " ") {
        setIdleTransform(charIndex);
      }
    });

    if (reduceMotionRef.current) {
      return;
    }

    pendingAutoSweepTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    pendingAutoSweepTimersRef.current = [];

    Array.from(text).forEach((character, charIndex) => {
      if (character === " ") {
        return;
      }

      const timerId = window.setTimeout(() => {
        playLetterAnimation(charIndex);
      }, AUTO_SWEEP_DELAY + charIndex * AUTO_SWEEP_STAGGER);
      pendingAutoSweepTimersRef.current.push(timerId);
    });

    return () => {
      pendingAutoSweepTimersRef.current.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      pendingAutoSweepTimersRef.current = [];
    };
  }, [text]);

  const handleLetterPointerEnter = (
    _event: PointerEvent<HTMLSpanElement>,
    charIndex: number,
  ) => {
    playLetterAnimation(charIndex);
  };

  return (
    <h1
      aria-label={text}
      className={[styles.heroSplitTitle, className].filter(Boolean).join(" ")}
      data-debug-name="hero-title"
      data-debug-role="split-letter-title"
      spellCheck={false}
      style={style}
    >
      {Array.from(text).map((character, index) => {
        if (character === " ") {
          return " ";
        }

        return (
          <span
            aria-hidden="true"
            className={styles.heroTitleLetterWrapper}
            data-debug-name="hero-title-letter"
            data-letter-index={index}
            key={`${character}-${index}`}
            onPointerEnter={(event) => handleLetterPointerEnter(event, index)}
            ref={(element) => {
              if (element) {
                wrapperLetterRefs.current.set(index, element);
              } else {
                wrapperLetterRefs.current.delete(index);
              }
            }}
            style={{
              position: "relative",
              display: "inline-block",
              verticalAlign: "baseline",
              overflow: "visible",
              clipPath: "inset(-0.24em 0 -0.24em 0)",
              cursor: "default",
            }}
          >
            <span
              className={styles.heroTitleLetterCurrent}
              ref={(element) => {
                if (element) {
                  currentLetterRefs.current.set(index, element);
                  element.style.transform = "translateX(0%)";
                } else {
                  currentLetterRefs.current.delete(index);
                }
              }}
              style={{
                display: "block",
                transform: "translateX(0%)",
                willChange: "transform",
                pointerEvents: "none",
              }}
            >
              {character}
            </span>
            <span
              className={styles.heroTitleLetterNext}
              ref={(element) => {
                if (element) {
                  nextLetterRefs.current.set(index, element);
                  element.style.transform = "translateX(100%)";
                } else {
                  nextLetterRefs.current.delete(index);
                }
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                display: "block",
                transform: "translateX(100%)",
                willChange: "transform",
                pointerEvents: "none",
              }}
            >
              {character}
            </span>
          </span>
        );
      })}
    </h1>
  );
}
