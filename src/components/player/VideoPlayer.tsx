import { convertFileSrc } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef } from "react";
import { formatDuration } from "@/lib/timestamps";
import { useChapterStore, useVideoStore } from "@/store";

interface VideoPlayerProps {
  videoElRef?: React.MutableRefObject<HTMLVideoElement | null>;
}

export function VideoPlayer({ videoElRef }: VideoPlayerProps) {
  const filePath = useVideoStore((s) => s.filePath);
  const durationMs = useVideoStore((s) => s.durationMs);
  const currentTimeMs = useVideoStore((s) => s.currentTimeMs);
  const setCurrentTime = useVideoStore((s) => s.setCurrentTime);
  const setPlaying = useVideoStore((s) => s.setPlaying);
  const chapters = useChapterStore((s) => s.chapters);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoRef = videoElRef ?? localVideoRef;
  const progressRef = useRef<HTMLDivElement>(null);

  const src = filePath ? convertFileSrc(filePath) : null;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onTimeUpdate = () => setCurrentTime(Math.floor(el.currentTime * 1000));
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [setCurrentTime, setPlaying, videoRef]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !videoRef.current || durationMs === 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const ms = fraction * durationMs;
      videoRef.current.currentTime = ms / 1000;
      setCurrentTime(ms);
    },
    [durationMs, setCurrentTime, videoRef],
  );

  const progress = durationMs > 0 ? (currentTimeMs / durationMs) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 p-3">
      {/* Video element */}
      <div
        className="relative w-full bg-black rounded-lg overflow-hidden"
        style={{ aspectRatio: "16/9" }}
      >
        {src ? (
          // biome-ignore lint/a11y/useMediaCaption: video editor — captions not applicable
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-contain"
            controls={false}
            onClick={() => {
              const el = videoRef.current;
              if (!el) return;
              el.paused ? el.play() : el.pause();
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[--color-muted] text-sm">
            No video loaded
          </div>
        )}
      </div>

      {/* Seek bar */}
      <div className="flex flex-col gap-1">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: seek bar requires mouse interaction */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: arrow key seeking handled globally */}
        <div
          ref={progressRef}
          className="relative h-2 cursor-pointer rounded-full bg-[--color-border] group"
          onClick={handleSeek}
        >
          {/* Progress fill */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[--color-accent] transition-none"
            style={{ width: `${progress}%` }}
          />
          {/* Chapter tick marks */}
          {chapters.map((ch) => {
            const pct = durationMs > 0 ? (ch.start_time_ms / durationMs) * 100 : 0;
            return (
              <div
                key={ch.id}
                className="absolute top-0 h-full w-0.5 bg-white/40"
                style={{ left: `${pct}%` }}
                title={ch.title}
              />
            );
          })}
          {/* Playhead thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-xs text-[--color-muted]">
          <span>{formatDuration(currentTimeMs)}</span>
          <span>{formatDuration(durationMs)}</span>
        </div>
      </div>
    </div>
  );
}
