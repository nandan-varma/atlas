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
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(10, 0, 30, 0.5)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className="relative z-10 w-80 p-5 flex flex-col gap-4"
        style={{
          background: "white",
          borderRadius: 22,
          boxShadow: "var(--shadow-clay-lg)",
          border: "1.5px solid rgba(139, 92, 246, 0.18)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold" style={{ color: "#1e0e4b" }}>
            Export As…
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 transition-all cursor-pointer"
            style={{
              background: "#f7f4ff",
              color: "#9d8ec7",
              boxShadow: "var(--shadow-clay-xs)",
              border: "1.5px solid rgba(139, 92, 246, 0.15)",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Mode selection */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold" style={{ color: "#9d8ec7" }}>
            Export mode
          </p>
          {(["metadata_only", "reencode"] as const).map((m) => (
            <label
              key={m}
              className="flex items-start gap-3 p-3 cursor-pointer transition-all"
              style={{
                borderRadius: 14,
                background: mode === m ? "linear-gradient(135deg, #ede9fe, #fce7f3)" : "#f7f4ff",
                border:
                  mode === m
                    ? "1.5px solid rgba(124, 58, 237, 0.35)"
                    : "1.5px solid rgba(139, 92, 246, 0.15)",
                boxShadow: mode === m ? "var(--shadow-clay-sm)" : "none",
              }}
            >
              <input
                type="radio"
                name="export-mode"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
                className="sr-only"
              />
              <div
                className="mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center"
                style={{
                  background: mode === m ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "white",
                  border: mode === m ? "none" : "2px solid rgba(139, 92, 246, 0.3)",
                  boxShadow: mode === m ? "var(--shadow-clay-xs)" : "none",
                }}
              >
                {mode === m && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#1e0e4b" }}>
                  {m === "metadata_only" ? "Metadata only (fast)" : "Re-encode video"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#9d8ec7" }}>
                  {m === "metadata_only"
                    ? "Stream copy — lossless, seconds to complete"
                    : "Full transcode to H.264/AAC — ensures compatibility"}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* Progress */}
        {saving && (
          <div className="flex flex-col gap-1.5">
            <div
              className="h-2.5 w-full overflow-hidden"
              style={{
                borderRadius: 99,
                background: "rgba(139, 92, 246, 0.12)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div
                className="h-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #8b5cf6, #a855f7)",
                  borderRadius: 99,
                  boxShadow: "0 0 8px rgba(139, 92, 246, 0.5)",
                }}
              />
            </div>
            <p className="text-xs text-right" style={{ color: "#9d8ec7" }}>
              {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {error && (
          <p
            className="text-xs px-3 py-2 rounded-xl"
            style={{
              color: "#ef4444",
              background: "#fff0f0",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleExport}
          disabled={saving}
          className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            borderRadius: 14,
            boxShadow: "var(--shadow-clay-accent)",
          }}
        >
          <Download size={15} />
          {saving ? "Exporting…" : "Choose output & export"}
        </button>
      </div>
    </div>
  );
}
