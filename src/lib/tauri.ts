import { invoke } from "@tauri-apps/api/core";
import type { FormatInfo, ProbeResult, WriteRequest } from "@/types/ipc";

export const tauriApi = {
  probeFile: (path: string) => invoke<ProbeResult>("probe_file", { path }),

  writeMetadata: (request: WriteRequest) => invoke<void>("write_metadata", { request }),

  cancelWrite: () => invoke<void>("cancel_write"),

  extractThumbnail: (path: string, timestampMs: number, width = 320, height = 180) =>
    invoke<string>("extract_thumbnail", {
      path,
      timestampMs,
      width,
      height,
    }),

  getFormatInfo: (formatName: string) => invoke<FormatInfo>("get_format_info", { formatName }),
};
