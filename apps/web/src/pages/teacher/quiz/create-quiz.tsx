import { Button, Input, Label } from "@bluethub/ui-kit"
import { EllipsisVertical, PlusIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

const CreateQuiz = () => {
    const navigate = useNavigate()
    return (
        <div className="p-3 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">

                {/* ── Top Nav ──────────────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-4 py-5 sticky top-0 z-30 bg-chestnut"
                >
                    <div className="flex items-center gap-2.5">
                        <span className="text-white font-semibold text-sm">Create Quiz </span>
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
                                    No Quiz  yet
                                </h1>
                                <p className="text-sm text-[#A0A8C0]  mt-0.5">
                                    Upload question into teacher’s poertal
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate('/admin/registration/class/new')}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold  bg-chestnut shrink-0 transition-opacity hover:opacity-90"
                            >
                                <PlusIcon />
                                View Question
                            </Button>
                        </div>

                        <div className="border border-[#D9D9D9] bg-white rounded-[10px] pb-5 pt-2.5  px-4">
                            <div className="p-[2px] border-b-2 border-[#D9D9D9] pb-[6px]  mb-[9px]">
                                <h2 className="text-[#3A3A3A] font-medium font-poppins text-sm">Create a quiz</h2>
                                <span className="font-medium text-xs text-[#3A3A3A80]">Create a quiz Set quiz details, pick questions from the bank, and get a quiz ID</span>
                            </div>

                            <div className="space-y-2.5 pb-8 border border-[#D9D9D9] bg-white ">
                                <h2 className="text-[#3A3A3A] text-xs leading-2.5">Quiz Details</h2>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-[#3A3A3A]">
                                        Quiz title <span className="text-red-500">*</span>
                                    </Label>

                                    <Input
                                        type="text"
                                        placeholder="Enter quiz ID"
                                        className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-chestnut/40 focus:border-chestnut/40 outline-none transition"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateQuiz