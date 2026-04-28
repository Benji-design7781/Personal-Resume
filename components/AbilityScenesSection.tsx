"use client";

import { useEffect, useRef, useState } from "react";

import { AbilityScenesSvgShell } from "@/components/AbilityScenesSvgShell";
import { LeftPanelShadow } from "@/components/LeftPanelShadow";
import { ReferenceOverlay } from "@/components/ReferenceOverlay";
import { ScaledDesignCanvas } from "@/components/ScaledDesignCanvas";
import { TetrisCardLayer } from "@/components/TetrisCardLayer";

export function AbilityScenesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.22,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative mt-24 w-full overflow-x-hidden pb-24 md:mt-32 md:pb-28 lg:mt-44 lg:pb-[104px] xl:mt-48"
    >
      <div
        className="mx-auto w-full px-4 lg:px-16 xl:px-32 2xl:px-44"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible
            ? "translateY(0) scale(1)"
            : "translateY(36px) scale(0.985)",
          transition:
            "opacity 1.45s cubic-bezier(0.22, 1, 0.36, 1), transform 1.45s cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "opacity, transform",
        }}
      >
        <div className="relative bg-transparent">
          <ScaledDesignCanvas width={1332} height={444}>
            <LeftPanelShadow />
            <AbilityScenesSvgShell />
            <TetrisCardLayer />
            <ReferenceOverlay />
          </ScaledDesignCanvas>
        </div>
      </div>
    </section>
  );
}

export default AbilityScenesSection;
