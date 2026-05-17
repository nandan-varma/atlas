import { useCallback } from "react";
import { tauriApi } from "@/lib/tauri";
import { useChapterStore, useVideoStore } from "@/store";

export function useFrameCapture() {
  const videoStore = useVideoStore();
  const chapterStore = useChapterStore();

  const captureAtTime = useCallback(
    async (
      chapterId: string,
      timestampMs: number,
      videoEl?: HTMLVideoElement | null,
    ): Promise<string | null> => {
      // Try canvas capture first (fast, in-browser)
      if ((videoEl && !videoEl.paused === false) || videoEl) {
        try {
          const canvas = new OffscreenCanvas(320, 180);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0, 320, 180);
            const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            chapterStore.setThumbnail(chapterId, dataUrl);
            return dataUrl;
          }
        } catch {
          // fall through to Rust extraction
        }
      }

      // Fallback: Rust-side ffmpeg extraction
      if (!videoStore.filePath) return null;
      try {
        const dataUrl = await tauriApi.extractThumbnail(videoStore.filePath, timestampMs, 320, 180);
        chapterStore.setThumbnail(chapterId, dataUrl);
        return dataUrl;
      } catch {
        return null;
      }
    },
    [videoStore.filePath, chapterStore],
  );

  return { captureAtTime };
}
