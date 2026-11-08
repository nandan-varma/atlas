import { ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { useMetadataStore } from "@/store";

export function CoverArtEditor() {
  const coverArt = useMetadataStore((s) => s.current.cover_art_base64);
  const setPendingCoverArt = useMetadataStore((s) => s.setPendingCoverArt);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setPendingCoverArt(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingCoverArt(null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold" style={{ color: "#9d8ec7" }}>
        Cover Art
      </p>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: cover art drop zone */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: file input handles keyboard */}
      <div
        className="relative group flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden transition-all"
        style={{
          borderRadius: 16,
          border: "2px dashed rgba(139, 92, 246, 0.3)",
          background: "#f7f4ff",
          boxShadow: "inset 0 2px 8px rgba(124, 58, 237, 0.07)",
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        {coverArt ? (
          <>
            <img
              src={coverArt}
              alt="Cover art"
              className="h-full w-full object-cover"
              style={{ borderRadius: 14 }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(30, 14, 75, 0.5)", borderRadius: 14 }}
            >
              <UploadIcon size={20} className="text-white" />
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              style={{ background: "rgba(30, 14, 75, 0.7)" }}
            >
              <XIcon size={11} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <div
              className="flex h-11 w-11 items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                borderRadius: 12,
                boxShadow: "var(--shadow-clay-xs)",
              }}
            >
              <ImageIcon size={20} style={{ color: "#7c3aed" }} />
            </div>
            <span className="text-xs" style={{ color: "#9d8ec7" }}>
              Drop image or click to browse
            </span>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
