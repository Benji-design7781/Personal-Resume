"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import styles from "./ProductProcessBridgeSection.module.css";

const BRIDGE_SVG_PATH = "/bridge/product-process-bridge.svg";
const BRIDGE_BACKGROUND = "#EBEAE4";
const EXPECTED_VIEW_BOX = "0 0 1699 360";
const EXPECTED_TITLE_LETTER_COUNT = 14;
const TITLE_DELAYS = [0, 52, 94, 168, 218, 286, 348, 520, 586, 654, 724, 808, 892, 948];
const TITLE_DURATIONS = [980, 910, 1060, 940, 1100, 960, 1040, 1020, 930, 1080, 970, 1110, 900, 1000];
const META_DELAYS = [620, 700, 780, 875];
const META_DURATIONS = [720, 660, 720, 680];

type SvgRectData = {
  fill: string | null;
  height: string | null;
  id: string;
  rx: string | null;
  width: string | null;
  x: string | null;
  y: string | null;
};

type SvgPathData = {
  d: string;
  fill: string | null;
  id: string;
};

type SvgElementData =
  | (SvgPathData & { kind: "path" })
  | (SvgRectData & { kind: "rect" });

type SvgData = {
  backgroundRect: SvgRectData;
  elements: SvgElementData[];
  viewBox: string;
};

type BridgeBox = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type BridgeGroup = {
  bbox: BridgeBox;
  elementIds: string[];
  id: string;
  index?: number;
  role: "line" | "meta" | "title";
};

type BridgeCandidate = {
  bbox: DOMRect;
  id: string;
  tagName: string;
};

function toBridgeBox(bbox: DOMRect): BridgeBox {
  return {
    height: bbox.height,
    width: bbox.width,
    x: bbox.x,
    y: bbox.y,
  };
}

function padBridgeBox(box: BridgeBox, padding = 2): BridgeBox {
  return {
    height: box.height + padding * 2,
    width: box.width + padding * 2,
    x: box.x - padding,
    y: box.y - padding,
  };
}

function unionBridgeBoxes(boxes: BridgeBox[]): BridgeBox {
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.width));
  const bottom = Math.max(...boxes.map((box) => box.y + box.height));

  return {
    height: bottom - top,
    width: right - left,
    x: left,
    y: top,
  };
}

function parseBridgeSvg(svgText: string): SvgData {
  const documentSvg = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = documentSvg.querySelector("svg");

  if (!svg) {
    throw new Error("product-process-bridge.svg does not contain an svg root.");
  }

  const viewBox = svg.getAttribute("viewBox") ?? "";

  if (viewBox !== EXPECTED_VIEW_BOX) {
    throw new Error(
      `product-process-bridge.svg viewBox is ${viewBox || "missing"}, expected ${EXPECTED_VIEW_BOX}.`,
    );
  }

  const rectElements = Array.from(svg.querySelectorAll("rect"));
  const backgroundRect = rectElements[0];

  if (!backgroundRect) {
    throw new Error("product-process-bridge.svg is missing its background rect.");
  }

  const toRectData = (rect: SVGRectElement, index: number): SvgRectData => ({
    fill: rect.getAttribute("fill"),
    height: rect.getAttribute("height"),
    id: `bridge-rect-${index}`,
    rx: rect.getAttribute("rx"),
    width: rect.getAttribute("width"),
    x: rect.getAttribute("x"),
    y: rect.getAttribute("y"),
  });

  let pathIndex = 0;
  let rectIndex = 0;
  const elements: SvgElementData[] = [];

  Array.from(svg.children).forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (tagName === "rect") {
      const rect = element as SVGRectElement;
      const rectData = toRectData(rect, rectIndex);

      rectIndex += 1;

      if (rect === backgroundRect) {
        return;
      }

      elements.push({ ...rectData, kind: "rect" });
      return;
    }

    if (tagName === "path") {
      const path = element as SVGPathElement;
      const d = path.getAttribute("d");

      if (!d) {
        throw new Error(`product-process-bridge.svg path ${pathIndex} is missing d data.`);
      }

      elements.push({
        d,
        fill: path.getAttribute("fill"),
        id: `bridge-path-${pathIndex}`,
        kind: "path",
      });
      pathIndex += 1;
    }
  });

  return {
    backgroundRect: toRectData(backgroundRect, 0),
    elements,
    viewBox,
  };
}

function getRectProps(rect: SvgRectData) {
  return {
    fill: rect.fill ?? undefined,
    height: rect.height ?? undefined,
    rx: rect.rx ?? undefined,
    width: rect.width ?? undefined,
    x: rect.x ?? undefined,
    y: rect.y ?? undefined,
  };
}

function getTitleAnimationStyle(index = 0): CSSProperties {
  return {
    "--letter-delay": `${TITLE_DELAYS[index] ?? TITLE_DELAYS.at(-1) ?? 0}ms`,
    "--letter-duration": `${TITLE_DURATIONS[index] ?? TITLE_DURATIONS.at(-1) ?? 860}ms`,
  } as CSSProperties;
}

