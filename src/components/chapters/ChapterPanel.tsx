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
  const chapterDurationMs = useChapterStore((s) => s.durationMs);

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

  const canAdd = durationMs > 0 || chapterDurationMs > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ borderBottom: "1.5px solid rgba(139, 92, 246, 0.1)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: "#1e0e4b" }}>
            Chapters
          </span>
          {chapters.length > 0 && (
            <span
              className="inline-flex items-center justify-center h-4 min-w-4 rounded-full text-[10px] font-bold px-1"
              style={{
                background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                color: "#7c3aed",
                boxShadow: "var(--shadow-clay-xs)",
              }}
            >
              {chapters.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => addChapter(currentTimeMs)}
          disabled={!canAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            borderRadius: 12,
            boxShadow: canAdd ? "var(--shadow-clay-accent)" : "none",
          }}
          title="Add chapter at current playback position"
        >
          <PlusIcon size={12} />
          Add at {Math.floor(currentTimeMs / 1000)}s
        </button>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto p-2">
        {chapters.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-3 mx-2 my-2"
            style={{
              background: "#f7f4ff",
              borderRadius: 16,
              border: "2px dashed rgba(139, 92, 246, 0.2)",
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                borderRadius: 12,
                boxShadow: "var(--shadow-clay-xs)",
              }}
            >
              <PlusIcon size={18} style={{ color: "#7c3aed" }} />
            </div>
            <p className="text-xs text-center px-6" style={{ color: "#9d8ec7" }}>
              Play the video and click "Add" to mark chapter points
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
              <div className="flex flex-col gap-2">
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
