import type { RootState } from "@/store";
import { useRef, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import type { SetStateAction } from "react";
  

interface UseGlobalTimerProps {
  // targetTime?: string; // "MM:SS" | "HH:MM:SS"
  onTargetReached?: () => void;
}

export const useGlobalTimer = ({
  onTargetReached,
}: UseGlobalTimerProps = {}) => {
 const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);
  const targetSecondsRef = useRef<number | null>(null);
  const elapsedSecondsRef = useRef(0);


  const classDuration = useSelector(
    (state: RootState) => state.action.classDuration
  );

  const [displayTime, setDisplayTime] = useState("00:00");
  const [isRunning, setIsRunning] = useState(false);

  const targetTime = classDuration

  // -------------------------
  // Helpers
  // -------------------------
  const parseToSeconds = (time: string) => {
    const parts = time.split(":").map(Number);

    if (parts.length === 2) {
      const [m, s] = parts;
      return m * 60 + s;
    }

    if (parts.length === 3) {
      const [h, m, s] = parts;
      return h * 3600 + m * 60 + s;
    }

    throw new Error("Invalid time format");
  };

  const formatTime = (seconds: number) => {
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return h > 0
      ? `${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m.toString().padStart(2, "0")}:${s
          .toString()
          .padStart(2, "0")}`;
  };

  // -------------------------
  // Core tick (NO DRIFT)
  // -------------------------
 const tick = () => {
  if (!startTimeRef.current) return;

  const now = performance.now();
  elapsedRef.current =
    (now - startTimeRef.current) / 1000;

  elapsedSecondsRef.current = elapsedRef.current; // ✅ ADD THIS

  if (
    targetSecondsRef.current !== null &&
    elapsedRef.current >= targetSecondsRef.current
  ) {
    elapsedRef.current = targetSecondsRef.current;
    elapsedSecondsRef.current = targetSecondsRef.current; // ✅ ADD THIS
    setDisplayTime(formatTime(elapsedRef.current));
    stop();
    onTargetReached?.();
    return;
  }

  setDisplayTime(formatTime(elapsedRef.current));
};


  // -------------------------
  // Controls
  // -------------------------
  const start = useCallback(() => {
    if (isRunning) return;

    if (targetTime) {
      targetSecondsRef.current = parseToSeconds(targetTime);
    }

    startTimeRef.current =
      performance.now() - elapsedRef.current * 1000;

    intervalRef.current = setInterval(tick, 200);
    setIsRunning(true);
  }, [isRunning, targetTime]);

  const pause = useCallback(() => {
    if (!isRunning) return;

    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    setIsRunning(false);
  }, [isRunning]);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    startTimeRef.current = null;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    elapsedRef.current = 0;
    setDisplayTime("00:00");
  }, [stop]);

  // -------------------------
  // PUBLIC API
  // -------------------------
  return {
    start,        // play / resume
    pause,        //  pause
    stop,         //  hard stop (YOU wanted this)
    reset,        // reset
    isRunning,
    displayTime,
    elapsedSecondsRef
  };
};
