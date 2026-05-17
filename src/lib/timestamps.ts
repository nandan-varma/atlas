/** Convert milliseconds to HH:MM:SS.mmm string */
export function msToTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const mmm = String(milliseconds).padStart(3, "0");

  return `${hh}:${mm}:${ss}.${mmm}`;
}

/** Parse HH:MM:SS.mmm (or HH:MM:SS or MM:SS) to milliseconds. Returns null if invalid. */
export function timestampToMs(ts: string): number | null {
  const trimmed = ts.trim();
  // Patterns: HH:MM:SS.mmm, HH:MM:SS, MM:SS.mmm, MM:SS
  const match = trimmed.match(/^(?:(\d+):)?(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (!match) return null;

  const h = parseInt(match[1] ?? "0", 10);
  const m = parseInt(match[2], 10);
  const s = parseInt(match[3], 10);
  const msRaw = match[4] ? match[4].padEnd(3, "0") : "000";
  const ms = parseInt(msRaw, 10);

  if (m >= 60 || s >= 60) return null;

  return h * 3600000 + m * 60000 + s * 1000 + ms;
}

/** Format seconds (float) to MM:SS for display */
export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
