import { Button } from "@bluethub/ui-kit";
import TimeIcon from "@/assets/svg/time-fill.svg?react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { parseTime } from "@/utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

// total seconds → "MM:SS" or "HH:MM:SS"
const fromSeconds = (total: number): string => {
  const s = total % 60;
  const m = Math.floor((total % 3600) / 60);
  const h = Math.floor(total / 3600);
  return h > 0
    ? `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// ─────────────────────────────────────────────────────────────────────────────

const Time = () => {
  const classDuration = useSelector((state: RootState) => state.action.classDuration);
  const timeUp = useSelector((state: RootState) => state.action.timeUp);
  const pauseTime = useSelector((state: RootState) => state.action.pauseTime);

  const timerElapsedSeconds = useSelector((state: RootState) => state.action.timerElapsedSeconds);

  // ── Compute countdown from elapsed ────────────────────────────────────────
  // classDuration is the total class length e.g. "30:00"
  // timerDisplay is how much has elapsed e.g. "00:08"
  // remaining = classDuration - elapsed, clamped to 0
  const totalSeconds = parseTime(classDuration);          // uses your existing util
  const elapsedSeconds = Math.max(0, Math.floor(timerElapsedSeconds));
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  const displayTime = fromSeconds(remaining);

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ NO setInterval here — no Redux dispatch here.
  //    This component is purely a display: it reads elapsed from Redux
  //    (written by useGlobalTimer) and shows the countdown visually.
  //    All timer logic lives in useGlobalTimer + useAudioRecorder.
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex items-center justify-center gap-7">
      <Button
        className={`group flex items-center gap-2 cursor-pointer transition-colors duration-200 
        ${timeUp
            ? "bg-transparent border border-[#EC1B2C] text-[#EC1B2C] hover:bg-[#EC1B2C] hover:text-white"
            : "bg-bLemon text-white hover:bg-bLemon/80"
          } ${pauseTime && "bg-[#ff0000] text-white hover:bg-red-700"}`}
      >
        <TimeIcon
          className={`size-5 transition-colors duration-200
          ${timeUp ? "text-[#EC1B2C] group-hover:text-white" : "text-white"}`}
        />
        <span
          className={`font-Poppins font-semibold text-sm leading-[100%] transition-colors duration-200
          ${timeUp ? "text-[#EC1B2C] group-hover:text-white" : "text-white"}`}
        >
          {displayTime}
        </span>
      </Button>
    </div>
  );
};

export default Time;