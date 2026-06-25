import { Play } from "lucide-react"
import CoursesRecentActivity from "./courses-recent-activity"

const CourseOverview = () => {
    return (
        <div className="min-h-screen">
            {/* Continue Banner */}
            <div className="bg-[#4F61E8]  mx-3 rounded-2xl px-4 py-3 flex items-center gap-3">
                {/* Play button */}
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Play size={18} className="text-white fill-white" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                        Continue where you left off
                    </p>
                    <p className="text-white font-bold text-sm truncate">
                        The Solar System — Planets
                    </p>
                    <p className="text-white/60 text-xs">
                        Topic 2 · Subtopic 4 · 12 min
                    </p>
                </div>

                {/* Right play arrow */}
                <button className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Play size={14} className="text-white fill-white" />
                </button>
            </div>
            <div className="drop-shadow-[#0000000D] bg-white p-4 my-4 rounded-[14px] space-y-3">
                <div className="grid grid-cols-3 gap-2">
                    {/* topic */}
                    <div className="bg-[#F0F2FA] py-2.5 px-2 rounded-[10px] flex items-center justify-center space-y-[3px] flex-col">
                        <h2 className="text-[#4F61E8] font-extrabold text-[22px] leading-[22px]">6</h2>
                        <p className="capitalize text-[#94A3B8] font-medium text-[10px]">Topics</p>
                    </div>
                    {/* Lessons */}
                    <div className="bg-[#F0F2FA] py-2.5 px-2 rounded-[10px] flex items-center justify-center space-y-[3px] flex-col">
                        <h2 className="text-[#4F61E8] font-extrabold text-[22px] leading-[22px]">18</h2>
                        <p className="capitalize text-[#94A3B8] font-medium text-[10px]">Lessons</p>
                    </div>
                    {/* Quizzes */}
                    <div className="bg-[#F0F2FA] py-2.5 px-2 rounded-[10px] flex items-center justify-center space-y-[3px] flex-col">
                        <h2 className="text-[#4F61E8] font-extrabold text-[22px] leading-[22px]">8</h2>
                        <p className="capitalize text-[#94A3B8] font-medium text-[10px]">Quizzes</p>
                    </div>
                </div>

                <div className="pt-[1.15px] pb-[0.6px]">
                    <p className="text-[#4A5568] leading-[21.45px] text-sm">Explore the natural world through hands-on science. This course
                        covers living things, the solar system, matter, energy, the
                        environment, and human body systems — building a strong
                        foundation for senior science.</p>
                </div>

                <div className="flex items-center gap-[3px] ">
                    <h4 className="bg-[#4F61E81A] inline rounded-[15px]  px-[10px] py-[4px] text-[#4F61E8] font-medium uppercase text-[10px]">
                        jss 2
                    </h4>
                    <h4 className="bg-[#00BFA51F] inline rounded-[15px]  px-[10px] py-[4px] text-[#00BFA5] font-medium uppercase text-[10px]">
                        Second Term
                    </h4>
                    <h4 className="bg-[#FF8F001F] inline rounded-[15px]  px-[10px] py-[4px] text-[#FF8F00] font-medium uppercase text-[10px]">
                        WAEC Aligned
                    </h4>
                    <h4 className="bg-[#7C4DFF1A] inline rounded-[15px]  px-[10px] py-[4px] text-[#7C4DFF] font-medium uppercase text-[10px]">
                        Practical
                    </h4>
                </div>
            </div>

            <div className="mt-[20px] px-3">
                <CoursesRecentActivity />
            </div>
        </div>
    )
}

export default CourseOverview