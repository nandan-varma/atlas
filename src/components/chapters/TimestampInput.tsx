import { useEffect, useState } from "react";
import { msToTimestamp, timestampToMs } from "@/lib/timestamps";

interface TimestampInputProps {
  value: number;
  onChange: (ms: number) => void;
  maxMs?: number;
  className?: string;
}

export function TimestampInput({ value, onChange, maxMs }: TimestampInputProps) {
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
      setText(msToTimestamp(value));
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
      className="w-28 text-xs font-mono outline-none"
      style={{
        background: "#f7f4ff",
        borderRadius: 9,
        border: invalid
          ? "1.5px solid rgba(239, 68, 68, 0.6)"
          : "1.5px solid rgba(139, 92, 246, 0.2)",
        boxShadow: invalid
          ? "inset 0 2px 4px rgba(239, 68, 68, 0.08)"
          : "inset 0 2px 4px rgba(124, 58, 237, 0.06)",
        color: "#1e0e4b",
        padding: "3px 8px",
      }}
      title={invalid ? "Invalid timestamp (HH:MM:SS.mmm)" : undefined}
    />
  );
}
