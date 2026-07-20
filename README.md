# Atlas

A native desktop app for editing video file metadata and chapters. Open a video (MP4, MKV, MOV, AVI, WebM, M4V, FLV), edit title/description/cover art, reorder chapters with drag-and-drop, preview in the built-in player, and export — all offline.

## Architecture

- **Rust backend (Tauri v2):** native file dialog (`tauri-plugin-dialog`), filesystem access (`tauri-plugin-fs`), and shell commands for ffmpeg (`tauri-plugin-shell`); exposes typed `invoke` commands to the frontend and runs format-compatibility checks after load, surfaced as toast notifications
- **React frontend:** video player (`@vidstack/react`), chapter panel with `@dnd-kit/sortable`, metadata panel, export dialog — running in a native WebView, no browser dependency
- **State:** per-domain Zustand stores (video, chapters, metadata) with Immer for immutable updates, undo/redo on metadata edits, and a dirty-state guard before opening a new file with unsaved changes

## Getting started

```bash
pnpm install
pnpm tauri dev
```

## Built with

- [Tauri v2](https://v2.tauri.app) — Rust backend, native shell
- React 19 + TypeScript + Vite
- Tailwind CSS + Radix UI
- [dnd-kit](https://dndkit.com) — chapter drag-and-drop
- Zustand + Immer — state management with undo/redo
- [@vidstack/react](https://www.vidstack.io) — video preview
- ffmpeg — metadata reads/writes (shelled out via Tauri)
- Sonner — toast notifications
