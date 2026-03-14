"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
  exiting?: boolean;
};

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;
const DURATION = 4000;
const EXIT_MS = 200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const startExit = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type }]);
      const timer = setTimeout(() => startExit(id), DURATION);
      timers.current.set(id, timer);
    },
    [startExit]
  );

  const dismiss = useCallback(
    (id: number) => {
      const timer = timers.current.get(id);
      if (timer) clearTimeout(timer);
      timers.current.delete(id);
      startExit(id);
    },
    [startExit]
  );

  useEffect(() => {
    return () => timers.current.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <ToastContext value={{ toast }}>
      {children}

      {/* Top-center toast container */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-4 pt-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border px-4 py-2.5 shadow-md transition-all duration-200 ${
              t.exiting
                ? "translate-y-[-8px] opacity-0"
                : "translate-y-0 opacity-100 animate-in slide-in-from-top-2 fade-in"
            }`}
            style={{
              backgroundColor: t.type === "error" ? "#FEF2F2" : "#F0FAF9",
              borderColor: t.type === "error" ? "#FECACA" : "#B8D8D5",
              color: t.type === "error" ? "#991B1B" : "#3D6B67",
            }}
          >
            {t.type === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            <span className="text-sm font-medium">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-1 shrink-0 rounded p-0.5 opacity-50 transition-opacity hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
