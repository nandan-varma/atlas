import { formatDuration } from "@/lib/timestamps";
import { formatFileSize } from "@/lib/utils";
import { useVideoStore } from "@/store";

export function StatusBar() {
  const { filePath, durationMs, formatName, videoCodec, audioCodec, fileSizeBytes } =
    useVideoStore();

  if (!filePath) return null;

  const fileName = filePath.split("/").pop() ?? filePath;

  return (
    <div className="flex h-7 items-center gap-3 border-t border-[--color-border] px-4 text-xs text-[--color-muted] shrink-0">
      <span className="truncate max-w-[200px]" title={filePath}>
        {fileName}
      </span>
      {formatName && (
        <>
          <span className="text-[--color-border]">•</span>
          <span className="uppercase">{formatName}</span>
        </>
      )}
      {durationMs > 0 && (
        <>
          <span className="text-[--color-border]">•</span>
          <span>{formatDuration(durationMs)}</span>
        </>
      )}
      {(videoCodec || audioCodec) && (
        <>
          <span className="text-[--color-border]">•</span>
          <span>{[videoCodec, audioCodec].filter(Boolean).join(" / ")}</span>
        </>
      )}
      {fileSizeBytes > 0 && (
        <>
          <span className="text-[--color-border]">•</span>
          <span>{formatFileSize(fileSizeBytes)}</span>
        </>
      )}
    </div>
  );
}
