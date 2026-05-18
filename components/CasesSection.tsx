export function CasesSection() {
  return (
    <section
      id="cases"
      aria-label="Cases"
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#6fa9e7]"
    >
      <h2 className="sr-only">CASES</h2>
      <svg
        aria-hidden="true"
        className="block h-auto w-[min(76vw,980px)] overflow-visible text-white"
        focusable="false"
        viewBox="0 0 1000 260"
      >
        <text
          dominantBaseline="middle"
          fill="currentColor"
          fontFamily="var(--font-gravitica-compressed), Impact, 'Arial Narrow', sans-serif"
          fontSize="248"
          fontWeight="800"
          letterSpacing="0"
          textAnchor="middle"
          textRendering="geometricPrecision"
          x="500"
          y="130"
        >
          CASES
        </text>
      </svg>
    </section>
  );
}

export default CasesSection;
