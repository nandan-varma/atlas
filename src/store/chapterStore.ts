import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { generateId } from "@/lib/utils";
import type { Chapter } from "@/types/ipc";

interface ChapterState {
  chapters: Chapter[];
  thumbnails: Record<string, string>; // chapterId → data URL

  load: (chapters: Chapter[], durationMs: number) => void;
  addChapter: (startMs: number, durationMs: number) => void;
  removeChapter: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
  updateStartTime: (id: string, startMs: number, durationMs: number) => void;
  reorder: (activeId: string, overId: string) => void;
  setThumbnail: (id: string, dataUrl: string) => void;
  removeThumbnail: (id: string) => void;
  reset: () => void;
}

function recalcEndTimes(chapters: Chapter[], durationMs: number) {
  for (let i = 0; i < chapters.length; i++) {
    if (i + 1 < chapters.length) {
      chapters[i].end_time_ms = Math.max(
        chapters[i + 1].start_time_ms - 1,
        chapters[i].start_time_ms,
      );
    } else {
      chapters[i].end_time_ms = durationMs;
    }
  }
}

export const useChapterStore = create<ChapterState>()(
  immer((set) => ({
    chapters: [],
    thumbnails: {},

    load: (chapters, durationMs) =>
      set((state) => {
        state.chapters = [...chapters];
        recalcEndTimes(state.chapters, durationMs);
        state.thumbnails = {};
      }),

    addChapter: (startMs, durationMs) =>
      set((state) => {
        const newChapter: Chapter = {
          id: generateId(),
          title: `Chapter ${state.chapters.length + 1}`,
          start_time_ms: startMs,
          end_time_ms: durationMs,
        };
        // Insert in sorted order
        const idx = state.chapters.findIndex((c) => c.start_time_ms > startMs);
        if (idx === -1) {
          state.chapters.push(newChapter);
        } else {
          state.chapters.splice(idx, 0, newChapter);
        }
        recalcEndTimes(state.chapters, durationMs);
      }),

    removeChapter: (id) =>
      set((state) => {
        const idx = state.chapters.findIndex((c) => c.id === id);
        if (idx !== -1) {
          state.chapters.splice(idx, 1);
          delete state.thumbnails[id];
        }
      }),

    updateTitle: (id, title) =>
      set((state) => {
        const ch = state.chapters.find((c) => c.id === id);
        if (ch) ch.title = title;
      }),

    updateStartTime: (id, startMs, durationMs) =>
      set((state) => {
        const ch = state.chapters.find((c) => c.id === id);
        if (ch) {
          ch.start_time_ms = startMs;
          // Re-sort
          state.chapters.sort((a, b) => a.start_time_ms - b.start_time_ms);
          recalcEndTimes(state.chapters, durationMs);
        }
      }),

    reorder: (activeId, overId) =>
      set((state) => {
        const oldIdx = state.chapters.findIndex((c) => c.id === activeId);
        const newIdx = state.chapters.findIndex((c) => c.id === overId);
        if (oldIdx !== -1 && newIdx !== -1) {
          state.chapters = arrayMove(state.chapters, oldIdx, newIdx) as Chapter[];
        }
      }),

    setThumbnail: (id, dataUrl) =>
      set((state) => {
        state.thumbnails[id] = dataUrl;
      }),

    removeThumbnail: (id) =>
      set((state) => {
        delete state.thumbnails[id];
      }),

    reset: () =>
      set((state) => {
        state.chapters = [];
        state.thumbnails = {};
      }),
  })),
);
