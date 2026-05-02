import { Dialog, DialogContent, } from "@bluethub/ui-kit"

export type QuestionLevel = "Easy" | "Medium" | "Hard";

export type QuestionType = "MCQ" | "True/false";

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  level: QuestionLevel;
}

export interface Quiz {
  id: string;
  title: string;
  teacher: string;
  subject: string;
  class: string;
  term: string;
  questions: QuizQuestion[];
}
export interface QuizReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz | null;
}

export const QuizReviewModal = ({ open, onOpenChange, quiz }: QuizReviewModalProps) => {
    if (!quiz) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl p-0 overflow-hidden rounded-md">

                {/* Header */}
                <div className="flex items-start gap-3 p-5 border-b border-[#E8E8E3]">
                    <div className="w-10 h-10 rounded-xl bg-[#F4E9D8] flex items-center justify-center">
                        🕒
                    </div>

                    <div className="flex-1">
                        <h2 className="text-sm font-semibold text-[#0F0F0E]">
                            {quiz.title}
                        </h2>
                        <p className="text-[11px] text-[#A8A8A4] mt-0.5">
                            {quiz.teacher} · {quiz.subject} · {quiz.class} · {quiz.term}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-5 space-y-4 max-h-[65vh] overflow-y-auto">

                    {/* Purple Quiz ID Banner */}
                    <div className="bg-chestnut text-white rounded-md p-4 flex justify-between items-center">
                        <div>
                            <p className="text-xs opacity-80">Quiz ID (attach to your lesson)</p>
                            <p className="text-sm font-semibold">{quiz.id}</p>
                        </div>

                        <button className="text-xs bg-white/20 px-3 py-1 rounded-lg">
                            Copy ID
                        </button>
                    </div>

                    {/* Question count */}
                    <p className="text-xs text-[#6B7280]">
                        {quiz.questions.length} questions in this quiz
                    </p>

                    {/* Questions List */}
                    <div className="space-y-3">
                        {quiz.questions.map((q: any, i: number) => (
                            <div
                                key={i}
                                className="bg-[#F9FAFB] rounded-xl p-4"
                            >
                                <p className="text-xs text-[#0F0F0E] mb-2">
                                    {i + 1}. {q.question}
                                </p>

                                <div className="flex items-center gap-2 text-[10px]">
                                    <span className="text-chestnut font-medium">
                                        {q.type}
                                    </span>

                                    <span
                                        className={`px-2 py-0.5 rounded-md ${
                                            q.level === "Easy"
                                                ? "bg-green-100 text-green-600"
                                                : q.level === "Medium"
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-red-100 text-red-600"
                                        }`}
                                    >
                                        {q.level}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t-2 border-[#E8E8E3]">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-2 text-xs rounded-lg border"
                    >
                        Close
                    </button>

                    <button className="px-4 py-2 text-xs rounded-lg bg-chestnut text-white">
                        ✓ Attach to lesson
                    </button>
                </div>

            </DialogContent>
        </Dialog>
    );
};