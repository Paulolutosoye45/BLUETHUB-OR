
// import { Button } from "@bluethub/ui-kit"
import AssessmentSelectSubject from "./assessment-select-subject"
import { Link, useNavigate } from "react-router-dom"
import { EllipsisVertical } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const Assessment = () => {
  const navigate = useNavigate()
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
    <div className="p-6 font-poppins">
      <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">
        {/* <TitleBar title="" hasVertical /> */}
        <div className={`bg-linear-to-r from-chestnut to-chestnut/90 px-6 py-5 rounded-t-lg flex items-center justify-between`}>

          {/* Left side — back arrow + title + chevron */}
          <div className="flex items-center gap-2.5">
            {/* <button
                        // onClick={onBack}
                        className="text-white hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button> */}
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
                  { label: "View Past Question", link: '/teacher/assessment/questionlist' },
                  { label: "Use Media", link: '/teacher/assessment/upload-scan' },
                  { label: "My Uploads", link: '/teacher/assessment/My-Uploads' },
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

        <div className="flex-1 p-8 bg-white/70 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6" >
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1A1C5E", margin: 0, letterSpacing: -0.3 }}>
                No question yet
              </h1>
              <p style={{ fontSize: 13.5, color: "#7B7FA8", margin: "5px 0 0", fontWeight: 400 }}>
                Upload Question to Teacher's portal
              </p>
            </div>
            <Link to='questionlist' style={{
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
              View Past Question
            </Link>
          </div>


          <div className="bg-[#2118921A]" style={{
            border: "1px solid #C7CAF0",
            borderRadius: 10,
            padding: "13px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
          }}>
            <svg width="18" height="18" fill="#2D2FA3" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" opacity="0.15" fill="#2D2FA3" />
              <circle cx="12" cy="12" r="10" stroke="#2D2FA3" strokeWidth="2" fill="none" />
              <path d="M12 8v4m0 4h.01" stroke="#2D2FA3" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 13.5, color: "#3B3D8C" }}>
              To Upload Question into Teacher's Portal{" "}
              <Link to='createQuiz' style={{ color: "#E8302C", fontWeight: 600, textDecoration: "none" }}>
                Click Here
              </Link>
            </span>
          </div>



          <section className="mt-6">
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