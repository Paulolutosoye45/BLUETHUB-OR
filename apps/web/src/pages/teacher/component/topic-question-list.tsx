import TitleBar from "@/shared/title-bar";
import { Button } from "@bluethub/ui-kit";
// import { Link } from "react-router-dom";

// ── Data ───────────────────────────────────────────────────────────────────
const TOPICS = [
  {
    name: "Cell : Form and Function",
    questions: 136,
    subtopics: [
      { name: "Cell: Living Unit – Structure", questions: 48 },
      { name: "Cell: Properties and Functions", questions: 38 },
      { name: "Cell: Properties and Functions II", questions: 50 },
    ],
  },
  {
    name: "Evolution",
    questions: 195,
    subtopics: [
      { name: "Variations", questions: 48 },
      { name: "Adaptations For Survival / Evolutions", questions: 95 },
      { name: "Evolution II", questions: 50 },
    ],
  },
  {
    name: "Nervous Coordination",
    questions: 243,
    subtopics: [
      { name: "The Nervous System", questions: 80 },
      { name: "Reflex Actions", questions: 63 },
      { name: "The Brain and Spinal Cord", questions: 100 },
    ],
  },
  {
    name: "Excretory System",
    questions: 178,
    subtopics: [
      { name: "The Kidney", questions: 72 },
      { name: "Excretion in Plants", questions: 46 },
      { name: "Homeostasis", questions: 60 },
    ],
  },
];


const TopicQuestionList = () => {
  return (
    <div className="p-6 font-poppins">
      <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">
        <TitleBar title="question" hasVertical />
        <div className="flex-1 p-8 bg-white/70 backdrop-blur-sm">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-chestnut font-bold " style={{ fontSize: 26, margin: 0, letterSpacing: -0.3 }}>
              Biology:  Cells
              </h1>
              <p className="text-sm text-chestnut font-normal" style={{   margin: "5px 0 0", fontWeight: 400 }}>
                Date: March 12th
              </p>
            </div>
            <Button className="bg-chestnut py-[11px] px-[22px]  text-white border-none hover:bg-chestnut rounded-[8px] font-semibold text-sm cursor-pointer shadow-[0 3px 10px rgba(232,48,44,0.28)]" style={{
              letterSpacing: 0.2,
              transition: "transform 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              Upload Question 
            </Button>
          </div>

      {/* List container */}
        <div className="">
        {TOPICS.map((topic) => (
          <div key={topic.name}>

            {/* ── Topic row ── */}
            <div className="flex items-center justify-between px-1 py-4 border-y border-[#29238280]">
              <span className="text-[14px] font-semibold text-chestnut">
                {topic.name}
              </span>
              <span className="text-[13px] font-semibold text-chestnut text-base leading-7.5">
                {topic.questions} Questions
              </span>
            </div>

            {/* ── Subtopic rows ── */}
            {topic.subtopics.map((sub) => (
              <div
                key={sub.name}
                className="flex items-center justify-between px-1 py-3.5"
              >
                <span className="text-base font-medium leading-7.5 text-chestnut pl-2">
                  {sub.name} 
                </span>
                <span className="text-base font-medium text-chestnut leading-7.5">
                  {sub.questions} Questions 
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
    </div>
    </div>
  );
}


export default TopicQuestionList