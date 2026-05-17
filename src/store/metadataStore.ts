import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { VideoMetadata } from "@/types/ipc";

interface MetadataState {
  current: VideoMetadata;
  original: VideoMetadata;
  isDirty: boolean;
  pendingCoverArt: string | null; // base64 data URL

  load: (metadata: VideoMetadata) => void;
  updateField: <K extends keyof VideoMetadata>(key: K, value: VideoMetadata[K]) => void;
  setPendingCoverArt: (dataUrl: string | null) => void;
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
  immer((set) => ({
    current: { ...emptyMetadata },
    original: { ...emptyMetadata },
    isDirty: false,
    pendingCoverArt: null,

    load: (metadata) =>
      set((state) => {
        state.current = { ...metadata };
        state.original = { ...metadata };
        state.isDirty = false;
        state.pendingCoverArt = null;
      }),

    updateField: (key, value) =>
      set((state) => {
        (state.current as Record<string, unknown>)[key] = value;
        state.isDirty = true;
      }),

    setPendingCoverArt: (dataUrl) =>
      set((state) => {
        state.pendingCoverArt = dataUrl;
        state.current.cover_art_base64 = dataUrl;
        state.isDirty = true;
      }),

    clearDirty: () =>
      set((state) => {
        state.original = { ...state.current };
        state.isDirty = false;
        state.pendingCoverArt = null;
      }),

    reset: () =>
      set((state) => {
        state.current = { ...emptyMetadata };
        state.original = { ...emptyMetadata };
        state.isDirty = false;
        state.pendingCoverArt = null;
      }),
  })),
);
