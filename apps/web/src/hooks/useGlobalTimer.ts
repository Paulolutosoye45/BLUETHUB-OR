import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { setTimerDisplay, setTimerRunning, setTimerElapsed, setTimeUp } from "@/store/class-action-slice";

interface UseGlobalTimerProps {
  onTargetReached?: () => void;
}

let globalIntervalRef: ReturnType<typeof setInterval> | null = null;
let globalStartTimeMs: number | null = null;
let globalElapsedSeconds = 0;
let globalTargetSeconds: number | null = null;

// Force reset all global timer state - call this on page mount
export function forceResetGlobalTimer() {
  if (globalIntervalRef) {
    clearInterval(globalIntervalRef);
    globalIntervalRef = null;
  }
  globalStartTimeMs = null;
  globalElapsedSeconds = 0;
  globalTargetSeconds = null;
}

export const useGlobalTimer = ({ onTargetReached }: UseGlobalTimerProps = {}) => {
  const dispatch = useDispatch();

  // ← all state lives in Redux now, shared across every component
  const timerDisplay   = useSelector((state: RootState) => state.action.timerDisplay);
  const isRunning      = useSelector((state: RootState) => state.action.timerRunning);
  const classDuration  = useSelector((state: RootState) => state.action.classDuration);

  const parseToSeconds = (time: string) => {
    const parts = time.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    throw new Error("Invalid time format");
  };

  const formatTime = (seconds: number) => {
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0
      ? `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const start = useCallback(() => {
    if (isRunning) return;

    if (classDuration && globalTargetSeconds === null) {
      globalTargetSeconds = parseToSeconds(classDuration);
    }

    globalStartTimeMs = performance.now() - globalElapsedSeconds * 1000;
    if (globalIntervalRef) {
      clearInterval(globalIntervalRef);
    }

    globalIntervalRef = setInterval(() => {
      if (globalStartTimeMs === null) return;

      const now = performance.now();
      globalElapsedSeconds = (now - globalStartTimeMs) / 1000;

      if (globalTargetSeconds !== null && globalElapsedSeconds >= globalTargetSeconds) {
        globalElapsedSeconds = globalTargetSeconds;
        dispatch(setTimerDisplay(formatTime(globalElapsedSeconds)));
        dispatch(setTimerElapsed(globalElapsedSeconds));

        if (globalIntervalRef) {
          clearInterval(globalIntervalRef);
          globalIntervalRef = null;
        }
        globalStartTimeMs = null;
        dispatch(setTimerRunning(false));
        dispatch(setTimeUp());
        onTargetReached?.();
        return;
      }

      dispatch(setTimerDisplay(formatTime(globalElapsedSeconds)));
      dispatch(setTimerElapsed(globalElapsedSeconds));
    }, 200);

    dispatch(setTimerRunning(true));
  }, [isRunning, classDuration]);

  const pause = useCallback(() => {
    if (!isRunning) return;

    if (globalIntervalRef) {
      clearInterval(globalIntervalRef);
      globalIntervalRef = null;
    }
    dispatch(setTimerRunning(false));
  }, [isRunning]);

  const stop = useCallback(() => {
    if (globalIntervalRef) {
      clearInterval(globalIntervalRef);
      globalIntervalRef = null;
    }
    globalStartTimeMs = null;
    dispatch(setTimerRunning(false));
  }, []);

  const reset = useCallback(() => {
    // Stop any running interval
    if (globalIntervalRef) {
      clearInterval(globalIntervalRef);
      globalIntervalRef = null;
    }
    // Reset all global state
    globalStartTimeMs = null;
    globalElapsedSeconds = 0;
    globalTargetSeconds = null;
    // Reset Redux state
    dispatch(setTimerDisplay("00:00"));
    dispatch(setTimerElapsed(0));
    dispatch(setTimerRunning(false));
  }, [dispatch]);

  // Set initial elapsed time (for continuing from a saved draft)
  const setInitialTime = useCallback((seconds: number) => {
    globalElapsedSeconds = seconds;
    dispatch(setTimerDisplay(formatTime(seconds)));
    dispatch(setTimerElapsed(seconds));
  }, [dispatch]);

  // Called from EndClass — stops timer globally, every subscriber sees it
  const endClass = useCallback(() => {
    stop();
    dispatch(setTimeUp());
  }, [stop]);

  return { start, pause, stop, reset, endClass, setInitialTime, isRunning, timerDisplay };
};