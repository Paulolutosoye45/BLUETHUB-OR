import { Badge } from "@bluethub/ui-kit";

const AssignmentList = () => {
  const assignments = [
    {
      name: "Basic Science Assignment",
      duedate: "Tomorrow",
      type: "Urgent",
    },
    {
      name: "English",
      duedate: "In 3 days",
      type: "Pending",
    },
    {
      name: "Mathematics",
      duedate: "Next Week",
      type: "Completed",
    },
  ];

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "Urgent":
        return "bg-red-500 text-white";
      case "Pending":
        return "bg-yellow-400 text-black";
      case "Completed":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <div className="space-y-2">
      {assignments.map((assignment, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-2 rounded-[16px] border border-slate-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(249,250,255,0.96))] px-3 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-24px_rgba(234,179,8,0.5)] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`size-2 rounded-full ${
                assignment.type === "Urgent"
                  ? "bg-red-500"
                  : assignment.type === "Pending"
                  ? "bg-yellow-400"
                  : "bg-green-500"
              }`}
            ></div>
            <div>
              <h3 className="font-poppins text-xs font-semibold text-slate-900">
                {assignment.name}
              </h3>
              <p className="font-poppins text-[10px] font-medium text-slate-500">
                Due: {assignment.duedate}
              </p>
            </div>
          </div>

          <Badge className={`${getBadgeStyle(assignment.type)} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>
            {assignment.type}
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default AssignmentList;
