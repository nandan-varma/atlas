import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMetadataStore } from "@/store";

interface TitleBarProps {
  onSave: () => void;
  saving: boolean;
}

export function TitleBar({ onSave, saving }: TitleBarProps) {
  const isDirty = useMetadataStore((s) => s.isDirty);

  return (
    <div
      className="flex h-9 items-center justify-between select-none shrink-0"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Left spacer for macOS traffic lights */}
      <div className="w-20" />

      {/* Title */}
      <div className="flex items-center gap-2 text-sm font-medium text-[--color-foreground]">
        Atlas
        {isDirty && (
          <span className="h-1.5 w-1.5 rounded-full bg-[--color-accent]" title="Unsaved changes" />
        )}
      </div>

      {/* Right actions */}
      <div
        className="flex items-center gap-2 pr-3"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || saving}
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
