// import Participants from "@/pages/teacher/note-board/app-bar/participants";
import Topic from "@/pages/teacher/note-board/app-bar/topic";
import Time from "@/pages/teacher/note-board/app-bar/time";
import { Menu, PlayCircle } from "lucide-react";
import BoardSelector from "./board-selector";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { TopNavDrawer } from "@/pages/teacher/note-board/app-bar/top-drawer";
import { useState } from "react";

const AppBar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const isRecording = useSelector((state: RootState) => state.action.isRecording);
    const pauseTime = useSelector((state: RootState) => state.action.pauseTime);

    return (
        <>
            <div className="flex items-center justify-between font-poppins px-3 sm:px-4 py-2 sm:py-3 bg-white border-b border-gray-200 shadow-sm gap-2">
                {/* Mobile/tablet hamburger */}
                <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Open session menu"
                >
                    <Menu size={18} className="text-gray-600" />
                </button>

                {/* Left — always visible */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    {isRecording && !pauseTime && (
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 shrink-0">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                            </span>
                            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Live</span>
                        </div>
                    )}
                    {pauseTime && isRecording && (
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 shrink-0">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Paused</span>
                        </div>
                    )}
                    <div className="min-w-0 ">
                        <Topic />
                    </div>
                </div>

                {/* Right — full on desktop, hamburger on mobile/tablet */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                    <div className=" md:inline-flex lg:hidden"><Time /></div>

                    {/* Desktop only */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Time />
                        <button
                            onClick={() => window.open("/replay", "_blank", "noopener")}
                            title="Open replay viewer"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl
                bg-gradient-to-r from-violet-500 to-purple-600
                hover:from-violet-600 hover:to-purple-700
                text-white text-xs font-semibold
                shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <PlayCircle className="w-4 h-4" />
                            Preview
                        </button>
                        <BoardSelector />
                    </div>


                </div>
            </div>

            {/* Mobile drawer */}
            <TopNavDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                isRecording={isRecording}
                pauseTime={!!pauseTime}
            />
        </>
    );
};

export default AppBar;
