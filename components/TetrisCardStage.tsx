"use client";

import { AbilityScenesSvgShell } from "@/components/AbilityScenesSvgShell";
import { ReferenceOverlay } from "@/components/ReferenceOverlay";
import { TetrisCardLayer } from "@/components/TetrisCardLayer";

export function TetrisCardStage() {
  return (
    <div className="relative h-full w-full overflow-visible">
      <AbilityScenesSvgShell />
      <TetrisCardLayer />
      <ReferenceOverlay />
    </div>
  );
}

export default TetrisCardStage;
