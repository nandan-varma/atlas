import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Camera, GripVertical, ImagePlus, Loader2, Trash2 } from "lucide-react";
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
  };

  const handleCapture = async () => {
    setCapturing(true);
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
      style={{
        ...style,
        opacity: isDragging ? 0.5 : 1,
        background: "white",
        borderRadius: 14,
        boxShadow: isDragging ? "var(--shadow-clay)" : "var(--shadow-clay-sm)",
        border: "1.5px solid rgba(139, 92, 246, 0.12)",
        transform: isDragging
          ? `${CSS.Transform.toString(transform)} scale(1.02)`
          : (CSS.Transform.toString(transform) ?? undefined),
      }}
      className="flex items-center gap-2 p-2 group"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing shrink-0 rounded-lg p-1 transition-colors"
        style={{ color: "rgba(139, 92, 246, 0.35)" }}
      >
        <GripVertical size={14} />
      </button>

      {/* Thumbnail */}
      <div
        className="relative shrink-0 h-10 w-16 overflow-hidden flex items-center justify-center"
        style={{
          borderRadius: 10,
          background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
          boxShadow: "inset 0 2px 6px rgba(124, 58, 237, 0.1)",
        }}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            className="h-full w-full object-cover"
            style={{ borderRadius: 10 }}
          />
        ) : capturing ? (
          <Loader2 size={14} style={{ color: "#7c3aed" }} className="animate-spin" />
        ) : (
          <Camera size={14} style={{ color: "rgba(124, 58, 237, 0.5)" }} />
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
            className="w-full text-xs px-2 py-1 outline-none"
            style={{
              background: "#f7f4ff",
              borderRadius: 8,
              border: "1.5px solid rgba(124, 58, 237, 0.4)",
              boxShadow: "0 0 0 3px rgba(124, 58, 237, 0.1)",
              color: "#1e0e4b",
            }}
          />
        ) : (
          <p
            className="truncate text-xs font-medium cursor-text"
            style={{ color: "#1e0e4b" }}
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
        onChange={(ms) => updateStartTime(chapter.id, ms)}
      />

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={handleCapture}
          disabled={capturing}
          title="Capture frame"
          className="rounded-lg p-1.5 transition-all cursor-pointer"
          style={{ color: "#9d8ec7", background: "#f7f4ff" }}
        >
          <Camera size={12} />
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Upload image"
          className="rounded-lg p-1.5 transition-all cursor-pointer"
          style={{ color: "#9d8ec7", background: "#f7f4ff" }}
        >
          <ImagePlus size={12} />
        </button>
        <button
          type="button"
          onClick={() => removeChapter(chapter.id)}
          title="Remove chapter"
          className="rounded-lg p-1.5 transition-all cursor-pointer"
          style={{ color: "#ef4444", background: "#fff0f0" }}
        >
          <Trash2 size={12} />
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
