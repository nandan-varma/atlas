import { useEffect, useState } from "react";
import { msToTimestamp, timestampToMs } from "@/lib/timestamps";
import { cn } from "@/lib/utils";

interface TimestampInputProps {
  value: number;
  onChange: (ms: number) => void;
  maxMs?: number;
  className?: string;
}

export function TimestampInput({ value, onChange, maxMs, className }: TimestampInputProps) {
  const [text, setText] = useState(msToTimestamp(value));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setText(msToTimestamp(value));
    setInvalid(false);
  }, [value]);

  const commit = () => {
    const parsed = timestampToMs(text);
    if (parsed === null || (maxMs !== undefined && parsed > maxMs)) {
      setInvalid(true);
      setText(msToTimestamp(value)); // revert
      return;
    }
    setInvalid(false);
    onChange(parsed);
  };

  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        setInvalid(false);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          setText(msToTimestamp(value));
          setInvalid(false);
        }
      }}
      className={cn(
        "w-28 rounded border px-1.5 py-0.5 text-xs font-mono bg-[--color-surface-raised] text-[--color-foreground] outline-none focus:border-[--color-accent] transition-colors",
        invalid ? "border-[--color-destructive]" : "border-[--color-border]",
        className,
      )}
      title={invalid ? "Invalid timestamp (HH:MM:SS.mmm)" : undefined}
    />
  );
}
