import { Input } from "@bluethub/ui-kit"
import { Link } from "react-router-dom";

const Course = () => {

  const subjects = [
    {
      id: 1,
      title: "Mathematics",
      teacher: "Mr. Emeka Nwosu",
      topics: "8 topics - 24 lessons",
      iconBg: "#EEF0FF",
      badgeBg: "#EEF0FF",
      badgeText: "#4F61E8",
      icon: "📐",
    },
    {
      id: 2,
      title: "Basic - Science",
      teacher: "Mr. Emeka Nwosu",
      topics: "6 topics - 18 lessons",
      iconBg: "#E8FAF0",
      badgeBg: "#E8FAF0",
      badgeText: "#22A56F",
      icon: "🔬",
    },
    {
      id: 3,
      title: "English Language",
      teacher: "Mrs Aisha Abu",
      topics: "8 topics - 24 lessons",
      iconBg: "#FDEBED",
      badgeBg: "#FDEBED",
      badgeText: "#E85D75",
      icon: "📖",
    },
    {
      id: 4,
      title: "Geography",
      teacher: "Mrs Taiwo Bola",
      topics: "8 topics - 24 lessons",
      iconBg: "#FFF6E5",
      badgeBg: "#FFF6E5",
      badgeText: "#D99800",
      icon: "🌍",
    },
    {
      id: 5,
      title: "Economics",
      teacher: "Mrs Ngozi Eze",
      topics: "8 topics - 24 lessons",
      iconBg: "#E8FAF0",
      badgeBg: "#E8FAF0",
      badgeText: "#22A56F",
      icon: "📖",
    },
    {
      id: 6,
      title: "Business studies",
      teacher: "Mrs Taiwo Bola",
      topics: "8 topics - 24 lessons",
      iconBg: "#FFF6E5",
      badgeBg: "#FFF6E5",
      badgeText: "#D99800",
      icon: "🌍",
    },
    {
      id: 7,
      title: "French",
      teacher: "Mrs Pascal",
      topics: "2 topics - 5 lessons",
      iconBg: "#E8FAF0",
      badgeBg: "#E8FAF0",
      badgeText: "#22A56F",
      icon: "📖",
    },
    {
      id: 8,
      title: "Yoruba",
      teacher: "Mrs Taiwo Bola",
      topics: "8 topics - 24 lessons",
      iconBg: "#FFF6E5",
      badgeBg: "#FFF6E5",
      badgeText: "#D99800",
      icon: "🌍",
    },
  ];


  return (
    <div className="pt-[13px] font-Poppins">
      <div className="space-y-[3px]">
        <h2 className="text-[#3A3A3A] font-medium text-xs leading-5">
          Choose a Subject
        </h2>
        <h4 className="text-[#6B6B85] font-medium text-xs leading-5">
          Select a subject to browse recorded lessons, PDFs and assessments
        </h4>
      </div>

      <div className="mt-3.75 mb-5">
        <Input
          className="rounded-[10px] border border-[#6B6B8580] bg-white leading-5 text-[#6B6B85] text-sm"
          placeholder="Search subjects or topics....."
        />
      </div>

      <div>
        <div className="mb-[7px]">
          <h2 className="text-[#6B6B85] font-semibold text-xs leading-[0.8px] capitalize inline">
            All Subjects
          </h2>{" "}
          <h4 className="bg-[#4F61E81A] inline rounded-[15px] px-[10px] py-[4px] text-[#4F61E8] font-medium uppercase text-[10px]">
            10 new
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-[12px] mb-5">
          {subjects.map((subject) => (
            <Link
              to={`${subject.id}`}
              key={subject.id}
              className="block"
            >
              <div className="bg-[#FFFFFF] border border-[#E4E4EC] p-[14px] rounded-[16px] hover:shadow-sm transition">
                <div
                  className="rounded-[9px] h-[34px] w-[34px] flex items-center justify-center text-[16px]"
                  style={{ backgroundColor: subject.iconBg }}
                >
                  {subject.icon}
                </div>

                <h3 className="text-[#3A3A3A] font-medium text-[13px] leading-[20px] mt-[20px] capitalize">
                  {subject.title}
                </h3>

                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-[#6B6B85] text-[11px] flex-1 min-w-0 truncate">
                    {subject.teacher}
                  </h2>

                  <h4
                    className="rounded-[15px] px-[10px] py-[4px] text-[10px] font-medium whitespace-nowrap shrink-0"
                    style={{
                      backgroundColor: subject.badgeBg,
                      color: subject.badgeText,
                    }}
                  >
                    {subject.topics}
                  </h4>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Course