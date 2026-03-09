import { useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { setTimerDisplay, setTimerRunning, setTimerElapsed, setTimeUp } from "@/store/class-action-slice";

interface UseGlobalTimerProps {
  onTargetReached?: () => void;
}

export const useGlobalTimer = ({ onTargetReached }: UseGlobalTimerProps = {}) => {
  const dispatch = useDispatch();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);
  const targetSecondsRef = useRef<number | null>(null);

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

  const tick = () => {
    if (!startTimeRef.current) return;

    const now = performance.now();
    elapsedRef.current = (now - startTimeRef.current) / 1000;

    if (targetSecondsRef.current !== null && elapsedRef.current >= targetSecondsRef.current) {
      elapsedRef.current = targetSecondsRef.current;
      dispatch(setTimerDisplay(formatTime(elapsedRef.current)));
      dispatch(setTimerElapsed(elapsedRef.current));
      stop();
      onTargetReached?.();
      return;
    }

    dispatch(setTimerDisplay(formatTime(elapsedRef.current)));
    dispatch(setTimerElapsed(elapsedRef.current));
  };

  const start = useCallback(() => {
    if (isRunning) return;
    if (classDuration) targetSecondsRef.current = parseToSeconds(classDuration);

    startTimeRef.current = performance.now() - elapsedRef.current * 1000;
    intervalRef.current = setInterval(tick, 200);
    dispatch(setTimerRunning(true));
  }, [isRunning, classDuration]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    dispatch(setTimerRunning(false));
  }, [isRunning]);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    startTimeRef.current = null;
    dispatch(setTimerRunning(false));
  }, []);

  const reset = useCallback(() => {
    stop();
    elapsedRef.current = 0;
    dispatch(setTimerDisplay("00:00"));
    dispatch(setTimerElapsed(0));
  }, [stop]);

  // Called from EndClass — stops timer globally, every subscriber sees it
  const endClass = useCallback(() => {
    stop();
    dispatch(setTimeUp());
  }, [stop]);

  return { start, pause, stop, reset, endClass, isRunning, timerDisplay };
};