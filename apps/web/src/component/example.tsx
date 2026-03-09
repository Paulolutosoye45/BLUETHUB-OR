import { useTimer } from "@/hooks/useTimer";

export default function TimerExample() {
  const { startTimer, time } = useTimer();

  return (
    <div>
      <h1>{time}</h1>

      <button onClick={startTimer}>
        Start Timer
      </button>
    </div>
  );
}