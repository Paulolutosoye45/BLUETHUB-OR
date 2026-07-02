import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Calendar } from "lucide-react";
import { teacherService, type TodayClassItem } from "@/services/teacher";

const TodayClasses = () => {
  const [classes, setClasses] = useState<TodayClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await teacherService.getTodayClasses();
        if (res.data.status === "successful") {
          setClasses(res.data.data.classes);
        }
      } catch (err) {
        console.error("Failed to fetch today's classes:", err);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const getStatusConfig = (status: TodayClassItem["status"]) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-gray-100",
          text: "text-gray-400",
          dot: "bg-gray-300",
          label: "Completed",
          timeLabel: "Done",
          timeColor: "text-[#A8A8A4]",
        };
      case "ongoing":
        return {
          bg: "bg-green-50",
          text: "text-green-600",
          dot: "bg-green-500",
          label: "In progress",
          timeLabel: "Now",
          timeColor: "text-green-500",
        };
      case "scheduled":
      default:
        return {
          bg: "bg-[#EEF1FB]",
          text: "text-[#292382]",
          dot: "bg-[#292382]",
          label: "Upcoming",
          timeLabel: "Soon",
          timeColor: "text-[#292382]",
        };
    }
  };

  if (loading) {
    return (
      <div className="border border-[#E8E8E3] rounded-xl bg-white overflow-hidden">
        <div className="border-b border-[#E8E8E3] flex justify-between items-center py-3 px-4">
          <div>
            <h2 className="text-[#0F0F0E] font-semibold text-xs">Today's classes</h2>
            <p className="text-[#A8A8A4] font-normal text-[10px] mt-0.5">
              {format(new Date(), "EEEE, dd MMMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-chestnut" />
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#E8E8E3] rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#E8E8E3] flex justify-between items-center py-3 px-4">
        <div>
          <h2 className="text-[#0F0F0E] font-semibold text-xs">Today's classes</h2>
          <p className="text-[#A8A8A4] font-normal text-[10px] mt-0.5">
            {format(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
        </div>
        <span className="bg-[#EEF1FB] rounded-full py-0.5 px-2.5 text-[#1A2558] font-semibold text-[10px]">
          {classes.length} classes
        </span>
      </div>

      {/* Empty state */}
      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500">No classes scheduled for today</p>
        </div>
      ) : (
        /* Class rows */
        classes.map((cls, i) => {
          const config = getStatusConfig(cls.status);
          const time = new Date(cls.scheduledTime);
          const timeStr = format(time, "HH:mm");

          return (
            <div
              key={cls.id}
              className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50/60 ${
                i < classes.length - 1 ? "border-b border-[#E8E8E3]" : ""
              }`}
            >
              {/* Left — time + divider + subject */}
              <div className="flex items-center gap-3">
                {/* Time block */}
                <div className="w-10 shrink-0 text-center">
                  <p className={`font-bold text-xs ${config.timeColor}`}>{timeStr}</p>
                  <p className="text-[#A8A8A4] font-normal text-[9px] mt-0">{config.timeLabel}</p>
                </div>

                {/* Vertical divider */}
                <div
                  className={`h-8 w-[1.5px] rounded-full shrink-0 ${
                    cls.status === "ongoing" ? "bg-green-400" : "bg-[#E8E8E3]"
                  }`}
                />

                {/* Dot + subject */}
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                  <div>
                    <h3 className="text-[#0F0F0E] font-semibold text-xs leading-tight">
                      {cls.subjectName}
                    </h3>
                    <p className="text-[#A8A8A4] font-normal text-[10px] mt-0">
                      {cls.className} · {cls.topic}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right — status */}
              <div className="text-right shrink-0">
                <span
                  className={`inline-block rounded-full py-0.5 px-2 text-[10px] font-semibold ${config.bg} ${config.text}`}
                >
                  {config.label}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TodayClasses;
