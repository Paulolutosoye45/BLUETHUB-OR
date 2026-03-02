import { Button } from "@bluethub/ui-kit";
import OffMicIcon from "@/assets/svg/off-mic.svg?react";
import MicIcon from "@/assets/svg/mic.svg?react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import toast from "react-hot-toast";

const Audio = () => {
  const { isRecording, startRecording } = useAudioRecorder();

  const classEnded = useSelector(
    (state: RootState) => state.action.classEnded
  );

  const handleMic = async () => {
    if (classEnded) {
      toast.error("Class has already ended");
      return;
    }

    if (!isRecording) {
      await startRecording();
    }
  };

  return (
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
  );
};

export default Audio;