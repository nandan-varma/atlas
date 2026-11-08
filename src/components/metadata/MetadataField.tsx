import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-xl px-3 py-2 text-sm outline-none transition-all placeholder:text-[#c4b5fd]";

const inputStyle = {
  background: "#f7f4ff",
  border: "1.5px solid rgba(139, 92, 246, 0.2)",
  boxShadow: "inset 0 2px 6px rgba(124, 58, 237, 0.07), inset 0 1px 2px rgba(0,0,0,0.04)",
  color: "#1e0e4b",
};

const inputFocusStyle = `
  [&:focus] { border-color: rgba(124,58,237,0.5); box-shadow: inset 0 2px 6px rgba(124,58,237,0.1), 0 0 0 3px rgba(124,58,237,0.1); }
`;

interface FieldProps {
  label: string;
  className?: string;
  id?: string;
}

export function TextField({
  label,
  className,
  id,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={fieldId} className="text-xs font-semibold" style={{ color: "#9d8ec7" }}>
        {label}
      </label>
      <input
        id={fieldId}
        {...props}
        className={inputBase}
        style={inputStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)";
          e.currentTarget.style.boxShadow =
            "inset 0 2px 6px rgba(124,58,237,0.1), 0 0 0 3px rgba(124,58,237,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)";
          e.currentTarget.style.boxShadow =
            "inset 0 2px 6px rgba(124,58,237,0.07), inset 0 1px 2px rgba(0,0,0,0.04)";
        }}
      />
      <style>{inputFocusStyle}</style>
    </div>
  );
}

export function TextAreaField({
  label,
  className,
  id,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={fieldId} className="text-xs font-semibold" style={{ color: "#9d8ec7" }}>
        {label}
      </label>
      <textarea
        id={fieldId}
        {...props}
        className={cn(inputBase, "resize-none")}
        style={inputStyle}
        rows={3}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)";
          e.currentTarget.style.boxShadow =
            "inset 0 2px 6px rgba(124,58,237,0.1), 0 0 0 3px rgba(124,58,237,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)";
          e.currentTarget.style.boxShadow =
            "inset 0 2px 6px rgba(124,58,237,0.07), inset 0 1px 2px rgba(0,0,0,0.04)";
        }}
      />
    </div>
  );
}

interface SelectFieldProps extends FieldProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export function SelectField({ label, options, value, onChange, id }: SelectFieldProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const listId = `list-${fieldId}`;
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label htmlFor={fieldId} className="text-xs font-semibold" style={{ color: "#9d8ec7" }}>
        {label}
      </label>
      <input
        id={fieldId}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase}
        style={inputStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)";
          e.currentTarget.style.boxShadow =
            "inset 0 2px 6px rgba(124,58,237,0.1), 0 0 0 3px rgba(124,58,237,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)";
          e.currentTarget.style.boxShadow =
            "inset 0 2px 6px rgba(124,58,237,0.07), inset 0 1px 2px rgba(0,0,0,0.04)";
        }}
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </div>
  );
}
