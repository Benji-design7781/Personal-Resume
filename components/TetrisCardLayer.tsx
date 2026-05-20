"use client";

import { MotionCard } from "@/components/MotionCard";
import {
  CARD_SKINS,
  cardIds,
  type CardId,
  type VisualMode,
} from "@/components/sceneRects";
import { useTetrisFlow } from "@/components/useTetrisFlow";

export function TetrisCardLayer() {
  const {
    rectByCardId,
    visualModeByCardId,
    contentRenderModeByCardId,
    zIndexByCardId,
    isAnimating,
    handleCardClick,
  } = useTetrisFlow();

  return (
    <div className="absolute inset-0 z-[2]">
      {cardIds.map((id) => (
        <MotionCard
          key={id}
          id={id}
          rect={rectByCardId[id]}
          skins={CARD_SKINS[id]}
          visualMode={visualModeByCardId[id] as VisualMode}
          contentRenderMode={contentRenderModeByCardId[id]}
          isAnimating={isAnimating}
          zIndex={zIndexByCardId[id]}
          onClick={() => handleCardClick(id)}
        />
      ))}
    </div>
  );
}

export default TetrisCardLayer;
