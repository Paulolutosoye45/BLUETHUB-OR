import { Dialog, DialogContent, Input } from "@bluethub/ui-kit"
import { SquarePen, X } from "lucide-react"
import books from "@/assets/png/book.png"
import { QuizReviewModal } from "./quiz-review-modal";
import { useState } from "react";

interface SetQProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SetQuestion = ({ open, onOpenChange }: SetQProps) => {

    const quiz = {
        title: "Photosynthesis and plant nutrition",
        teacher: "Mrs. Adaeze Okafor",
        subject: "Basic Science",
        class: "JSS 2A",
        term: "Second term",
        id: "SYL-2025-019",
        questions: [
            {
                id: "q1",
                question: "Which organelle is responsible for producing energy in the cell?",
                type: "MCQ",
                level: "Easy",
            },
            {  
                id: "q2",
                question: "The process by which plants make food using sunlight is called ___?",
                type: "True/false",
                level: "Medium",
            },
        ],
    };
    const [openModal, setOpenModal] = useState(false);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-[#292382]">
                        <div className="flex items-center gap-2">
                            <SquarePen className="w-4 h-4 text-white" />
                            <h2 className="text-white font-semibold text-sm">Set Questions</h2>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    <div className="px-5 pb-5 space-y-5 h-[473px] ">
                        {/* Current class pill */}
                        <div className="flex items-center justify-between bg-[#EEF1FB] rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-[#292382]/20 flex items-center justify-center">
                                    <span className="text-[#292382] font-bold text-xs">BS</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium">current Class</p>
                                    <p className="text-[#0F0F0E] font-semibold text-sm">Basic Science</p>
                                </div>
                            </div>
                            <span className="text-[#292382] font-bold text-sm">JSS2A</span>
                        </div>

                        {/* Book illustration */}
                        <div className="flex flex-col items-center py-4 space-y-2">
                            <img src={books} alt="books" className="w-[133px] h-[133px]" />
                            <h3 className="text-[#0F0F0E] font-bold text-base">
                                Your Class Has Been Submitted
                            </h3>
                            <p className="text-gray-400 text-xs">
                                Have A Question ?
                            </p>
                        </div>

                        {/* Error state */}
                        {/* <div className="flex items-center justify-between border-2 border-red-400 rounded-xl px-4 py-3 bg-white">
                <span className="text-red-400 text-sm font-medium">Invalid Quiz ID</span>
                <button className="text-[#292382] font-bold text-sm hover:opacity-70 transition-opacity">
                    Retry
                </button>
            </div> */}
                        <Input placeholder="Enter Quiz ID" className="w-full rounded-xl px-4 py-3 bg-white h-[50px]" />

                        {/* Dismiss */}
                        <div className="text-center">
                            <button
                                onClick={() => { setOpenModal(true) }}
                                className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <QuizReviewModal open={openModal} onOpenChange={setOpenModal} quiz={quiz} />
        </>
    )
}

export default SetQuestion