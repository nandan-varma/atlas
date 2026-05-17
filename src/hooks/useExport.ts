import { listen } from "@tauri-apps/api/event";
import { useCallback, useState } from "react";
import { tauriApi } from "@/lib/tauri";
import { useChapterStore, useMetadataStore, useVideoStore } from "@/store";

export function useExport() {
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoStore = useVideoStore();
  const metadataStore = useMetadataStore();
  const chapterStore = useChapterStore();

  const save = useCallback(
    async (
      outputPath?: string,
      mode: "metadata_only" | "reencode" = "metadata_only",
    ): Promise<boolean> => {
      if (!videoStore.filePath) return false;

      setSaving(true);
      setProgress(0);
      setError(null);

      const unlisten = await listen<number>("write-progress", (event) => {
        if (videoStore.durationMs > 0) {
          setProgress(Math.min(99, (event.payload / videoStore.durationMs) * 100));
        }
      });

      try {
        await tauriApi.writeMetadata({
          input_path: videoStore.filePath,
          output_path: outputPath ?? videoStore.filePath,
          metadata: metadataStore.current,
          chapters: chapterStore.chapters,
          cover_art_temp_path: null,
          mode,
          video_quality_crf: null,
        });
        metadataStore.clearDirty();
        chapterStore.clearDirty();
        setProgress(100);
        return true;
      } catch (e) {
        setError(String(e));
        return false;
      } finally {
        unlisten();
        setSaving(false);
      }
    },
    [videoStore, metadataStore, chapterStore],
  );

  const cancel = useCallback(async () => {
    await tauriApi.cancelWrite();
    setSaving(false);
  }, []);

  return { save, cancel, saving, progress, error };
}
