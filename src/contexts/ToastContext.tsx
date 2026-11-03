import { createContext, useState, useRef, useEffect, type ReactNode } from "react";

export type ToastContextType = {
  toast: string;
  showToast: (message: string) => void;
  closeToast: () => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState("");
  const timer = useRef<number | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(""), 2800);
  };

  const closeToast = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    setToast("");
  };

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, closeToast }}>
      {children}
    </ToastContext.Provider>
  );
}
