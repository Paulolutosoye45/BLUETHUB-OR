
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
    <div className="sm:p-4 lg:p-6 font-poppins">
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
                  { label: "Generate Quiz", link: '/teacher/assessment/generate-quiz' },
                  { label: "Extract Question", link: '/teacher/assessment/upload-scan' },
                  { label: "Type Question", link: '/teacher/assessment/createQuiz' },
                  { label: "Pending Job Status", link: '/teacher/assessments/My-Uploads' },
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

        <div className="flex-1 p-3 sm:p-6 lg:p-8 bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6" >
            <div>
              <h1 className="text-[22px] sm:text-[26px] font-bold text-[#1A1C5E] m-0 tracking-[-0.3px]">
                Question Journey
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-[#7B7FA8] mt-1.5 font-normal">
                Choose how you want to add questions to your assessment.
              </p>
            </div>
            <button
              onClick={() => navigate('/teacher/assessment/questionlist')}
              className="w-full sm:w-auto"
              style={{
              background: "#E8302C",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px 22px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(232,48,44,0.28)",
              letterSpacing: 0.2,
              transition: "transform 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              View Existing Questions
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
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
              <p className="text-sm font-semibold text-[#1A1C5E] mb-1">Type Question</p>
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