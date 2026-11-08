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
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8 transition-all">
      {/* Clay card drop target */}
      <div
        className="flex flex-col items-center gap-6 w-full max-w-xs text-center p-10 transition-all"
        style={{
          background: dragging ? "linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%)" : "white",
          borderRadius: 28,
          boxShadow: dragging
            ? "0 16px 48px rgba(124, 58, 237, 0.28), 0 8px 20px rgba(0,0,0,0.1), inset 0 -5px 0 rgba(0,0,0,0.07)"
            : "var(--shadow-clay-lg)",
          border: dragging
            ? "2px dashed rgba(124, 58, 237, 0.5)"
            : "2px dashed rgba(139, 92, 246, 0.25)",
          transform: dragging ? "scale(1.02)" : "scale(1)",
        }}
      >
        {/* Icon */}
        <div
          className="flex h-20 w-20 items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
            borderRadius: 22,
            boxShadow:
              "0 8px 24px rgba(124, 58, 237, 0.2), 0 3px 8px rgba(0,0,0,0.07), inset 0 -4px 0 rgba(0,0,0,0.06)",
          }}
        >
          <Film
            size={36}
            style={{
              color: "#7c3aed",
              filter: "drop-shadow(0 2px 4px rgba(124, 58, 237, 0.3))",
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-lg font-bold" style={{ color: "#1e0e4b" }}>
            {dragging ? "Release to open" : "Drop your video here"}
          </p>
          <p className="text-sm" style={{ color: "#9d8ec7" }}>
            MP4 · MKV · MOV · AVI · WebM
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenFile}
          className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white cursor-pointer transition-all"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            borderRadius: 14,
            boxShadow: "var(--shadow-clay-accent)",
          }}
        >
          <FolderOpen size={16} />
          Browse files
        </button>
      </div>

      <p className="text-xs" style={{ color: "rgba(157, 142, 199, 0.7)" }}>
        Press ⌘O anytime to open a file
      </p>
    </div>
  );
}
