import { create } from "zustand";

interface VideoState {
  filePath: string | null;
  durationMs: number;
  formatName: string;
  videoCodec: string;
  audioCodec: string;
  fileSizeBytes: number;
  currentTimeMs: number;
  isPlaying: boolean;

  setFile: (opts: {
    filePath: string;
    durationMs: number;
    formatName: string;
    videoCodec: string;
    audioCodec: string;
    fileSizeBytes: number;
  }) => void;
  setCurrentTime: (ms: number) => void;
  setPlaying: (playing: boolean) => void;
  reset: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  filePath: null,
  durationMs: 0,
  formatName: "",
  videoCodec: "",
  audioCodec: "",
  fileSizeBytes: 0,
  currentTimeMs: 0,
  isPlaying: false,

  setFile: (opts) =>
    set({
      filePath: opts.filePath,
      durationMs: opts.durationMs,
      formatName: opts.formatName,
      videoCodec: opts.videoCodec,
      audioCodec: opts.audioCodec,
      fileSizeBytes: opts.fileSizeBytes,
      currentTimeMs: 0,
    }),

  setCurrentTime: (ms) => set({ currentTimeMs: ms }),
  setPlaying: (playing) => set({ isPlaying: playing }),

  reset: () =>
    set({
      filePath: null,
      durationMs: 0,
      formatName: "",
      videoCodec: "",
      audioCodec: "",
      fileSizeBytes: 0,
      currentTimeMs: 0,
      isPlaying: false,
    }),
}));
