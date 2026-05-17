import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { ChapterPanel } from "@/components/chapters/ChapterPanel";
import { DropZone } from "@/components/dropzone/DropZone";
import { ExportDialog } from "@/components/export/ExportDialog";
import { AppShell } from "@/components/layout/AppShell";
import { MetadataPanel } from "@/components/metadata/MetadataPanel";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { useExport } from "@/hooks/useExport";
import { useVideoFile } from "@/hooks/useVideoFile";
import { useVideoStore } from "@/store";

export default function App() {
  const filePath = useVideoStore((s) => s.filePath);
  const { loadFile, loading, error } = useVideoFile();
  const { save, saving, error: saveError } = useExport();
  const [exportOpen, setExportOpen] = useState(false);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  // Show load/save errors as toasts
  useEffect(() => {
    if (error) toast.error(`Failed to open file: ${error}`);
  }, [error]);

  useEffect(() => {
    if (saveError) toast.error(`Save failed: ${saveError}`);
  }, [saveError]);

  const handleSave = useCallback(async () => {
    await save();
    toast.success("Saved successfully");
  }, [save]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const el = videoElRef.current;

      if (mod && e.key === "s" && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
      if (mod && e.key === "s" && e.shiftKey) {
        e.preventDefault();
        setExportOpen(true);
      }
      if (
        e.key === " " &&
        el &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        el.paused ? el.play() : el.pause();
      }
      if (e.key === "ArrowLeft" && el && !(e.target instanceof HTMLInputElement)) {
        el.currentTime = Math.max(0, el.currentTime - 5);
      }
      if (e.key === "ArrowRight" && el && !(e.target instanceof HTMLInputElement)) {
        el.currentTime = Math.min(el.duration, el.currentTime + 5);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  if (!filePath) {
    return (
      <div className="h-screen">
        <DropZone onFile={loadFile} />
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="rounded-lg bg-[--color-surface] px-6 py-4 text-sm text-[--color-foreground]">
              Loading…
            </div>
          </div>
        )}
        <Toaster position="bottom-right" theme="dark" />
      </div>
    );
  }

  return (
    <>
      <AppShell
        onSave={handleSave}
        saving={saving}
        left={<MetadataPanel />}
        center={
          <div className="flex flex-col flex-1 overflow-hidden">
            <VideoPlayer videoElRef={videoElRef} />
            <div className="flex-1 overflow-hidden border-t border-[--color-border]">
              <ChapterPanel videoEl={videoElRef.current} />
            </div>
          </div>
        }
      />

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="rounded-lg bg-[--color-surface] px-6 py-4 text-sm text-[--color-foreground]">
            Probing video…
          </div>
        </div>
      )}

      <Toaster position="bottom-right" theme="dark" />
    </>
  );
}
