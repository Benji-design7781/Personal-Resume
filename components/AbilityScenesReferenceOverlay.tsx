"use client";

const SHOW_REFERENCE = false;

export function AbilityScenesReferenceOverlay() {
  if (!SHOW_REFERENCE || process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[999]"
      style={{ opacity: 0.35 }}
    >
      <img
        src="/ability-scenes.svg"
        alt=""
        className="block h-full w-full object-contain"
        draggable={false}
      />
    </div>
  );
}

export default AbilityScenesReferenceOverlay;
