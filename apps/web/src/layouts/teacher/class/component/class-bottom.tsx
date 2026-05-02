import type { RootState } from "@/store";
import { setPauseTime } from "@/store/class-action-slice";
import { Button } from "@bluethub/ui-kit";
import { useDispatch, useSelector } from "react-redux";
import PlayIcon from "@/assets/svg/play.svg?react";
import PauseIcon from "@/assets/svg/pause.svg?react";
import EndClass from "@/pages/teacher/note-board/app-bottom/end-class";
import Audio from "./audio";
import toast from 'react-hot-toast';
import { useGlobalTimer } from "@/hooks/useGlobalTimer";
import { useSession } from "@/contexts/session-context";

const ClassBottom = () => {
    const dispatch = useDispatch();
    const timerElapsedSeconds = useSelector((state: RootState) => state.action.timerElapsedSeconds);
    const pauseTime = useSelector((state: RootState) => state.action.pauseTime);
    const timer = useGlobalTimer({});
    const { stopRecording } = useSession();

    const controlState: "start" | "pause" | "resume" = !pauseTime
        ? "pause"
        : (timerElapsedSeconds > 0 ? "resume" : "start");

    const controlLabel =
        controlState === "pause" ? "Pause" : controlState === "resume" ? "Resume" : "Start";

    const timeHanlder = async () => {
        if (!pauseTime) {
            // Pausing class should also mute mic for replay consistency.
            stopRecording();
            timer.pause();
            dispatch(setPauseTime(true));
            toast.success('time has paused');
            return;
        }

        timer.start();
        dispatch(setPauseTime(false));
        if (timerElapsedSeconds > 0) {
            toast.success('time has resumed');
        } else {
            toast.success('class has started');
        }
    }

    return (
        <div className="relative z-50 pointer-events-auto flex flex-col items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/90 p-2.5 shadow-xl backdrop-blur-sm">
            <Button
                onClick={timeHanlder}
                title={controlLabel}
                aria-label={controlLabel}
                className="size-10 cursor-pointer rounded-full bg-[#B1432E] text-white shadow-md transition-all duration-200 hover:bg-[#9B3A28]"
            >
                <span className="flex items-center justify-center">
                    {controlState === "pause" ? (
                        <PauseIcon className="size-5 text-white" />
                    ) : (
                        <PlayIcon className="size-5 text-white" />
                    )}
                </span>
            </Button>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                {controlLabel}
            </span>
            <EndClass />
            <Audio />
        </div>
    );
}

export default ClassBottom