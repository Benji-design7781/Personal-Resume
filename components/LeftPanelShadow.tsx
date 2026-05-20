"use client";

const LEFT_PANEL_SHADOW_RECT = {
  x: 0,
  y: 0,
  width: 1039,
  height: 439,
  radius: 28,
} as const;

export function LeftPanelShadow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-0"
      style={{
        left: LEFT_PANEL_SHADOW_RECT.x,
        top: LEFT_PANEL_SHADOW_RECT.y,
        width: LEFT_PANEL_SHADOW_RECT.width,
        height: LEFT_PANEL_SHADOW_RECT.height,
        borderRadius: LEFT_PANEL_SHADOW_RECT.radius,
        background: "rgba(255, 255, 255, 0.01)",
        boxShadow: "0 30px 90px rgba(31, 65, 132, 0.13)",
      }}
    />
  );
}

export default LeftPanelShadow;
