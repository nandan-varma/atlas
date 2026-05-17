import { useCallback, useState } from "react";
import { tauriApi } from "@/lib/tauri";
import { useChapterStore, useMetadataStore, useVideoStore } from "@/store";

export function useVideoFile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoStore = useVideoStore();
  const metadataStore = useMetadataStore();
  const chapterStore = useChapterStore();

  const loadFile = useCallback(
    async (path: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await tauriApi.probeFile(path);
        videoStore.setFile({
          filePath: path,
          durationMs: result.duration_ms,
          formatName: result.format_name,
          videoCodec: result.video_codec,
          audioCodec: result.audio_codec,
          fileSizeBytes: result.file_size_bytes,
        });
        metadataStore.load(result.metadata);
        chapterStore.load(result.chapters, result.duration_ms);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    [videoStore, metadataStore, chapterStore],
  );

  return { loadFile, loading, error };
}
