import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-[--color-border] bg-[--color-surface-raised] px-2.5 py-1.5 text-sm text-[--color-foreground] placeholder-[--color-muted] outline-none focus:border-[--color-accent] transition-colors";

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
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={fieldId} className="text-xs text-[--color-muted] font-medium">
        {label}
      </label>
      <input id={fieldId} {...props} className={inputClass} />
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
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={fieldId} className="text-xs text-[--color-muted] font-medium">
        {label}
      </label>
      <textarea id={fieldId} {...props} className={cn(inputClass, "resize-none")} rows={3} />
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
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-xs text-[--color-muted] font-medium">
        {label}
      </label>
      <input
        id={fieldId}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </div>
  );
}
