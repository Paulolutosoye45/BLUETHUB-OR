import Participants from "@/pages/teacher/note-board/app-bar/participants";
import Topic from "@/pages/teacher/note-board/app-bar/topic";
import Time from "@/pages/teacher/note-board/app-bar/time";
import { PlayCircle } from "lucide-react";
import BoardSelector from "./board-selector";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

const AppBar = () => {
    const isRecording = useSelector((state: RootState) => state.action.isRecording);
    const pauseTime = useSelector((state: RootState) => state.action.pauseTime);

    return (
        <div className="flex items-center justify-between font-poppins px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
            {/* Left Section - Topic & Recording Status */}
            <div className="flex items-center gap-4">
                {/* Recording Indicator */}
                {isRecording && !pauseTime && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Live</span>
                    </div>
                )}
                {pauseTime && isRecording && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Paused</span>
                    </div>
                )}
                <Topic />
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-3">
                {/* Timers */}
                <Time />

                {/* Replay Button */}
                <button
                    onClick={() => window.open("/replay", "_blank", "noopener")}
                    title="Open replay viewer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl
                        bg-gradient-to-r from-violet-500 to-purple-600
                        hover:from-violet-600 hover:to-purple-700
                        text-white text-xs font-semibold
                        shadow-md hover:shadow-lg
                        transition-all duration-200"
                >
                    <PlayCircle className="w-4 h-4" />
                    Preview
                </button>

                {/* Board Selector */}
                <BoardSelector />

                {/* Participants */}
                <Participants />
            </div>
        </div>
    );
};

export default AppBar;
