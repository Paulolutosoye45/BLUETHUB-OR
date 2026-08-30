
// import { Button } from "@bluethub/ui-kit"
import AssessmentSelectSubject from "./assessment-select-subject"
import { useNavigate, useOutletContext } from "react-router-dom"
import { EllipsisVertical, Menu } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const Assessment = () => {
  const navigate = useNavigate()
  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="lg:p-2 font-poppins">
      <div className="backdrop-blur-sm lg:rounded-2xl border border-white/20  overflow-hidden">
        {/* <TitleBar title="" hasVertical /> */}
        <div className={`bg-linear-to-r from-chestnut to-chestnut/90 px-4 sm:px-6 py-4 sm:py-5 lg:rounded-t-lg flex items-center justify-between`}>

          {/* Left side — back arrow + title + chevron */}
          <div className="flex items-center gap-2.5">
            <Menu className="lg:hidden  w-5 h-5 text-white" onClick={openMobileNav} />
            <h2 className="font-semibold font-poppins text-lg text-white leading-none">
              question
            </h2>
          </div>

          {/* Right side — action button + kebab menu */}
          <div className="flex items-center gap-2.5 relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="text-white/80 hover:text-white transition-colors p-1 rounded"
            >
              <EllipsisVertical size={18} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-8 z-50 overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-44">
                {[
                  { label: "View Existing Questions", link: '/teacher/assessment/questionlist' },
                  { label: "Browse Question Bank", link: '/teacher/assessment/view-questions' },
                  { label: "Generate Quiz", link: '/teacher/assessment/generate-quiz' },
                  { label: "Extract Question", link: '/teacher/assessment/upload-scan' },
                  { label: "Set Question", link: '/teacher/assessment/createQuiz' },
                  { label: "My Uploads", link: '/teacher/assessments/My-Uploads' },
                  { label: "Assessment Settings", link: '/teacher/assessment/config' },
                  { label: "Manage Assessments", link: '/teacher/assessment/manage' },
                  { label: "Pending Grading", link: '/teacher/assessment/pending-grading' },
                  { label: "Assign to Students", link: '/teacher/assessment/assign-student' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(item.link)
                      setDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#131313] hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="flex-1 p-3 bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6" >
            <div>
              <h1 className="text-base sm:text-xl font-bold text-[#1A1C5E] m-0 tracking-[-0.3px]">
                Question Journey
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-[#7B7FA8] font-normal">
                Choose how you want to add questions to your assessment.
              </p>
            </div>
            <button
              onClick={() => navigate('/teacher/assessment/questionlist')}
              className="w-full sm:w-auto capitalize bg-[#E8302C] text-white border-none rounded-lg px-4 py-[11px] font-semibold text-sm tracking-wide cursor-pointer shadow-[0_3px_10px_rgba(232,48,44,0.28)] transition-transform duration-150 hover:-translate-y-px"
            >
              View Existing Questions
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
            <button
              onClick={() => navigate('/teacher/assessment/view-questions')}
              className="text-left border border-[#C7CAF0] rounded-xl p-5 bg-[#2118920D] hover:border-chestnut/40 hover:shadow-sm transition-all"
            >
              <p className="text-sm font-semibold text-[#1A1C5E] mb-1">Browse Question Bank</p>
              <p className="text-[13px] text-[#6C70A6] leading-5">
                Explore questions by subject, topic, and subtopic with image previews.
              </p>
            </button>

            <button
              onClick={() => navigate('/teacher/assessment/upload-scan')}
              className="text-left border border-[#C7CAF0] rounded-xl p-5 bg-[#2118920D] hover:border-chestnut/40 hover:shadow-sm transition-all"
            >
              <p className="text-sm font-semibold text-[#1A1C5E] mb-1">Extract Question</p>
              <p className="text-[13px] text-[#6C70A6] leading-5">
                Upload media and extract questions automatically from scanned files.
              </p>
            </button>

            <button
              onClick={() => navigate('/teacher/assessment/createQuiz')}
              className="text-left border border-[#C7CAF0] rounded-xl p-5 bg-[#2118920D] hover:border-chestnut/40 hover:shadow-sm transition-all"
            >
              <p className="text-sm font-semibold text-[#1A1C5E] mb-1">Set Question</p>
              <p className="text-[13px] text-[#6C70A6] leading-5">
                Manually type and format questions using the current question form.
              </p>
            </button>

            <button
              onClick={() => navigate('/teacher/assessment/generate-quiz')}
              className="text-left border border-[#C7CAF0] rounded-xl p-5 bg-[#2118920D] hover:border-chestnut/40 hover:shadow-sm transition-all"
            >
              <p className="text-sm font-semibold text-[#1A1C5E] mb-1">Generate Quiz</p>
              <p className="text-[13px] text-[#6C70A6] leading-5">
                Select questions from your bank and generate a shareable quiz code.
              </p>
            </button>

            <button
              onClick={() => navigate('/teacher/assessments/My-Uploads')}
              className="text-left border border-[#C7CAF0] rounded-xl p-5 bg-[#2118920D] hover:border-chestnut/40 hover:shadow-sm transition-all"
            >
              <p className="text-sm font-semibold text-[#1A1C5E] mb-1">My Uploads</p>
              <p className="text-[13px] text-[#6C70A6] leading-5">
                Track processed extractions and manage uploaded question files.
              </p>
            </button>

            <button
              onClick={() => navigate('/teacher/assessment/config')}
              className="text-left border border-[#C7CAF0] rounded-xl p-5 bg-[#2118920D] hover:border-chestnut/40 hover:shadow-sm transition-all"
            >
              <p className="text-sm font-semibold text-[#1A1C5E] mb-1">Assessment Settings</p>
              <p className="text-[13px] text-[#6C70A6] leading-5">
                Configure pass marks, time limits, retakes, and default quiz behaviour.
              </p>
            </button>

            <button
              onClick={() => navigate('/teacher/assessment/pending-grading')}
              className="text-left border border-[#C7CAF0] rounded-xl p-5 bg-[#2118920D] hover:border-chestnut/40 hover:shadow-sm transition-all"
            >
              <p className="text-sm font-semibold text-[#1A1C5E] mb-1">Pending Grading</p>
              <p className="text-[13px] text-[#6C70A6] leading-5">
                Grade theory and board-based answers submitted by students.
              </p>
            </button>
          </div>

          <section className="mt-4 sm:mt-6">
            {/* Left Sidebar */}
            <section>
              <AssessmentSelectSubject />
            </section>
          </section>

        </div>
      </div>
    </div>
  )
}

export default Assessment