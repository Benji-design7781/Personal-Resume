"use client";

import { memo, useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const morphTime = 1.9;
const cooldownTime = 0.6;

const useMorphingText = (texts: string[]) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2 || texts.length === 0) return;

      const safeFraction = Math.max(fraction, 0.0001);
      current2.style.filter = `blur(${Math.min(6 / safeFraction - 6, 100)}px)`;
      current2.style.opacity = `${(0.12 + Math.pow(safeFraction, 0.55) * 0.88) * 100}%`;

      const invertedFraction = 1 - fraction;
      const safeInvertedFraction = Math.max(invertedFraction, 0.0001);
      current1.style.filter = `blur(${Math.min(
        6 / safeInvertedFraction - 6,
        100,
      )}px)`;
      current1.style.opacity = `${(0.08 + Math.pow(safeInvertedFraction, 0.7) * 0.92) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "blur(0.6px)";
      current2.style.opacity = "100%";
      current1.style.filter = "blur(1.6px)";
      current1.style.opacity = "8%";
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doMorph, doCooldown]);

  return { text1Ref, text2Ref };
};

interface MorphingTextProps {
  className?: string;
  texts: string[];
}

const Texts: React.FC<Pick<MorphingTextProps, "texts">> = ({ texts }) => {
  const { text1Ref, text2Ref } = useMorphingText(texts);
  return (
    <>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text1Ref}
      />
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text2Ref}
      />
    </>
  );
};

const SvgFilters: React.FC = () => (
  <svg
    className="fixed h-0 w-0"
    id="filters"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

const MorphingTextComponent: React.FC<MorphingTextProps> = ({
  texts,
  className,
}) => (
  <div
    className={cn(
      "relative mx-auto h-[60px] w-full max-w-none text-center font-coda text-[60px] font-bold leading-[60px] text-orange-400",
      className,
    )}
    style={{ filter: "url(#threshold) blur(0.6px)" }}
  >
    <Texts texts={texts} />
    <SvgFilters />
  </div>
);

export const MorphingText = memo(MorphingTextComponent);
