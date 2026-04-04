import { Button } from "@bluethub/ui-kit"

const activityList = [
  {
    avatar: "A",
    name: "Abigeal",
    action: "submitted Algebra Homework 3",
    time: "2 minutes ago",
    subject: "Algebra I"
  }
  // Add more objects if there are more activities!
]

const RecentActivity = () => {
  return (
    <div className="bg-white border border-[#3A3A3A4D] rounded-[10px] p-4 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between pb-2  mb-4">
        <h1 className="font-medium text-base text-chestnut leading-[100%]">Recent Activity</h1>
        <Button className="bg-chestnut hover:bg-[#221E6D] text-white text-xs font-medium px-4 py-2 rounded-xl transition">
          Mark all read
        </Button>
      </div>
      {/* Activity list */}
      <div className="space-y-3">
        {activityList.map((item, idx) => (
          <div
            key={idx}
            className="border border-[#29238226] rounded-2xl flex items-center justify-between px-4 py-3 bg-[#F9F9FF] hover:bg-[#F1F3FB] transition"
          >
            <div className="flex items-center gap-3">
              <span className="bg-chestnut text-white  font-semibold rounded-full w-10 h-10 flex items-center justify-center">
                {item.avatar}
              </span>
              <div className="">
                <p className="font-medium text-[15px] text-chestnut ">{item.name} <span className="font-normal text-[#292382CC]">{item.action}</span></p>
                <span className="font-medium text-xs text-[#29238280] leading-0">{item.time} • {item.subject}</span>
              </div>
            </div>
            <Button 
              variant="outline"
              className="border-chestnut bg-white text-chestnut hover:bg-chestnut hover:text-white text-xs font-medium py-1 px-4 rounded-xl transition"
            >
              Open
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentActivity
