import { useNavigate } from "react-router-dom";
import { CalendarRange, CirclePlay, Funnel, PlayIcon } from "lucide-react";
import { Button } from "@bluethub/ui-kit";

interface Recording {
  id: string | number;
  subject: string;
  date: string;
  status: string;
}

interface RecordedListProps {
  recordings: Recording[];
}

const ClassInfoList = ({ recordings }: RecordedListProps) => {
  const navigate = useNavigate();

  const handleNavigate = (id: string | number) => {
    navigate(`/class/${id}`);
  };

  return (
    <div className="p-6">
      {recordings.map((recording) => (
        <div
          key={recording.id}
          className="p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4  rounded-xl bg-white transition"
        >
          {/* Left: Recording Started */}
          <div className="flex-1 border border-[#E5E5F5] rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <CirclePlay className="text-chestnut w-5 h-5" />
              <p className="font-medium text-sm text-chestnut">
                {recording.status}
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-chestnut" />
                <span className="font-medium text-xs text-chestnut">
                  {recording.date}
                </span>
              </div>

              <Button
                variant="outline"
                className="border border-chestnut text-chestnut hover:bg-chestnut hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm"
              >
                <PlayIcon className="w-4 h-4" />
                Resume
              </Button>
            </div>
          </div>

          {/* Middle: View Details */}
          <div
            onClick={() => handleNavigate(recording.id)}
            className="flex items-center gap-2 text-chestnut cursor-pointer hover:opacity-80 transition"
          >
            <Funnel className="w-5 h-5 fill-chestnut" />
            <p className="font-semibold text-sm">View Details</p>
          </div>

          {/* Right: Subject */}
          <div className="text-chestnut font-semibold text-sm">
            {recording.subject}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassInfoList;
