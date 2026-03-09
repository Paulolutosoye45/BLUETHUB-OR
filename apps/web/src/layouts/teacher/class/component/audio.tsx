import { Button } from "@bluethub/ui-kit";
import OffMicIcon from "@/assets/svg/off-mic.svg?react";
import MicIcon from "@/assets/svg/mic.svg?react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import toast from "react-hot-toast";
// import { useGlobalTimer } from "@/hooks/useGlobalTimer";
import { useTimer } from "@/hooks/useTimer";
import { Clock } from "lucide-react";

const Audio = () => {
  const { isRecording, startRecording } = useAudioRecorder();
  const { startTimer, time } = useTimer();


  const classEnded = useSelector(
    (state: RootState) => state.action.classEnded
  );

  const handleMic = async () => {
    if (classEnded) {
      toast.error("Class has already ended");
      return;
    }

    if (!isRecording) {
      startTimer()
      await startRecording();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-300">
        <Clock className="w-5 h-5 text-gray-600" />
        <div className="font-mono text-2xl font-bold text-gray-800">
          {time}
        </div>
      </div>
      <Button
        onClick={handleMic}
        disabled={classEnded}
        className="cursor-pointer bg-white drop-shadow-xl rounded-full size-14 flex items-center justify-center disabled:opacity-50"
      >
        {!isRecording ? (
          <OffMicIcon className="size-4 text-[#1EE23E]" />

        ) : (
          <MicIcon className="size-4 text-[#1EE23E]" />
        )}
      </Button>
    </div>
  );
};

export default Audio;