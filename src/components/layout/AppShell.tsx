import type { ReactNode } from "react";
import { StatusBar } from "./StatusBar";
import { TitleBar } from "./TitleBar";

interface AppShellProps {
  left: ReactNode;
  center: ReactNode;
  onSave: () => void;
  onOpenFile: () => void;
  saving: boolean;
}

export function AppShell({ left, center, onSave, onOpenFile, saving }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden p-2 gap-2">
      <TitleBar onSave={onSave} onOpenFile={onOpenFile} saving={saving} />
      <div className="flex flex-1 overflow-hidden gap-2 min-h-0">
        {/* Left panel */}
        <aside
          className="w-[280px] shrink-0 flex flex-col overflow-hidden"
          style={{
            background: "white",
            borderRadius: 20,
            boxShadow: "var(--shadow-clay)",
            border: "1.5px solid rgba(139, 92, 246, 0.15)",
          }}
        >
          {left}
        </aside>
        {/* Center panel */}
        <main
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            background: "white",
            borderRadius: 20,
            boxShadow: "var(--shadow-clay)",
            border: "1.5px solid rgba(139, 92, 246, 0.15)",
          }}
        >
          {center}
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
