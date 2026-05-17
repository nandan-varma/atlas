import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { Film, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";

interface DropZoneProps {
  onFile: (path: string) => void;
}

const VIDEO_EXTENSIONS = ["mp4", "mkv", "mov", "avi", "webm", "m4v", "flv", "wmv"];

export function DropZone({ onFile }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let unlistenEnter: (() => void) | undefined;
    let unlistenDrop: (() => void) | undefined;
    let unlistenLeave: (() => void) | undefined;

    listen<{ paths: string[] }>("tauri://drag-drop", (event) => {
      setDragging(false);
      const paths = event.payload.paths ?? [];
      const videoPath = paths.find((p) =>
        VIDEO_EXTENSIONS.some((ext) => p.toLowerCase().endsWith(`.${ext}`)),
      );
      if (videoPath) onFile(videoPath);
    }).then((fn) => (unlistenDrop = fn));

    listen("tauri://drag-enter", () => setDragging(true)).then((fn) => (unlistenEnter = fn));
    listen("tauri://drag-leave", () => setDragging(false)).then((fn) => (unlistenLeave = fn));

    return () => {
      unlistenEnter?.();
      unlistenDrop?.();
      unlistenLeave?.();
    };
  }, [onFile]);

  const handleOpenFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Video", extensions: VIDEO_EXTENSIONS }],
    });
    if (typeof selected === "string") onFile(selected);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center h-full gap-6 transition-colors ${
        dragging
          ? "bg-[--color-accent]/10 border-2 border-dashed border-[--color-accent]"
          : "bg-[--color-background]"
      }`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[--color-surface]">
          <Film size={32} className="text-[--color-muted]" />
        </div>
        <div>
          <p className="text-base font-medium text-[--color-foreground]">Drop a video file here</p>
          <p className="mt-1 text-sm text-[--color-muted]">MP4, MKV, MOV, AVI, WebM supported</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleOpenFile}
        className="flex items-center gap-2 rounded-lg bg-[--color-accent] px-4 py-2 text-sm font-medium text-white hover:bg-[--color-accent-hover] transition-colors cursor-pointer"
      >
        <FolderOpen size={16} />
        Open File
      </button>
    </div>
  );
}
