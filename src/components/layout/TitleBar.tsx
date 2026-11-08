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
      className="flex h-11 items-center justify-between select-none shrink-0 px-3"
      style={
        {
          background: "white",
          borderRadius: 16,
          boxShadow: "var(--shadow-clay-sm)",
          border: "1.5px solid rgba(139, 92, 246, 0.15)",
          WebkitAppRegion: "drag",
        } as React.CSSProperties
      }
    >
      {/* Left — macOS traffic light spacer + open file */}
      <div
        className="flex items-center gap-1.5 pl-16"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          type="button"
          onClick={onOpenFile}
          title="Open file (⌘O)"
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
          style={{
            background: "#f7f4ff",
            color: "#7c3aed",
            boxShadow: "var(--shadow-clay-xs)",
            border: "1.5px solid rgba(139, 92, 246, 0.18)",
          }}
        >
          <FolderOpen size={13} />
          <span className="hidden sm:inline">Open</span>
        </button>
      </div>

      {/* Center — app name + dirty indicator */}
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-bold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Atlas
        </span>
        {isDirty && (
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              boxShadow: "0 0 6px rgba(249, 115, 22, 0.6)",
            }}
            title="Unsaved changes"
          />
        )}
      </div>

      {/* Right — undo/redo + save */}
      <div
        className="flex items-center gap-1.5"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          className={cn(
            "rounded-xl p-1.5 transition-all",
            canUndo ? "cursor-pointer" : "opacity-30 cursor-not-allowed",
          )}
          style={
            canUndo
              ? {
                  background: "#f7f4ff",
                  color: "#7c3aed",
                  boxShadow: "var(--shadow-clay-xs)",
                  border: "1.5px solid rgba(139, 92, 246, 0.18)",
                }
              : { color: "#c4b5fd" }
          }
        >
          <Undo2 size={13} />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          className={cn(
            "rounded-xl p-1.5 transition-all",
            canRedo ? "cursor-pointer" : "opacity-30 cursor-not-allowed",
          )}
          style={
            canRedo
              ? {
                  background: "#f7f4ff",
                  color: "#7c3aed",
                  boxShadow: "var(--shadow-clay-xs)",
                  border: "1.5px solid rgba(139, 92, 246, 0.18)",
                }
              : { color: "#c4b5fd" }
          }
        >
          <Redo2 size={13} />
        </button>

        <div className="w-px h-5 mx-1" style={{ background: "rgba(139, 92, 246, 0.2)" }} />

        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || saving}
          title={isDirty ? "Save (⌘S)" : "No changes to save"}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
            isDirty && !saving ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
          )}
          style={
            isDirty && !saving
              ? {
                  background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  color: "white",
                  boxShadow: "var(--shadow-clay-accent)",
                }
              : { background: "#f0ebff", color: "#9d8ec7" }
          }
        >
          <Save size={12} />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
