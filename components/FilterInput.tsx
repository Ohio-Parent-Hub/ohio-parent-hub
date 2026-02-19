"use client";

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function FilterInput({ value, onChange, placeholder, className }: FilterInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 ${className}`}
      placeholder={placeholder}
    />
  );
}
