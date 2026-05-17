import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { VideoMetadata } from "@/types/ipc";

const HISTORY_LIMIT = 50;

interface MetadataState {
  current: VideoMetadata;
  original: VideoMetadata;
  isDirty: boolean;
  pendingCoverArt: string | null;
  history: VideoMetadata[];
  historyIndex: number;

  load: (metadata: VideoMetadata) => void;
  updateField: <K extends keyof VideoMetadata>(key: K, value: VideoMetadata[K]) => void;
  setPendingCoverArt: (dataUrl: string | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearDirty: () => void;
  reset: () => void;
}

const emptyMetadata: VideoMetadata = {
  title: null,
  artist: null,
  album_artist: null,
  album: null,
  year: null,
  genre: null,
  description: null,
  comment: null,
  copyright: null,
  language: null,
  encoder: null,
  cover_art_base64: null,
};

export const useMetadataStore = create<MetadataState>()(
  immer((set, get) => ({
    current: { ...emptyMetadata },
    original: { ...emptyMetadata },
    isDirty: false,
    pendingCoverArt: null,
    history: [],
    historyIndex: -1,

    load: (metadata) =>
      set((state) => {
        state.current = { ...metadata };
        state.original = { ...metadata };
        state.isDirty = false;
        state.pendingCoverArt = null;
        state.history = [{ ...metadata }];
        state.historyIndex = 0;
      }),

    updateField: (key, value) =>
      set((state) => {
        (state.current as Record<string, unknown>)[key] = value;
        state.isDirty = true;

        // Truncate future history, push new snapshot
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({ ...state.current });
        if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      }),

    setPendingCoverArt: (dataUrl) =>
      set((state) => {
        state.pendingCoverArt = dataUrl;
        state.current.cover_art_base64 = dataUrl;
        state.isDirty = true;

        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({ ...state.current });
        if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      }),

    undo: () =>
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex -= 1;
          state.current = { ...state.history[state.historyIndex] };
          state.isDirty = true;
        }
      }),

    redo: () =>
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex += 1;
          state.current = { ...state.history[state.historyIndex] };
          state.isDirty = true;
        }
      }),

    canUndo: () => {
      const { historyIndex } = get();
      return historyIndex > 0;
    },

    canRedo: () => {
      const { historyIndex, history } = get();
      return historyIndex < history.length - 1;
    },

    clearDirty: () =>
      set((state) => {
        state.original = { ...state.current };
        state.isDirty = false;
        state.pendingCoverArt = null;
        // Keep history intact for post-save undo
      }),

    reset: () =>
      set((state) => {
        state.current = { ...emptyMetadata };
        state.original = { ...emptyMetadata };
        state.isDirty = false;
        state.pendingCoverArt = null;
        state.history = [];
        state.historyIndex = -1;
      }),
  })),
);
