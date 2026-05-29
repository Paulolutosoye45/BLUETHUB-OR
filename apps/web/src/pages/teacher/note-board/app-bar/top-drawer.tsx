import { PlayCircle, X } from "lucide-react";
import Topic from "./topic";
import Time from "./time";
import BoardSelector from "@/layouts/teacher/class/component/board-selector";

// ── Mobile/Tablet Drawer ───────────────────────────────────────────────────────
export const TopNavDrawer = ({
    isOpen,
    onClose,
    isRecording,
    pauseTime,
}: {
    isOpen: boolean;
    onClose: () => void;
    isRecording: boolean;
    pauseTime: boolean;
}) => (
    <>
        {/* Backdrop */}
        <div
            aria-hidden="true"
            onClick={onClose}
            className={[
                "lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300",
                isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
            ].join(" ")}
        />

        {/* Drawer — slides down from top, covers top half */}
        <div
            className={[
                "lg:hidden fixed top-0 left-0 right-0 z-50 bg-white rounded-b-2xl",
                "transition-transform duration-300 ease-in-out",
                isOpen ? "translate-y-0" : "-translate-y-full",
            ].join(" ")}
        >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700 font-poppins">Session Info</span>
                <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <X size={16} className="text-gray-500" />
                </button>
            </div>

            {/* Drawer Content */}
            <div className="px-4 py-4 flex flex-col gap-4">

                {/* Status badge */}
                {isRecording && !pauseTime && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-red-50 border border-red-200 w-fit">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                        <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Live</span>
                    </div>
                )}
                {pauseTime && isRecording && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 border border-amber-200 w-fit">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Paused</span>
                    </div>
                )}

                {/* Topic */}
                <div className="w-full">
                    <Topic />
                </div>

                {/* Timers */}
                <div className="w-full md:hidden">
                    <Time />
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-3 flex-wrap">
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
    </>
);