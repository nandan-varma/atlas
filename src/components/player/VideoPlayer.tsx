import { convertFileSrc } from "@tauri-apps/api/core";
import { useCallback, useRef } from "react";
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

  const onTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (el) setCurrentTime(Math.floor(el.currentTime * 1000));
  }, [setCurrentTime, videoRef]);

  const onPlay = useCallback(() => setPlaying(true), [setPlaying]);
  const onPause = useCallback(() => setPlaying(false), [setPlaying]);

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
    <div className="flex flex-col gap-0 overflow-hidden">
      {/* Video */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "16/9", background: "#0a0014", borderRadius: "18px 18px 0 0" }}
      >
        {src ? (
          // biome-ignore lint/a11y/useMediaCaption: video editor — captions not applicable
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-contain"
            style={{ borderRadius: "18px 18px 0 0" }}
            controls={false}
            onTimeUpdate={onTimeUpdate}
            onPlay={onPlay}
            onPause={onPause}
            onClick={() => {
              const el = videoRef.current;
              if (!el) return;
              el.paused ? el.play() : el.pause();
            }}
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-sm"
            style={{ color: "#5b4a8a" }}
          >
            No video loaded
          </div>
        )}
      </div>

      {/* Seek bar + time */}
      <div
        className="flex flex-col gap-2 px-4 py-3"
        style={{ background: "#0a0014", borderRadius: "0 0 18px 18px" }}
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: seek bar */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: arrow key seeking handled globally */}
        <div
          ref={progressRef}
          className="relative h-2.5 cursor-pointer group"
          style={{
            background: "rgba(139, 92, 246, 0.2)",
            borderRadius: 99,
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
          }}
          onClick={handleSeek}
        >
          {/* Progress fill */}
          <div
            className="absolute left-0 top-0 h-full transition-none"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%)",
              borderRadius: 99,
              boxShadow: "0 0 8px rgba(139, 92, 246, 0.6)",
            }}
          />
          {/* Chapter tick marks */}
          {chapters.map((ch) => {
            const pct = durationMs > 0 ? (ch.start_time_ms / durationMs) * 100 : 0;
            return (
              <div
                key={ch.id}
                className="absolute top-0 h-full w-0.5"
                style={{ left: `${pct}%`, background: "rgba(255, 255, 255, 0.35)" }}
                title={ch.title}
              />
            );
          })}
          {/* Playhead thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `calc(${progress}% - 8px)`,
              background: "white",
              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.5)",
            }}
          />
        </div>

        <div className="flex justify-between text-xs" style={{ color: "rgba(196, 181, 253, 0.8)" }}>
          <span>{formatDuration(currentTimeMs)}</span>
          <span>{formatDuration(durationMs)}</span>
        </div>
      </div>
    </div>
  );
}
