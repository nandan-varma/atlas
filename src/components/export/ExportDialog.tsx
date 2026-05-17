import { save } from "@tauri-apps/plugin-dialog";
import { Download, X } from "lucide-react";
import { useState } from "react";
import { useExport } from "@/hooks/useExport";
import { useVideoStore } from "@/store";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const filePath = useVideoStore((s) => s.filePath);
  const { save: exportFile, saving, progress, error } = useExport();
  const [mode, setMode] = useState<"metadata_only" | "reencode">("metadata_only");

  if (!open) return null;

  const handleExport = async () => {
    const outputPath = await save({
      defaultPath: filePath?.replace(/\.[^.]+$/, "_export.mp4") ?? undefined,
      filters: [
        { name: "MP4", extensions: ["mp4"] },
        { name: "MKV", extensions: ["mkv"] },
      ],
    });
    if (!outputPath) return;
    await exportFile(outputPath, mode);
    if (!error) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60 cursor-default"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative z-10 w-80 rounded-xl bg-[--color-surface] border border-[--color-border] shadow-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[--color-foreground]">Export As…</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[--color-muted] hover:text-[--color-foreground] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode selection */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[--color-muted] font-medium">Export mode</p>
          {(["metadata_only", "reencode"] as const).map((m) => (
            <label key={m} className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
                className="mt-0.5"
              />
              <div>
                <p className="text-xs font-medium text-[--color-foreground]">
                  {m === "metadata_only" ? "Metadata only (fast)" : "Re-encode video"}
                </p>
                <p className="text-xs text-[--color-muted]">
                  {m === "metadata_only"
                    ? "Stream copy — lossless, seconds to complete"
                    : "Full transcode to H.264/AAC — slower, ensures compatibility"}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* Progress */}
        {saving && (
          <div className="flex flex-col gap-1">
            <div className="h-1.5 w-full rounded-full bg-[--color-border]">
              <div
                className="h-full rounded-full bg-[--color-accent] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[--color-muted]">{Math.round(progress)}% complete</p>
          </div>
        )}

        {error && <p className="text-xs text-[--color-destructive]">{error}</p>}

        <button
          type="button"
          onClick={handleExport}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-[--color-accent] px-4 py-2 text-sm font-medium text-white hover:bg-[--color-accent-hover] disabled:opacity-50 cursor-pointer transition-colors"
        >
          <Download size={15} />
          {saving ? "Exporting…" : "Choose output & export"}
        </button>
      </div>
    </div>
  );
}
