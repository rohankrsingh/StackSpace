import { useCallback } from "react";

export function useCopyToClipboard() {
  return useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const getItem = useCallback(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const setItem = useCallback(
    (value: T) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error("Failed to set localStorage", error);
      }
    },
    [key]
  );

  return [getItem(), setItem] as const;
}
