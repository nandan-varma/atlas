import { formatDuration } from "@/lib/timestamps";
import { formatFileSize } from "@/lib/utils";
import { useVideoStore } from "@/store";

export function StatusBar() {
  const { filePath, durationMs, formatName, videoCodec, audioCodec, fileSizeBytes } =
    useVideoStore();

  if (!filePath) return null;

  const fileName = filePath.split("/").pop() ?? filePath;

  const chips = [
    fileName,
    formatName ? formatName.toUpperCase() : null,
    durationMs > 0 ? formatDuration(durationMs) : null,
    videoCodec || audioCodec ? [videoCodec, audioCodec].filter(Boolean).join(" / ") : null,
    fileSizeBytes > 0 ? formatFileSize(fileSizeBytes) : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex items-center gap-2 px-3 h-9 shrink-0 overflow-hidden">
      {chips.map((chip, i) => (
        <span
          key={chip}
          className="flex items-center gap-2 text-xs font-medium whitespace-nowrap"
          style={{ color: i === 0 ? "#1e0e4b" : "#9d8ec7" }}
        >
          {i > 0 && (
            <span
              className="h-1 w-1 rounded-full shrink-0"
              style={{ background: "rgba(139, 92, 246, 0.35)" }}
            />
          )}
          <span
            className="rounded-full px-2.5 py-0.5"
            style={
              i === 0
                ? {
                    background: "white",
                    boxShadow: "var(--shadow-clay-xs)",
                    border: "1.5px solid rgba(139, 92, 246, 0.15)",
                    maxWidth: 180,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                  }
                : {}
            }
            title={i === 0 ? filePath : undefined}
          >
            {chip}
          </span>
        </span>
      ))}
    </div>
  );
}
