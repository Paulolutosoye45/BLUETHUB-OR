import { CircleAlert, EllipsisVertical, PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Student = () => {
    const navigate = useNavigate()
    return (
        <div className="p-6 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/70  overflow-hidden">
                <div
                    className="flex items-center justify-between px-5 h-12 sticky top-0 z-30 bg-chestnut">
                    <div className="flex items-center gap-2.5">
                        {/* Grid icon */}
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                        </svg>
                        <span className="text-white font-semibold text-sm">Register Subject</span>
                    </div>
                    {/* Three-dot */}
                    <EllipsisVertical />
                </div>

                <div className="flex-1 px-8 pb-8 bg-white/20 backdrop-blur-sm">

                    <div className="relative z-10 flex flex-col items-center px-6 pt-8 pb-6 flex-1">
                        <div className="relative w-52 h-44 flex items-center justify-center mb-2 shrink-0">
                            <div
                                className="absolute w-36 h-36 rounded-full border-2 border-dashed border-chestnut/40"
                            />
                            <div className="w-26 h-26 rounded-full flex items-center justify-center z-10 shadow-lg bg-chestnut">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="absolute flex items-center gap-1 bg-white rounded-full p-2"
                                style={{ top: 10, right: -20 }}>
                                <span className="text-[11px] flex items-center font-semibold text-chestnut"><PlusIcon className="size-3" />Mathematics</span>
                            </div>

                            {/* + Biology — right */}
                            <div
                                className="absolute flex items-center gap-1 bg-white p-2 rounded-full" style={{ top: "50%", right: -20, transform: "translateY(-50%)" }}>
                                <span className="text-[11px] flex items-center  font-semibold text-chestnut"><PlusIcon className="size-3" /> Biology</span>
                            </div>

                            <div
                                className="absolute flex items-center gap-1 bg-white p-2 rounded-full" style={{ bottom: 24, left: -8 }}>
                                <span className="text-[11px] flex items-center font-semibold text-chestnut"><PlusIcon className="size-3" /> English</span>
                            </div>
                        </div>

                        {/* Welcome pill */}
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 bg-chestnut/18">
                            {/* Person icon */}
                            <svg className="w-3.5 h-3.5 shrink-0 text-chestnut" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
                            </svg>
                            <span className="text-xs font-semibold text-chestnut">
                                Welcome, John Paul — Let's get started
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-[26px] font-semibold  text-[#12122A] text-center mb-3">
                            No Student  registered yet
                        </h1>

                        {/* Sub-text */}
                        <p className="text-sm text-chestnut/50 text-center  leading-relaxed mb-6">
                            Greenfield College doesn't have any student  set up yet. Add your first Student
                            now and they'll be available when registering Report Sheet and feedback .
                        </p>

                        {/* Two-step guide */}
                        <div className="grid grid-cols-2 gap-6 mb-8 w-full">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-chestnut"
                                >
                                    1
                                </div>
                                <p className="text-sm font-semibold text-[#12122A]">Add a Student</p>
                                <p className="text-[11px] text-chestnut/50 leading-snug">
                                    Enter the student name and
                                    assign it to a school level
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-chestnut"
                                >
                                    2
                                </div>
                                <p className="text-sm font-semibold text-[#12122A]">You're all set</p>
                                <p className="text-[11px] text-chestnut/50 leading-snug">
                                    Student  appear in School
                                    registration and portal
                                    profiles
                                </p>
                            </div>
                        </div>

                        {/* Register button */}
                        <button onClick={() => navigate("enrollment")} className="flex items-center gap-2 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-opacity hover:opacity-90 mb-3 bg-chestnut">
                            <PlusIcon />
                            Register Your First Student
                        </button>

                        {/* Hint */}
                        <div className="flex items-center gap-1.5">
                             <CircleAlert className="w-3.5 h-3.5 text-gray-400 shrink-0"  />
                            <span className="text-[11px] text-gray-400">
                                You can add multiple Student one after another
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Student