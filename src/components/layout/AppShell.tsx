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
    <div className="flex flex-col h-screen bg-[--color-background] overflow-hidden">
      <TitleBar onSave={onSave} onOpenFile={onOpenFile} saving={saving} />
      <div className="flex flex-1 overflow-hidden border-t border-[--color-border]">
        {/* Left panel */}
        <aside className="w-[280px] shrink-0 flex flex-col border-r border-[--color-border] overflow-hidden bg-[--color-surface]">
          {left}
        </aside>
        {/* Center panel */}
        <main className="flex-1 flex flex-col overflow-hidden">{center}</main>
      </div>
      <StatusBar />
    </div>
  );
}
