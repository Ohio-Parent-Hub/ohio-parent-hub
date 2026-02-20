"use client";

import { memo, useEffect, useRef, useState } from "react";

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function FilterInput({ value, onChange, placeholder, className }: FilterInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localValue !== value) {
        onChangeRef.current(localValue);
      }
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [localValue, value]);

  return (
    <input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 ${className}`}
      placeholder={placeholder}
    />
  );
}

export default memo(FilterInput);
