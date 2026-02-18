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

           toast.success('time was paused')
       }
    }

    return (
        <div className="flex items-center justify-space-between space-x-2">
            <Button
                onClick={timeHanlder}
                className=" hover:bg- cursor-pointer bg-student-chestnut drop-shadow-xl rounded-full size-14 flex items-center justify-center"
            >
                <span className="font-Irish-Grover text-white font-medium text-2xl leading-[100%]">
                    {pauseTime ? (
                        <PlayIcon className="size-6 text-white" />
                    ) : (
                        <PauseIcon className="size-6" />
                    )}
                </span>
            </Button>
            <EndClass />
            <Audio />
        </div>
    );
}

export default ClassBottom