function getMetaAnimationStyle(index = 0): CSSProperties {
  return {
    "--meta-delay": `${META_DELAYS[index] ?? META_DELAYS.at(-1) ?? 705}ms`,
    "--meta-duration": `${META_DURATIONS[index] ?? META_DURATIONS.at(-1) ?? 610}ms`,
  } as CSSProperties;
}

export function ProductProcessBridgeSection() {
  const maskIdPrefix =
    useId().replace(/[^A-Za-z0-9_-]/g, "") || "product-process-bridge";
  const sectionRef = useRef<HTMLElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const hasPlayedRef = useRef(false);
  const [classificationError, setClassificationError] = useState<string | null>(null);
  const [groups, setGroups] = useState<BridgeGroup[] | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [svgData, setSvgData] = useState<SvgData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(BRIDGE_SVG_PATH)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load ${BRIDGE_SVG_PATH}: ${response.status}`);
        }

        return response.text();
      })
      .then((svgText) => {
        if (!cancelled) {
          setSvgData(parseBridgeSvg(svgText));
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setClassificationError(
            error instanceof Error ? error.message : "Unable to parse product process bridge SVG.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  useLayoutEffect(() => {
    const svg = svgRef.current;

    if (!svg || !svgData || groups || classificationError) {
      return;
    }

    const candidates: BridgeCandidate[] = Array.from(
      svg.querySelectorAll<SVGGElement>("[data-bridge-element-id]"),
    ).map((group) => {
      const shape = group.firstElementChild as SVGGraphicsElement | null;

      if (!shape) {
        throw new Error("Bridge SVG contains an empty animated group.");
      }

      return {
        bbox: shape.getBBox(),
        id: group.dataset.bridgeElementId ?? "",
        tagName: shape.tagName.toLowerCase(),
      };
    });

    const titleLetters = candidates.filter(
      (candidate) => candidate.tagName === "path" && candidate.bbox.height > 100,
    );

    if (titleLetters.length !== EXPECTED_TITLE_LETTER_COUNT) {
      setClassificationError(
        `ProductProcessBridgeSection expected ${EXPECTED_TITLE_LETTER_COUNT} title paths, detected ${titleLetters.length}.`,
      );
      return;
    }

    const lineElements = candidates.filter(
      (candidate) => candidate.bbox.height <= 2 && candidate.bbox.width > 1000,
    );
    const titleIds = new Set(titleLetters.map((candidate) => candidate.id));
    const lineIds = new Set(lineElements.map((candidate) => candidate.id));
    const titleGroups = titleLetters
      .sort((a, b) => a.bbox.x - b.bbox.x)
      .map((candidate, index) => ({
        bbox: padBridgeBox(toBridgeBox(candidate.bbox), 8),
        elementIds: [candidate.id],
        id: `title-${candidate.id}`,
        index,
        role: "title" as const,
      }));
    const lineGroups = lineElements.map((candidate) => ({
      bbox: toBridgeBox(candidate.bbox),
      elementIds: [candidate.id],
      id: `line-${candidate.id}`,
      role: "line" as const,
    }));
    const metaCandidates = candidates.filter(
      (candidate) => !titleIds.has(candidate.id) && !lineIds.has(candidate.id),
    );
    const capsuleRects = metaCandidates.filter(
      (candidate) =>
        candidate.tagName === "rect" &&
        candidate.bbox.height > 10 &&
        candidate.bbox.width > 50,
    );
    const usedMetaIds = new Set<string>();
    const metaGroups = capsuleRects.map((rect) => {
      const rectRight = rect.bbox.x + rect.bbox.width;
      const matchedIds = metaCandidates
        .filter((candidate) => {
          const centerX = candidate.bbox.x + candidate.bbox.width / 2;
          const centerY = candidate.bbox.y + candidate.bbox.height / 2;

          return (
            candidate.id === rect.id ||
            (candidate.tagName === "path" &&
              centerX >= rect.bbox.x &&
              centerX <= rectRight &&
              centerY >= rect.bbox.y - 8 &&
              centerY <= rect.bbox.y + rect.bbox.height + 8)
          );
        })
        .map((candidate) => candidate.id);

      matchedIds.forEach((id) => usedMetaIds.add(id));

      return {
        bbox: unionBridgeBoxes(
          matchedIds
            .map((id) => metaCandidates.find((candidate) => candidate.id === id))
            .filter((candidate): candidate is BridgeCandidate => Boolean(candidate))
            .map((candidate) => toBridgeBox(candidate.bbox)),
        ),
        ids: matchedIds,
      };
    });
    const looseMetaGroups = metaCandidates
      .filter((candidate) => !usedMetaIds.has(candidate.id))
      .map((candidate) => ({
        bbox: toBridgeBox(candidate.bbox),
        ids: [candidate.id],
      }));
    const orderedMetaGroups = [...looseMetaGroups, ...metaGroups]
      .filter((group) => group.ids.length > 0)
      .sort((a, b) => a.bbox.x - b.bbox.x)
      .map((group, index) => ({
        bbox: padBridgeBox(group.bbox, 8),
        elementIds: svgData.elements
          .filter((element) => group.ids.includes(element.id))
          .map((element) => element.id),
        id: `meta-${index}`,
        index,
        role: "meta" as const,
      }));

    setGroups([...titleGroups, ...lineGroups, ...orderedMetaGroups]);
  }, [classificationError, groups, svgData]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || !groups || classificationError) {
      return;
    }

    if (reducedMotion) {
      hasPlayedRef.current = true;
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting || entry.intersectionRatio < 0.35) {
          return;
        }

        if (hasPlayedRef.current) {
          return;
        }

        hasPlayedRef.current = true;
        setVisible(true);
        observer.unobserve(entry.target);
        observer.disconnect();
      },
      { threshold: [0.35] },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [classificationError, groups, reducedMotion]);

  const renderElement = (element: SvgElementData) => {
    if (element.kind === "path") {
      return (
        <path
          d={element.d}
          data-bridge-path={element.id}
          fill={element.fill ?? undefined}
          key={element.id}
        />
      );
    }

    return (
      <rect
        data-bridge-rect={element.id}
        key={element.id}
        {...getRectProps(element)}
      />
    );
  };

  const renderVisualGroups = () => {
    if (!svgData) {
      return null;
    }

    if (!groups) {
      return svgData.elements.map((element) => (
        <g
          className={styles.visualGroup}
          data-bridge-element-id={element.id}
          key={element.id}
        >
          {renderElement(element)}
        </g>
      ));
    }

    return groups.map((group) => {
      const groupElements = svgData.elements.filter((element) =>
        group.elementIds.includes(element.id),
      );
      const maskId = `${maskIdPrefix}-${group.id}`;
      const shouldMask = group.role === "title" || group.role === "meta";

      return (
        <g
          className={styles.visualGroup}
          data-line-path={group.role === "line" ? "true" : undefined}
          data-meta-group={group.role === "meta" ? "true" : undefined}
          data-title-letter={group.role === "title" ? "true" : undefined}
          key={group.id}
          mask={shouldMask ? `url(#${maskId})` : undefined}
          style={
            group.role === "title"
              ? getTitleAnimationStyle(group.index)
              : group.role === "meta"
                ? getMetaAnimationStyle(group.index)
                : undefined
          }
        >
          {groupElements.map(renderElement)}
        </g>
      );
    });
  };

  return (
    <section
      aria-label="Product process: how it gets made, outcome, structure, problem"
      className={styles.section}
      ref={sectionRef}
    >
      <div className={styles.frame}>
        {classificationError ? null : (
          <svg
            aria-hidden="true"
            className={styles.svg}
            data-classified={groups ? "true" : undefined}
            data-reduced-motion={reducedMotion ? "true" : undefined}
            data-visible={visible ? "true" : undefined}
            fill="none"
            height="360"
            ref={svgRef}
            style={{ overflow: "hidden" }}
            viewBox={svgData?.viewBox ?? EXPECTED_VIEW_BOX}
            width="1699"
            xmlns="http://www.w3.org/2000/svg"
          >
            {svgData ? (
              <>
                <rect {...getRectProps(svgData.backgroundRect)} fill={BRIDGE_BACKGROUND} />
                {groups ? (
                  <defs>
                    {groups
                      .filter((group) => group.role === "title" || group.role === "meta")
                      .map((group) => {
                        const maskId = `${maskIdPrefix}-${group.id}`;

                        return (
                          <mask
                            height={group.bbox.height}
                            id={maskId}
                            key={maskId}
                            maskUnits="userSpaceOnUse"
                            width={group.bbox.width}
                            x={group.bbox.x}
                            y={group.bbox.y}
                          >
                            <rect
                              className={styles.revealMaskRect}
                              data-meta-mask-rect={group.role === "meta" ? "true" : undefined}
                              data-title-mask-rect={group.role === "title" ? "true" : undefined}
                              fill="#fff"
                              height={group.bbox.height}
                              style={
                                group.role === "title"
                                  ? getTitleAnimationStyle(group.index)
                                  : getMetaAnimationStyle(group.index)
                              }
                              width={group.bbox.width}
                              x={group.bbox.x}
                              y={group.bbox.y}
                            />
                          </mask>
                        );
                      })}
                  </defs>
                ) : null}
                {renderVisualGroups()}
              </>
            ) : null}
          </svg>
        )}
      </div>
    </section>
  );
}

export default ProductProcessBridgeSection;
