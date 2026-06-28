import CourseHero from "./course-hero"
import { useState } from "react";
import CourseOverview from "./course-overview";
import CourseTopics from "./course-topics";
import CourseAssessments from "./course-assessments";
import CoursePDFs from "./course-pdfs";

type Tab = "Overview" | "Topics" | "Assessments" | "PDFs";
const SubjectList = () => {

    const TABS: Tab[] = ["Overview", "Topics", "Assessments", "PDFs"];

    const [activeTab, setActiveTab] = useState<Tab>("Overview");

    return (
        <div className="min-h-screen bg-gray-50">
            <CourseHero
                department="SCIENCE DEPARTMENT"
                title="Basic Science"
                teacher="Mr. Emeka Nwosu"
                icon="🔬"
                topics={6}
                lessons={18}
                pdfs={5}
                quizzes={8}
                progress={42}
                lessonsCompleted={7}
                topicsRemaining={3}
            />

            <div className="mx-3 my-[11px]">
                {/* Tab Bar */}
                <div className="bg-white drop-shadow-sm p-[4px] rounded-[10px] flex items-center gap-1 mb-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 rounded-[8px] text-sm font-semibold transition-all duration-150 ${activeTab === tab
                                ? "bg-[#4F61E8] text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>


            </div>


            {activeTab === "Overview" && <CourseOverview />}
            {activeTab === "Topics" && <CourseTopics />}
            {activeTab === "Assessments" && <CourseAssessments />}
            {activeTab === "PDFs" && <CoursePDFs />}

        </div>
    )
}

export default SubjectList