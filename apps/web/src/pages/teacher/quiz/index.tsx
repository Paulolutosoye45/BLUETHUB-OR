import { Button } from "@bluethub/ui-kit"
import { Check, CircleQuestionMark, EllipsisVertical, LayoutGrid, PlusIcon, SquareChartGantt, UserRound } from "lucide-react"
import Card from "./card"

const QuizIndex = () => {
    return (
        <div className="p-3 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">

                {/* ── Top Nav ──────────────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-4 py-5 sticky top-0 z-30 bg-chestnut"
                >
                    <div className="flex items-center gap-2.5">
                        <LayoutGrid className="w-6 h-6 text-white" />
                        <span className="text-white font-semibold text-sm">My Quizzes</span>
                    </div>
                    <button className="text-white">
                        <EllipsisVertical size={18} />
                    </button>
                </div>

                {/* ── White card ───────────────────────────────────────────────── */}
                <div className="flex-1 p-4 bg-white/70 backdrop-blur-sm">
                    <div className="space-7-20">

                        {/* Page header row */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-xl font-bold text-blck-b2 leading-tight">
                                    My Quizzes
                                </h1>
                                <p className="text-sm text-[#A0A8C0]  mt-0.5">
                                    Create quizzes from your question bank and attach them to lessons
                                </p>
                            </div>
                            <Button
                                // onClick={() => navigate('/admin/registration/class/new')}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold  bg-chestnut shrink-0 transition-opacity hover:opacity-90"
                            >
                                <PlusIcon />
                                Create Quiz
                            </Button>
                        </div>

                        <div className="grid grid-cols-4 gap-[14px] my-[28px]">
                            <div className="border border[#E8E8E3] bg-white rounded-[13px] py-[18px] px-5 space-y-1">
                                <div className="bg-[#EEF1FB] rounded-[9px] w-9 h-9 flex items-center justify-center ">
                                    <CircleQuestionMark className="text-chestnut" />
                                </div>
                                <h4 className="pt-2 text-chestnut text-[28px] leading-[28px] font-semibold">
                                    6
                                </h4>
                                <p className="text-[#5A5A5A] font-normal text-xs">Total quizzes </p>
                            </div>
                            <div className="border border[#E8E8E3] bg-white rounded-[13px] py-[18px] px-5 space-y-1">
                                <div className="bg-[#E6F7F2] rounded-[9px] w-9 h-9 flex items-center justify-center ">
                                    <Check className="text-[#16A37A]" />
                                </div>
                                <h4 className="pt-2 text-[#16A37A] text-[28px] leading-[28px] font-semibold">
                                    2
                                </h4>
                                <p className="text-[#5A5A5A] font-normal text-xs">Attached to lessons </p>
                            </div>
                            <div className="border border[#E8E8E3] bg-white rounded-[13px] py-[18px] px-5 space-y-1">
                                <div className="bg-[#EEF1FB] rounded-[9px] w-9 h-9 flex items-center justify-center ">
                                    <SquareChartGantt className="text-chestnut" />
                                </div>
                                <h4 className="pt-2 text-chestnut text-[28px] leading-[28px] font-semibold">
                                    6
                                </h4>
                                <p className="text-[#5A5A5A] font-normal text-xs">Total questions used </p>
                            </div>
                            <div className="border border[#E8E8E3] bg-white rounded-[13px] py-[18px] px-5 space-y-1">
                                <div className="bg-[#FFF4DF] rounded-[9px] w-9 h-9 flex items-center justify-center ">
                                    <UserRound className="text-[#C0392B]" />
                                </div>
                                <h4 className="pt-2 text-[#C0392B] text-[28px] leading-[28px] font-semibold">
                                    102
                                </h4>
                                <p className="text-[#5A5A5A] font-normal text-xs">Students assigned </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <Card />
                            <Card />
                            <Card />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default QuizIndex