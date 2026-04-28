"use client";

const SHOW_REFERENCE_OVERLAY = false;

export function ReferenceOverlay() {
  if (!SHOW_REFERENCE_OVERLAY || process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <img
      src="/assets/ability-scenes/ability-scenes-reference.png"
      alt=""
      draggable={false}
      className="pointer-events-none absolute left-0 top-0 z-[999] h-[444px] w-[1332px] select-none opacity-35"
    />
  );
}

export default ReferenceOverlay;
