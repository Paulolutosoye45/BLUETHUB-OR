import type { RootState } from "@/store";
import { pauseCurrentTime } from "@/store/class-action-slice";
import { Button } from "@bluethub/ui-kit";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PlayIcon from "@/assets/svg/play.svg?react";
import PauseIcon from "@/assets/svg/pause.svg?react";
import EndClass from "@/pages/teacher/note-board/app-bottom/end-class";
import Audio from "./audio";
import toast from 'react-hot-toast';

const ClassBottom = () => {
    const dispatch = useDispatch();
    const pauseTime = useSelector((state: RootState) => state.action.pauseTime);

    useEffect(() => { }, [pauseTime]);

    const timeHanlder = () => {
       dispatch(pauseCurrentTime())
       if (pauseTime) {
         toast.success('time has resumed')
       } else {

           toast.success('time has paused')
       }
    }

    return (
        <div className="relative z-50 pointer-events-auto flex flex-col items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/90 p-2.5 shadow-xl backdrop-blur-sm">
            <Button
                onClick={timeHanlder}
                className="size-10 cursor-pointer rounded-full bg-[#B1432E] text-white shadow-md transition-all duration-200 hover:bg-[#9B3A28]"
            >
                <span className="flex items-center justify-center">
                    {pauseTime ? (
                        <PlayIcon className="size-5 text-white" />
                    ) : (
                        <PauseIcon className="size-5 text-white" />
                    )}
                </span>
            </Button>
            <EndClass />
            <Audio />
        </div>
    );
}

export default ClassBottom