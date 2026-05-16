"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-rose-50 border-rose-200 text-rose-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }[type];

  // TypeScript: paksa kesesuaian dengan union IconName di icons.tsx.
  // (Toast butuh 3 ikon saja: check/alert/spark)
  const IconName = ({
    success: "check",
    error: "alert",
    info: "spark",
  } as const)[type] as Parameters<typeof Icon>[0]["name"];

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg ${bgColor}`}>
      <Icon name={IconName} className="h-5 w-5" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-current opacity-70 hover:opacity-100">
        <Icon name="x" className="h-4 w-4" />
      </button>
    </div>
  );
}
