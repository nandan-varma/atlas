interface HelpOverlayProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ["⌘", "O"], label: "Open file" },
  { keys: ["⌘", "S"], label: "Save" },
  { keys: ["⌘", "⇧", "S"], label: "Export As…" },
  { keys: ["⌘", "Z"], label: "Undo" },
  { keys: ["⌘", "⇧", "Z"], label: "Redo" },
  { keys: ["Space"], label: "Play / Pause" },
  { keys: ["←"], label: "Seek back 5 s" },
  { keys: ["→"], label: "Seek forward 5 s" },
  { keys: ["?"], label: "Toggle this help" },
];

export function HelpOverlay({ open, onClose }: HelpOverlayProps) {
  if (!open) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop scrim; role="presentation" is correct
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10, 0, 30, 0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      onKeyDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        className="w-72 p-5 flex flex-col gap-4"
        style={{
          background: "white",
          borderRadius: 22,
          boxShadow: "var(--shadow-clay-lg)",
          border: "1.5px solid rgba(139, 92, 246, 0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 flex items-center justify-center rounded-xl text-sm"
            style={{
              background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
              boxShadow: "var(--shadow-clay-xs)",
              color: "#7c3aed",
              fontWeight: 700,
            }}
          >
            ?
          </div>
          <h2 className="text-sm font-bold" style={{ color: "#1e0e4b" }}>
            Keyboard Shortcuts
          </h2>
        </div>

        {/* Shortcuts */}
        <ul className="flex flex-col gap-1.5">
          {shortcuts.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between gap-4 px-3 py-2"
              style={{
                borderRadius: 12,
                background: "#f7f4ff",
              }}
            >
              <span className="text-xs" style={{ color: "#9d8ec7" }}>
                {s.label}
              </span>
              <span className="flex items-center gap-1 shrink-0">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="inline-flex items-center justify-center text-[10px] font-mono font-bold px-1.5 py-0.5"
                    style={{
                      background: "white",
                      borderRadius: 7,
                      boxShadow: "var(--shadow-clay-xs)",
                      border: "1.5px solid rgba(139, 92, 246, 0.18)",
                      color: "#7c3aed",
                      minWidth: 22,
                    }}
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="py-2 text-xs font-semibold cursor-pointer transition-all"
          style={{
            borderRadius: 14,
            background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            color: "white",
            boxShadow: "var(--shadow-clay-accent)",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
