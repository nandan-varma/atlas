import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { ChapterPanel } from "@/components/chapters/ChapterPanel";
import { DropZone } from "@/components/dropzone/DropZone";
import { ExportDialog } from "@/components/export/ExportDialog";
import { AppShell } from "@/components/layout/AppShell";
import { HelpOverlay } from "@/components/layout/HelpOverlay";
import { MetadataPanel } from "@/components/metadata/MetadataPanel";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { useExport } from "@/hooks/useExport";
import { useVideoFile } from "@/hooks/useVideoFile";
import { tauriApi } from "@/lib/tauri";
import { useChapterStore, useMetadataStore, useVideoStore } from "@/store";

const VIDEO_EXTENSIONS = ["mp4", "mkv", "mov", "avi", "webm", "m4v", "flv", "wmv"];

export default function App() {
  const filePath = useVideoStore((s) => s.filePath);
  const formatName = useVideoStore((s) => s.formatName);
  const { loadFile, loading, error } = useVideoFile();
  const { save, saving, error: saveError } = useExport();
  const metaIsDirty = useMetadataStore((s) => s.isDirty);
  const chapterIsDirty = useChapterStore((s) => s.isDirty);
  const isDirty = metaIsDirty || chapterIsDirty;
  const undo = useMetadataStore((s) => s.undo);
  const redo = useMetadataStore((s) => s.redo);

  const [exportOpen, setExportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  // Show load errors as toasts
  useEffect(() => {
    if (error) toast.error(`Failed to open file: ${error}`);
  }, [error]);

  useEffect(() => {
    if (saveError) toast.error(`Save failed: ${saveError}`);
  }, [saveError]);

  // Show format-compatibility warnings after load
  useEffect(() => {
    if (!formatName) return;
    tauriApi.getFormatInfo(formatName).then((info) => {
      if (info.warning) toast.warning(info.warning, { duration: 6000 });
    });
  }, [formatName]);

  const handleOpenFile = useCallback(async () => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Open a new file and discard them?",
      );
      if (!confirmed) return;
    }
    const selected = await open({
      multiple: false,
      filters: [{ name: "Video", extensions: VIDEO_EXTENSIONS }],
    });
    if (typeof selected === "string") await loadFile(selected);
  }, [isDirty, loadFile]);

  const handleSave = useCallback(async () => {
    const ok = await save();
    if (ok) toast.success("Saved");
  }, [save]);

  // Warn before close if unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // biome-ignore lint/suspicious/noAssignInExpressions: required for legacy browser support
        return (e.returnValue = "");
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const el = videoElRef.current;
      const inInput =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if (mod && e.key === "o") {
        e.preventDefault();
        handleOpenFile();
      }
      if (mod && !e.shiftKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (mod && e.shiftKey && e.key === "s") {
        e.preventDefault();
        setExportOpen(true);
      }
      if (mod && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (mod && (e.shiftKey ? e.key === "z" : e.key === "y")) {
        e.preventDefault();
        redo();
      }
      if (!inInput && e.key === "?") {
        setHelpOpen((v) => !v);
      }
      if (!inInput && e.key === " " && el) {
        e.preventDefault();
        el.paused ? el.play() : el.pause();
      }
      if (!inInput && e.key === "ArrowLeft" && el) {
        el.currentTime = Math.max(0, el.currentTime - 5);
      }
      if (!inInput && e.key === "ArrowRight" && el) {
        el.currentTime = Math.min(el.duration ?? el.currentTime, el.currentTime + 5);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave, handleOpenFile, undo, redo]);

  if (!filePath) {
    return (
      <>
        <DropZone onFile={loadFile} />
        {loading && <LoadingOverlay message="Opening video…" />}
        <Toaster position="bottom-right" theme="dark" />
      </>
    );
  }

  return (
    <>
      <AppShell
        onSave={handleSave}
        onOpenFile={handleOpenFile}
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
      <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />

      {loading && <LoadingOverlay message="Opening video…" />}

      <Toaster position="bottom-right" theme="dark" />
    </>
  );
}

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex items-center gap-3 rounded-xl bg-[--color-surface] border border-[--color-border] px-6 py-4 shadow-2xl">
        <div className="h-4 w-4 rounded-full border-2 border-[--color-accent] border-t-transparent animate-spin" />
        <span className="text-sm text-[--color-foreground]">{message}</span>
      </div>
    </div>
  );
}
