import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { generateId } from "@/lib/utils";
import type { Chapter } from "@/types/ipc";

interface ChapterState {
  chapters: Chapter[];
  thumbnails: Record<string, string>; // chapterId → data URL
  durationMs: number;
  isDirty: boolean;

  load: (chapters: Chapter[], durationMs: number) => void;
  addChapter: (startMs: number) => void;
  removeChapter: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
  updateStartTime: (id: string, startMs: number) => void;
  reorder: (activeId: string, overId: string) => void;
  setThumbnail: (id: string, dataUrl: string) => void;
  removeThumbnail: (id: string) => void;
  clearDirty: () => void;
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
    durationMs: 0,
    isDirty: false,

    load: (chapters, durationMs) =>
      set((state) => {
        state.chapters = [...chapters];
        state.durationMs = durationMs;
        recalcEndTimes(state.chapters, durationMs);
        state.thumbnails = {};
        state.isDirty = false;
      }),

    addChapter: (startMs) =>
      set((state) => {
        const { durationMs } = state;
        const newChapter: Chapter = {
          id: generateId(),
          title: `Chapter ${state.chapters.length + 1}`,
          start_time_ms: startMs,
          end_time_ms: durationMs,
        };
        const idx = state.chapters.findIndex((c) => c.start_time_ms > startMs);
        if (idx === -1) {
          state.chapters.push(newChapter);
        } else {
          state.chapters.splice(idx, 0, newChapter);
        }
        recalcEndTimes(state.chapters, durationMs);
        state.isDirty = true;
      }),

    removeChapter: (id) =>
      set((state) => {
        const idx = state.chapters.findIndex((c) => c.id === id);
        if (idx !== -1) {
          state.chapters.splice(idx, 1);
          delete state.thumbnails[id];
          recalcEndTimes(state.chapters, state.durationMs);
          state.isDirty = true;
        }
      }),

    updateTitle: (id, title) =>
      set((state) => {
        const ch = state.chapters.find((c) => c.id === id);
        if (ch) {
          ch.title = title;
          state.isDirty = true;
        }
      }),

    updateStartTime: (id, startMs) =>
      set((state) => {
        const ch = state.chapters.find((c) => c.id === id);
        if (ch) {
          ch.start_time_ms = startMs;
          state.chapters.sort((a, b) => a.start_time_ms - b.start_time_ms);
          recalcEndTimes(state.chapters, state.durationMs);
          state.isDirty = true;
        }
      }),

    reorder: (activeId, overId) =>
      set((state) => {
        const oldIdx = state.chapters.findIndex((c) => c.id === activeId);
        const newIdx = state.chapters.findIndex((c) => c.id === overId);
        if (oldIdx !== -1 && newIdx !== -1) {
          state.chapters = arrayMove(state.chapters, oldIdx, newIdx) as Chapter[];
          // Reorder is manual — don't re-sort by start time; update end times to match new visual order
          recalcEndTimes(state.chapters, state.durationMs);
          state.isDirty = true;
        }
      }),

    setThumbnail: (id, dataUrl) =>
      set((state) => {
        state.thumbnails[id] = dataUrl;
        state.isDirty = true;
      }),

    removeThumbnail: (id) =>
      set((state) => {
        delete state.thumbnails[id];
        state.isDirty = true;
      }),

    clearDirty: () =>
      set((state) => {
        state.isDirty = false;
      }),

    reset: () =>
      set((state) => {
        state.chapters = [];
        state.thumbnails = {};
        state.durationMs = 0;
        state.isDirty = false;
      }),
  })),
);
