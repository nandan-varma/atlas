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
    <div className="flex flex-col gap-1">
      <p className="text-xs text-[--color-muted] font-medium">Cover Art</p>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: cover art drop zone */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: file input handles keyboard */}
      <div
        className="relative group flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-[--color-border] bg-[--color-surface-raised] hover:border-[--color-accent] transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        {coverArt ? (
          <>
            <img src={coverArt} alt="Cover art" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <UploadIcon size={20} className="text-white" />
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black cursor-pointer"
            >
              <XIcon size={10} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[--color-muted]">
            <ImageIcon size={24} />
            <span className="text-xs">Drop image or click to browse</span>
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
