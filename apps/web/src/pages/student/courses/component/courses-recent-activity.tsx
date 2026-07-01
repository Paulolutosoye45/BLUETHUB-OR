

const activities = [
  {
    id: 1,
    title: "Completed Living Things — Cell Structure",
    time: "Today",
    color: "bg-emerald-500",
  },
  {
    id: 2,
    title: "Scored 85% on Topic 1 Quiz",
    time: "Yesterday",
    color: "bg-blue-500",
  },
  {
    id: 3,
    title: "Downloaded Matter & Materials PDF",
    time: "Mon",
    color: "bg-orange-500",
  },
  {
    id: 4,
    title: "Completed Living Things — Photosynthesis",
    time: "Mon",
    color: "bg-emerald-500",
  },
];

const  CoursesRecentActivity = () => {
  return (
    <div className="bg-white border border-[#0000000D] rounded-[14px] px-3.5 pt-3.5 pb-2">
      
      {/* Header */}
      <div className="border-b border-[#E2E8F0] py-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">
          Recent activity
        </h2>

        <button className="text-xs text-blue-600 font-medium hover:underline">
          See all
        </button>
      </div>

      {/* List */}
      <div className="mt-3 space-y-3">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start justify-between border-b border-[#E2E8F0] pb-2">
            
            {/* Left side */}
            <div className="flex items-start gap-2">
              <span
                className={`w-2.5 h-2.5 mt-1 rounded-full ${item.color}`}
              />
              <p className="text-sm text-gray-700 leading-snug">
                {item.title}
              </p>
            </div>

            {/* Right side */}
            <span className="text-xs text-gray-400 whitespace-nowrap ml-3">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoursesRecentActivity