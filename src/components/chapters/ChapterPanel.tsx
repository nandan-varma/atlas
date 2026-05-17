import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusIcon } from "lucide-react";
import { useChapterStore, useVideoStore } from "@/store";
import { ChapterItem } from "./ChapterItem";

interface ChapterPanelProps {
  videoEl: HTMLVideoElement | null;
}

export function ChapterPanel({ videoEl }: ChapterPanelProps) {
  const chapters = useChapterStore((s) => s.chapters);
  const thumbnails = useChapterStore((s) => s.thumbnails);
  const addChapter = useChapterStore((s) => s.addChapter);
  const reorder = useChapterStore((s) => s.reorder);
  const currentTimeMs = useVideoStore((s) => s.currentTimeMs);
  const durationMs = useVideoStore((s) => s.durationMs);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id));
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[--color-border] shrink-0">
        <span className="text-xs font-semibold text-[--color-foreground]">
          Chapters {chapters.length > 0 && `(${chapters.length})`}
        </span>
        <button
          type="button"
          onClick={() => addChapter(currentTimeMs, durationMs)}
          disabled={durationMs === 0}
          className="flex items-center gap-1 rounded-md bg-[--color-accent] px-2 py-1 text-xs text-white hover:bg-[--color-accent-hover] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Add chapter at current playback position"
        >
          <PlusIcon size={12} />
          Add at {Math.floor(currentTimeMs / 1000)}s
        </button>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto p-2">
        {chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-[--color-muted]">
            <p className="text-xs text-center">
              No chapters yet. Play the video and click "Add" to mark chapter points.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={chapters.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-1.5">
                {chapters.map((chapter) => (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    thumbnail={thumbnails[chapter.id]}
                    videoEl={videoEl}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
