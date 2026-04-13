import { useEffect, useCallback, useRef } from 'react';

const DEBOUNCE_MS = 1000;

export function useAutoSave<T extends Record<string, any>>(
  key: string,
  formData: T,
  setFormData: (data: T) => void,
  enabled: boolean = true
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  // Load saved data on mount
  useEffect(() => {
    if (!enabled || initialLoadDone.current) return;
    initialLoadDone.current = true;
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if there's actual data (not all empty)
        const hasData = Object.values(parsed).some(v => v !== '' && v !== null && v !== undefined);
        if (hasData) {
          setFormData({ ...formData, ...parsed });
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [key, enabled]);

  // Auto-save on change (debounced)
  useEffect(() => {
    if (!enabled || !initialLoadDone.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`autosave_${key}`, JSON.stringify(formData));
      } catch {
        // storage full - ignore
      }
    }, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [key, formData, enabled]);

  const clearAutoSave = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
  }, [key]);

  return { clearAutoSave };
}
