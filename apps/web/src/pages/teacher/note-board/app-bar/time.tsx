import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { parseTime } from "@/utils";
import { Clock, Timer, AlertTriangle } from "lucide-react";

// total seconds → "MM:SS" or "HH:MM:SS"
const fromSeconds = (total: number): string => {
  const s = total % 60;
  const m = Math.floor((total % 3600) / 60);
  const h = Math.floor(total / 3600);
  return h > 0
    ? `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const Time = () => {
  const classDuration = useSelector((state: RootState) => state.action.classDuration);
  const timeUp = useSelector((state: RootState) => state.action.timeUp);
  const pauseTime = useSelector((state: RootState) => state.action.pauseTime);
  const timerElapsedSeconds = useSelector((state: RootState) => state.action.timerElapsedSeconds);

  // Compute countdown from elapsed
  const totalSeconds = parseTime(classDuration);
  const elapsedSeconds = Math.max(0, Math.round(timerElapsedSeconds));
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  const displayTime = fromSeconds(remaining);
  const elapsedDisplay = fromSeconds(elapsedSeconds);

  // Calculate percentage for progress indicator
  const progress = totalSeconds > 0 ? Math.min(100, (elapsedSeconds / totalSeconds) * 100) : 0;
  const isLowTime = remaining < 300 && remaining > 0; // Less than 5 minutes

  return (
    <div className="flex items-center gap-4">
      {/* Elapsed Time */}
      <div className=" hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
        <Timer className="w-4 h-4 text-blue-600" />
        <div className="flex flex-col ">
          <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wide leading-none">
            Elapsed
          </span>
          <span className="text-sm font-bold text-blue-700 tabular-nums">
            {elapsedDisplay}
          </span>
        </div>
      </div>

      {/* Remaining Time — only shown when lesson duration is set */}
      {totalSeconds > 0 && (
        <>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
              timeUp
                ? "bg-red-50 border-red-300"
                : isLowTime
                ? "bg-amber-50 border-amber-300 animate-pulse"
                : pauseTime
                ? "bg-gray-100 border-gray-300"
                : "bg-emerald-50 border-emerald-200"
            }`}
          >
            {timeUp ? (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            ) : (
              <Clock className={`w-4 h-4 ${isLowTime ? "text-amber-600" : pauseTime ? "text-gray-500" : "text-emerald-600"}`} />
            )}
            <div className="flex flex-col">
              <span
                className={`text-[10px] font-medium uppercase tracking-wide leading-none ${
                  timeUp ? "text-red-400" : isLowTime ? "text-amber-400" : pauseTime ? "text-gray-400" : "text-emerald-400"
                }`}
              >
                {timeUp ? "Time Up" : "Remaining"}
              </span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  timeUp ? "text-red-700" : isLowTime ? "text-amber-700" : pauseTime ? "text-gray-600" : "text-emerald-700"
                }`}
              >
                {displayTime}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {!pauseTime && (
            <div className="hidden md:flex flex-col gap-1">
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    timeUp
                      ? "bg-red-500"
                      : isLowTime
                      ? "bg-amber-500"
                      : "bg-gradient-to-r from-blue-500 to-emerald-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[9px] text-gray-400 text-center">{Math.round(progress)}%</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Time;
