import { FolderOpen, Redo2, Save, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChapterStore, useMetadataStore } from "@/store";

interface TitleBarProps {
  onSave: () => void;
  onOpenFile: () => void;
  saving: boolean;
}

export function TitleBar({ onSave, onOpenFile, saving }: TitleBarProps) {
  const metaIsDirty = useMetadataStore((s) => s.isDirty);
  const chapterIsDirty = useChapterStore((s) => s.isDirty);
  const isDirty = metaIsDirty || chapterIsDirty;

  const undo = useMetadataStore((s) => s.undo);
  const redo = useMetadataStore((s) => s.redo);
  const canUndo = useMetadataStore((s) => s.canUndo());
  const canRedo = useMetadataStore((s) => s.canRedo());

  return (
    <div
      className="flex h-9 items-center justify-between select-none shrink-0 bg-[--color-surface]"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Left — macOS traffic light spacer + open file */}
      <div
        className="flex items-center gap-1 pl-20"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          type="button"
          onClick={onOpenFile}
          title="Open file (⌘O)"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-raised] transition-colors cursor-pointer"
        >
          <FolderOpen size={13} />
          <span className="hidden sm:inline">Open</span>
        </button>
      </div>

      {/* Center — app name + dirty indicator */}
      <div className="flex items-center gap-2 text-sm font-medium text-[--color-foreground]">
        Atlas
        {isDirty && (
          <span className="h-1.5 w-1.5 rounded-full bg-[--color-accent]" title="Unsaved changes" />
        )}
      </div>

      {/* Right — undo/redo + save */}
      <div
        className="flex items-center gap-1 pr-3"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          className={cn(
            "rounded-md p-1 transition-colors",
            canUndo
              ? "text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-raised] cursor-pointer"
              : "text-[--color-border] cursor-not-allowed",
          )}
        >
          <Undo2 size={13} />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          className={cn(
            "rounded-md p-1 transition-colors",
            canRedo
              ? "text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-raised] cursor-pointer"
              : "text-[--color-border] cursor-not-allowed",
          )}
        >
          <Redo2 size={13} />
        </button>

        <div className="w-px h-4 bg-[--color-border] mx-1" />

        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || saving}
          title={isDirty ? "Save (⌘S)" : "No changes to save"}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
            isDirty && !saving
              ? "bg-[--color-accent] text-white hover:bg-[--color-accent-hover] cursor-pointer"
              : "text-[--color-muted] cursor-not-allowed opacity-50",
          )}
        >
          <Save size={12} />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
