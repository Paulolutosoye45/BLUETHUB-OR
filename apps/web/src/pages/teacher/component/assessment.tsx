import TitleBar from "@/shared/title-bar"
// import { Button } from "@bluethub/ui-kit"
import AssessmentSelectSubject from "./assessment-select-subject"
import { Link } from "react-router-dom"

const Assessment = () => {
  return (
    <div className="p-6 font-poppins">
      <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">
        <TitleBar title="question" hasVertical />
        <div className="flex-1 p-8 bg-white/70 backdrop-blur-sm">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
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