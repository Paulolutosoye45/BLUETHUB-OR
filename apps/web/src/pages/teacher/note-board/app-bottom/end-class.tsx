import { Button } from "@bluethub/ui-kit";
import PhoneIcon from "@/assets/svg/phone.svg?react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setEndClass } from "@/store/class-action-slice";
import { useGlobalTimer } from "@/hooks/useGlobalTimer";
import { useSession } from "@/contexts/session-context";
import { lessonService } from "@/services/lesson";
import type { IActions } from "@/utils/constant";
import type { RootState } from "@/store";

const EndClass = () => {
  const dispatch = useDispatch();
  const { stopRecording } = useSession();
  const sessionId = useSelector((state: RootState) => state.action.sessionIdRef);

  const timer = useGlobalTimer({});

  const endClassHandler = async () => {
    await stopRecording(); // ensure audio stops and worker sends END
    dispatch(setEndClass());
    timer.stop();

    // ── Submit manifest to backend ────────────────────────────────────────
    // Give the worker ~200ms to emit the final MANIFEST_UPDATE before reading
    // localStorage, since END is async inside the worker.
    setTimeout(async () => {
      try {
        const raw = localStorage.getItem("currentBatches");
        if (!raw) return;
        const manifest = JSON.parse(raw) as IActions;
        if (!sessionId) return;

        await lessonService.submitManifest({ sessionId, manifest });
        toast.success("Session saved");
      } catch (err) {
        console.error("[EndClass] Failed to submit manifest:", err);
        toast.error("Session recorded locally — sync to backend failed");
      }
    }, 300);

    toast.success("Class has ended");
  };

  return (
    <Button
      onClick={endClassHandler}
      className="size-10 cursor-pointer rounded-full bg-[#D92D25] text-white shadow-md transition-all duration-200 hover:bg-[#B61F19]"
    >
      <PhoneIcon className="size-5 text-white" />
    </Button>
  );
};

export default EndClass;