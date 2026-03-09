import { useState, useEffect } from "react";

export const useTimer = () => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = () => {
    setSeconds(0);
    setIsRunning(true);
  };

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formatTime = (num: number) => String(num).padStart(2, "0");

  const time = `${formatTime(minutes)}:${formatTime(remainingSeconds)}`;

  return {
    startTimer,
    time,
  };
};
