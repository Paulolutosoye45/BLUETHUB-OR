import TitleBar from "@/shared/title-bar";
import { useState } from "react";

const BRAND = "#292382";

interface Question {
    id: number;
    text: string;
    type: "Multiple choice" | "Short Answer";
}

const initialQuestions: Question[] = [
    { id: 1, text: "Analyze Causes of Situation depicted in the attached video clip.", type: "Multiple choice" },
    { id: 2, text: "What was the impact  of cell structure in Biology", type: "Multiple choice" },
    { id: 3, text: "Analyze Causes of Situation depicted in the attached video clip.", type: "Short Answer" },
    { id: 4, text: "What was the impact  of cell structure in Biology", type: "Short Answer" },
    { id: 5, text: "What was the impact  of cell structure in Biology", type: "Short Answer" },
    { id: 6, text: "What was the impact  of cell structure in Biology", type: "Short Answer" },
];

const ReviewQuestion = () => {
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [newQuestionText, setNewQuestionText] = useState("");
    const [newQuestionType, setNewQuestionType] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const handleEdit = (id: number) => {
        setEditingId(prev => (prev === id ? null : id));
    };

    const handleAddQuestion = () => {
        if (!newQuestionText.trim()) return;
        const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
        setQuestions(prev => [
            ...prev,
            {
                id: newId,
                text: newQuestionText.trim(),
                type: (newQuestionType.trim() as Question["type"]) || "Short Answer",
            },
        ]);
        setNewQuestionText("");
        setNewQuestionType("");
    };

    return (
        <div className="p-6 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">
      
            <TitleBar title="Review the question" hasBackIcons hasVertical />

                <div className="flex-1 flex gap-4 p-8 items-start bg-white/70 backdrop-blur-sm">
                    <div className="flex-1 flex flex-col gap-4 min-w-0">

                        {/* Document header */}
                        <div className="flex items-center gap-2.5 mb-1">
                            {/* PDF icon */}
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border-2"
                                style={{ borderColor: BRAND }}
                            >
                                <span className="text-[10px] font-black" style={{ color: BRAND }}>PDF</span>
                            </div>
                            <span className="text-base font-bold text-gray-800">
                                Document :Biology Test_v1_pdf
                            </span>
                        </div>

                        {/* Question cards */}
                        <div className="flex flex-col gap-3">
                            {questions.map((q) => (
                                <div
                                    key={q.id}
                                    className="bg-white rounded-xl border border-gray-200 px-4 pt-3 pb-3"
                                >
                                    {/* Top row: number + text + Question N label */}
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <p className="text-sm text-gray-800 font-medium leading-snug flex-1">
                                            <span className="mr-1">{q.id}.</span>
                                            {q.text}
                                        </p>
                                        <span
                                            className="text-xs font-semibold whitespace-nowrap shrink-0 text-chestnut"
                                        >
                                            Question {q.id}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <hr className="border-gray-100 mb-2.5" />

                                    {/* Bottom row: type + action buttons */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            Question type:{" "}
                                            <span className="font-medium text-gray-700">{q.type}</span>
                                        </span>

                                        <div className="flex items-center gap-2">
                                            {/* Edit button */}
                                            <button
                                                onClick={() => handleEdit(q.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                                style={{ backgroundColor: BRAND }}
                                            >
                                                Edit
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>

                                            {/* Delete button — only shown from Q2 onwards (Q1 has no delete in screenshot) */}
                                            {q.id > 1 && (
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inline edit area (appears when editing) */}
                                    {editingId === q.id && (
                                        <div className="mt-3 border-t border-gray-100 pt-3">
                                            <textarea
                                                defaultValue={q.text}
                                                rows={2}
                                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none outline-none focus:ring-2"
                                                style={{ "--tw-ring-color": `${BRAND}40` } as React.CSSProperties}
                                                onBlur={e => {
                                                    setQuestions(prev =>
                                                        prev.map(item =>
                                                            item.id === q.id ? { ...item, text: e.target.value } : item
                                                        )
                                                    );
                                                    setEditingId(null);
                                                }}
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Upload Questions button */}
                        <div className="flex justify-center mt-2">
                            <button
                                className="flex items-center gap-3 text-white font-semibold text-base px-16 py-3.5 rounded-full transition-opacity hover:opacity-90"
                                style={{ backgroundColor: BRAND }}
                            >
                                Upload Questions
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="w-92 shrink-0 bg-white rounded-xl border border-gray-200 p-4  flex-col gap-4 hidden md:flex">
                        {/* New Question label */}
                        <p className="text-sm font-bold text-gray-800">New Question</p>

                        {/* Rich text area */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Toolbar */}
                            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 border-b border-gray-200">
                                {/* B */}
                                <button className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold text-xs hover:bg-gray-200 rounded">
                                    B
                                </button>
                                {/* I */}
                                <button className="w-6 h-6 flex items-center justify-center text-gray-600 italic text-xs hover:bg-gray-200 rounded">
                                    I
                                </button>
                                {/* U */}
                                <button className="w-6 h-6 flex items-center justify-center text-gray-600 underline text-xs hover:bg-gray-200 rounded">
                                    U
                                </button>
                                {/* List */}
                                <button className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>

                            {/* Textarea */}
                            <textarea
                                value={newQuestionText}
                                onChange={e => setNewQuestionText(e.target.value)}
                                placeholder="Enter Your Question here............"
                                rows={5}
                                className="w-full px-3 py-2.5 text-xs text-gray-500 placeholder-gray-400 resize-none outline-none"
                            />
                        </div>

                        {/* Question Type label + input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-800">Question Type</label>
                            <input
                                type="text"
                                value={newQuestionType}
                                onChange={e => setNewQuestionType(e.target.value)}
                                placeholder="e.g Multiple choice"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2"
                                style={{ "--tw-ring-color": `${BRAND}30` } as React.CSSProperties}
                            />
                        </div>

                        {/* Add Question button */}
                        <div className="flex justify-end">
                        <button
                            onClick={handleAddQuestion}
                            className="py-2.5 px-4 bg-chestnut rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 text-center">
                            Add Question
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewQuestion;