import Participants from "@/pages/teacher/note-board/app-bar/participants";
import Time from "@/pages/teacher/note-board/app-bar/time";
import Topic from "@/pages/teacher/note-board/app-bar/topic";
import { PlayCircle } from "lucide-react";
import BoardSelector from "./board-selector";

const AppBar = () => {
    return (
        <div className="flex items-center justify-between font-poppins pl-3 border-b-2 border-b-[#3A3A3A80]">
            <div className="font-poppins flex items-center space-x-4 p-2">
                <Topic />
                <Time />
            </div>

            <div className="flex items-center gap-8 pr-3">
                {/* Opens the replay viewer in a new tab so the board stays live */}
                <button
                    onClick={() => window.open("/replay", "_blank", "noopener")}
                    title="Open replay viewer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                        bg-chestnut/10 hover:bg-chestnut/20 text-chestnut
                        text-xs font-semibold transition-colors"
                >
                    <PlayCircle className="w-4 h-4" />
                    Replay
                </button>

                <BoardSelector />

                <Participants />
            </div>
        </div>
    );
};

export default AppBar;