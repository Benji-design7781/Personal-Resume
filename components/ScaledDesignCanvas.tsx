"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

export const BASE_WIDTH = 1332;
export const BASE_HEIGHT = 444;

type ScaledDesignCanvasProps = {
  children: ReactNode;
  className?: string;
  width?: number;
  height?: number;
};

export function ScaledDesignCanvas({
  children,
  className,
  width = BASE_WIDTH,
  height = BASE_HEIGHT,
}: ScaledDesignCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateScale = () => {
      const nextScale = Math.min(
        Math.max(element.clientWidth / width, 0.0001),
        1,
      );
      setScale(nextScale);
    };

    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className ?? "relative w-full"}>
      <div style={{ height: height * scale }}>
        <div
          className="relative"
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default ScaledDesignCanvas;
