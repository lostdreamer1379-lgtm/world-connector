import { useEffect } from "react";
import { World } from "../../types/world";
import { Orientation } from "../../hooks/useViewportOrientation";
import { useDragInteraction } from "../../hooks/useDragInteraction";
import { SpatialRotationApi } from "../../hooks/useSpatialRotation";
import { computeCardTransform, getLayoutConfig, getVisibleCards } from "../../geometry/spatialLayout";
import SpatialWorldCard from "./SpatialWorldCard";
import NavigationControls from "./NavigationControls";

interface SpatialStageProps {
  worlds: World[];
  orientation: Orientation;
  rotation: SpatialRotationApi;
  onEnter: (index: number) => void;
  enteringIndex: number | null;
}

/**
 * Renders the spatial arrangement and wires up every way of navigating
 * it — drag/swipe (via useDragInteraction → rotation.dragBy/endDrag),
 * clicking a card or the side controls (rotation.goTo/step), and arrow
 * keys — all driving the same continuous `rotation` engine, so there is
 * exactly one source of truth for where focus is.
 */
export default function SpatialStage({ worlds, orientation, rotation, onEnter, enteringIndex }: SpatialStageProps) {
  const layout = getLayoutConfig(orientation, window.innerWidth, window.innerHeight);
  const roundedIndex = worlds.length
    ? ((Math.round(rotation.position) % worlds.length) + worlds.length) % worlds.length
    : 0;

  const dragHandlers = useDragInteraction({
    orientation,
    pixelsPerIndex: layout.spacing,
    onDragStart: rotation.beginDrag,
    onDragMove: rotation.dragBy,
    onDragEnd: rotation.endDrag,
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const prevKeys = orientation === "horizontal" ? ["ArrowLeft"] : ["ArrowUp"];
      const nextKeys = orientation === "horizontal" ? ["ArrowRight"] : ["ArrowDown"];

      if (prevKeys.includes(event.key)) rotation.step(-1);
      else if (nextKeys.includes(event.key)) rotation.step(1);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [orientation, rotation]);

  const visibleCards = getVisibleCards(worlds.length, rotation.position, layout.maxVisibleOffset);

  return (
    <div
      className="relative h-full w-full touch-none select-none"
      style={{ perspective: 1600, perspectiveOrigin: "50% 50%", touchAction: "none" }}
      {...dragHandlers}
    >
      {visibleCards.map(({ index, offset }) => (
        <SpatialWorldCard
          key={worlds[index].id}
          world={worlds[index]}
          transform={computeCardTransform(index, offset, layout)}
          isFocused={index === roundedIndex}
          isEntering={index === enteringIndex}
          onSelect={(selectedIndex) => {
            if (selectedIndex === roundedIndex) onEnter(selectedIndex);
            else rotation.goTo(selectedIndex);
          }}
        />
      ))}

      <NavigationControls
        orientation={orientation}
        onPrev={() => rotation.step(-1)}
        onNext={() => rotation.step(1)}
        canGoPrev={worlds.length > 1}
        canGoNext={worlds.length > 1}
      />
    </div>
  );
}
