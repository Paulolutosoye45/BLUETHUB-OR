import { Button } from "@bluethub/ui-kit";
import PhoneIcon from "@/assets/svg/phone.svg?react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setEndClass } from "@/store/class-action-slice";
import { useGlobalTimer } from "@/hooks/useGlobalTimer";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

const EndClass = () => {
  const dispatch = useDispatch();
  const { stopRecording } = useAudioRecorder();

  const timer = useGlobalTimer({});

  const endClassHandler = async () => {
    await stopRecording(); // 🔥 ensure audio stops immediately
    dispatch(setEndClass()); // update redux state
    timer.stop();

    toast.success("Class has ended");
  };

  return (
    <Button
      onClick={endClassHandler}
      className="bg-[#D92D25] rounded-full size-14 flex items-center justify-center"
    >
      <PhoneIcon className="size-6 text-white" />
    </Button>
  );
};

export default EndClass;