import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Camera, GripVertical, ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useFrameCapture } from "@/hooks/useFrameCapture";
import { useChapterStore, useVideoStore } from "@/store";
import type { Chapter } from "@/types/ipc";
import { TimestampInput } from "./TimestampInput";

interface ChapterItemProps {
  chapter: Chapter;
  thumbnail: string | undefined;
  videoEl: HTMLVideoElement | null;
}

export function ChapterItem({ chapter, thumbnail, videoEl }: ChapterItemProps) {
  const durationMs = useVideoStore((s) => s.durationMs);
  const updateTitle = useChapterStore((s) => s.updateTitle);
  const updateStartTime = useChapterStore((s) => s.updateStartTime);
  const removeChapter = useChapterStore((s) => s.removeChapter);
  const setThumbnail = useChapterStore((s) => s.setThumbnail);
  const { captureAtTime } = useFrameCapture();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(chapter.title);
  const [capturing, setCapturing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCapture = async () => {
    setCapturing(true);
    // Seek video to chapter start first
    if (videoEl) {
      videoEl.currentTime = chapter.start_time_ms / 1000;
      await new Promise((r) => setTimeout(r, 100));
    }
    await captureAtTime(chapter.id, chapter.start_time_ms, videoEl);
    setCapturing(false);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setThumbnail(chapter.id, reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border border-[--color-border] bg-[--color-surface] p-2 group"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-[--color-muted] hover:text-[--color-foreground] shrink-0"
      >
        <GripVertical size={14} />
      </button>

      {/* Thumbnail */}
      <div className="relative shrink-0 h-9 w-16 rounded overflow-hidden bg-[--color-surface-raised] flex items-center justify-center">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="text-[--color-border]">
            <Camera size={14} />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input
  
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => {
              updateTitle(chapter.id, titleDraft || chapter.title);
              setEditingTitle(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setTitleDraft(chapter.title);
                setEditingTitle(false);
              }
            }}
            className="w-full rounded border border-[--color-accent] bg-[--color-surface-raised] px-1.5 py-0.5 text-xs text-[--color-foreground] outline-none"
          />
        ) : (
          <p
            className="truncate text-xs text-[--color-foreground] cursor-text"
            onDoubleClick={() => {
              setTitleDraft(chapter.title);
              setEditingTitle(true);
            }}
            title="Double-click to edit"
          >
            {chapter.title}
          </p>
        )}
      </div>

      {/* Timestamp */}
      <TimestampInput
        value={chapter.start_time_ms}
        maxMs={durationMs}
        onChange={(ms) => updateStartTime(chapter.id, ms, durationMs)}
      />

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={handleCapture}
          disabled={capturing}
          title="Capture frame"
          className="rounded p-1 text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-raised] cursor-pointer"
        >
          <Camera size={13} />
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Upload image"
          className="rounded p-1 text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-raised] cursor-pointer"
        >
          <ImagePlus size={13} />
        </button>
        <button
          type="button"
          onClick={() => removeChapter(chapter.id)}
          title="Remove chapter"
          className="rounded p-1 text-[--color-muted] hover:text-[--color-destructive] hover:bg-[--color-surface-raised] cursor-pointer"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImageUpload(f);
        }}
      />
    </div>
  );
}
