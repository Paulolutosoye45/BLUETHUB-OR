import Participants from "@/pages/teacher/note-board/app-bar/participants";
import Time from "@/pages/teacher/note-board/app-bar/time";
import Topic from "@/pages/teacher/note-board/app-bar/topic";


const AppBar = () => {
    return (
        <div className=" flex items-center justify-between font-poppins pl-3 border-b-2 border-b-[#3A3A3A80] ">
            <div className="font-poppins flex items-center space-x-4  p-2">
                <Topic />
                <div>
                    <Time />
                </div>
            </div>
            <Participants />
        </div>
    );
}

export default AppBar