import { Button } from "@bluethub/ui-kit";
import OffMicIcon from "@/assets/svg/off-mic.svg?react";
import MicIcon from "@/assets/svg/mic.svg?react";
import { useSession } from "@/contexts/session-context";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import toast from "react-hot-toast";
import { useTimer } from "@/hooks/useTimer";
import { Clock } from "lucide-react";

const Audio = () => {
  const { isRecording, startRecording, stopRecording } = useSession();
  const { startTimer, time } = useTimer();


  const classEnded = useSelector(
    (state: RootState) => state.action.classEnded
  );

  const handleMic = async () => {
    if (classEnded) {
      toast.error("Class has already ended");
      return;
    }

    if (isRecording) {
      stopRecording();
      toast.success("Mic muted");
      return;
    }

    startTimer();
    await startRecording();
    toast.success("Mic unmuted");
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className="pointer-events-none absolute -top-32 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-2 py-1 shadow-sm">
        <Clock className="size-3.5 text-slate-500" />
        <div className="font-mono text-xs font-semibold text-slate-700">
          {time}
        </div>
      </div>

      <Button
        onClick={handleMic}
        disabled={classEnded}
        className="size-10 cursor-pointer rounded-full bg-white text-[#1EE23E] shadow-md transition-all duration-200 hover:bg-slate-50 disabled:opacity-50"
      >
        {!isRecording ? (
          <OffMicIcon className="size-4" />
        ) : (
          <MicIcon className="size-4" />
        )}
      </Button>
    </div>
  );
};

export default Audio;