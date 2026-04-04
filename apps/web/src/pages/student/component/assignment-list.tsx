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
    <div className="space-y-4">
      {assignments.map((assignment, idx) => (
        <div
          key={idx}
          className="border border-black/10 flex items-center justify-between px-8 h-18.5 rounded-[10px]"
        >
          <div className="flex items-center gap-3">
            <div
              className={`size-2.5 rounded-full ${
                assignment.type === "Urgent"
                  ? "bg-red-500"
                  : assignment.type === "Pending"
                  ? "bg-yellow-400"
                  : "bg-green-500"
              }`}
            ></div>
            <div className="space-y-1">
              <h3 className="font-poppins font-medium text-sm text-blck-b2">
                {assignment.name}
              </h3>
              <p className="font-poppins font-medium text-xs text-blck-b2">
                Due: {assignment.duedate}
              </p>
            </div>
          </div>

          <Badge className={getBadgeStyle(assignment.type)}>
            {assignment.type}
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default AssignmentList;
