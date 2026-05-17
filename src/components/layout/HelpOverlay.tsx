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
    // biome-ignore lint/a11y/noStaticElementInteractions: scrim backdrop; role="presentation" is semantically correct for a dismiss overlay
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
      onKeyDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        className="w-72 rounded-xl border border-[--color-border] bg-[--color-surface] shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-sm font-semibold text-[--color-foreground]">Keyboard Shortcuts</h2>
        <ul className="space-y-2.5">
          {shortcuts.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-4">
              <span className="text-xs text-[--color-muted]">{s.label}</span>
              <span className="flex items-center gap-1 shrink-0">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-medium bg-[--color-surface-raised] border border-[--color-border] text-[--color-foreground]"
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
          className="mt-5 w-full rounded-md py-1.5 text-xs text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-raised] transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
