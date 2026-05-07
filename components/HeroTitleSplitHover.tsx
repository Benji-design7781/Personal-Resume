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

const CURRENT_DURATION = 680;
const NEXT_DELAY = 160;
const NEXT_DURATION = 680;
const LETTER_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

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
  const currentLetterRefs = useRef(new Map<number, HTMLSpanElement>());
  const nextLetterRefs = useRef(new Map<number, HTMLSpanElement>());
  const letterStatesRef = useRef(new Map<number, LetterAnimationState>());
  const reduceMotionRef = useRef(false);
  const animationTokenRef = useRef(0);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    reduceMotionRef.current = motionQuery.matches;

    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reduceMotionRef.current = event.matches;
    };

    motionQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionPreferenceChange);
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

  const setLetterTransform = (charIndex: number, transform: string) => {
    const currentLetter = currentLetterRefs.current.get(charIndex);
    const nextLetter = nextLetterRefs.current.get(charIndex);

    if (!currentLetter || !nextLetter) {
      return;
    }

    currentLetter.style.transform = transform;
    nextLetter.style.transform = transform;
  };

  const resetLetter = (charIndex: number) => {
    setLetterTransform(charIndex, "translateX(0%)");
  };

  const finishLetter = (charIndex: number) => {
    setLetterTransform(charIndex, "translateX(-100%)");
  };

  const handleLetterPointerEnter = (
    _event: PointerEvent<HTMLSpanElement>,
    charIndex: number,
  ) => {
    const currentLetter = currentLetterRefs.current.get(charIndex);
    const nextLetter = nextLetterRefs.current.get(charIndex);
    const state = letterStatesRef.current.get(charIndex) ?? createLetterState();

    if (!currentLetter || !nextLetter || reduceMotionRef.current) {
      state.currentAnimation?.cancel();
      state.nextAnimation?.cancel();
      if (state.rafId !== null) {
        cancelAnimationFrame(state.rafId);
      }
      state.currentAnimation = null;
      state.nextAnimation = null;
      state.rafId = null;
      state.token = null;
      letterStatesRef.current.set(charIndex, state);
      resetLetter(charIndex);
      return;
    }

    state.currentAnimation?.cancel();
    state.nextAnimation?.cancel();
    if (state.rafId !== null) {
      cancelAnimationFrame(state.rafId);
    }

    animationTokenRef.current += 1;
    const token = `${charIndex}-${animationTokenRef.current}`;
    state.currentAnimation = null;
    state.nextAnimation = null;
    state.token = token;
    resetLetter(charIndex);

    state.rafId = requestAnimationFrame(() => {
      const latestState = letterStatesRef.current.get(charIndex);

      if (!latestState || latestState.token !== token) {
        return;
      }

      const currentAnimation = currentLetter.animate(
        [
          { transform: "translateX(0%)" },
          { transform: "translateX(-100%)" },
        ],
        {
          delay: 0,
          duration: CURRENT_DURATION,
          easing: LETTER_EASING,
          fill: "forwards",
        },
      );
      const nextAnimation = nextLetter.animate(
        [
          { transform: "translateX(0%)" },
          { transform: "translateX(-100%)" },
        ],
        {
          delay: NEXT_DELAY,
          duration: NEXT_DURATION,
          easing: LETTER_EASING,
          fill: "forwards",
        },
      );

      latestState.currentAnimation = currentAnimation;
      latestState.nextAnimation = nextAnimation;
      latestState.rafId = null;
      letterStatesRef.current.set(charIndex, latestState);

      Promise.allSettled([
        currentAnimation.finished.catch(() => undefined),
        nextAnimation.finished.catch(() => undefined),
      ]).then(() => {
        const finishedState = letterStatesRef.current.get(charIndex);

        if (!finishedState || finishedState.token !== token) {
          return;
        }

        finishLetter(charIndex);
        currentAnimation.cancel();
        nextAnimation.cancel();
        finishedState.currentAnimation = null;
        finishedState.nextAnimation = null;
        letterStatesRef.current.set(charIndex, finishedState);
      });
    });
    letterStatesRef.current.set(charIndex, state);
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
          >
            <span
              className={styles.heroTitleLetterCurrent}
              ref={(element) => {
                if (element) {
                  currentLetterRefs.current.set(index, element);
                } else {
                  currentLetterRefs.current.delete(index);
                }
              }}
            >
              {character}
            </span>
            <span
              className={styles.heroTitleLetterNext}
              ref={(element) => {
                if (element) {
                  nextLetterRefs.current.set(index, element);
                } else {
                  nextLetterRefs.current.delete(index);
                }
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
