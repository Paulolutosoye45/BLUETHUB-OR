import { Eye } from "lucide-react";
import { Button } from "@bluethub/ui-kit";

interface TableRow {
  title?: string;
  views?: number;
  dueDate?: string;
  submissions?: string;
  score?: string;
}

interface TableCardProps {
  title: string;
  headers: string[];
  data: TableRow[];
  showEye?: boolean;
  showDetails?: boolean;
  showScore?: boolean;
}

export default function RecordedTable({
  title,
  headers,
  data,
  showEye,
  showDetails,
  showScore,
}: TableCardProps) {
  return (
    <div className="bg-white rounded-[10px] shadow-sm border border-[#E5E5F5] p-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xs font-semibold text-chestnut">{title}</h2>
        <Button
          variant="ghost"
          className="text-xs text-chestnut font-medium hover:bg-transparent bg-[#29238226]"
        >
          View All
        </Button>
      </div>

      {/* Table Header */}
      <div className="flex  justify-between items-center bg-[#E5E5F5]/40 py-2 px-3 rounded-t-md text-xs font-medium text-chestnut w-full">
        {headers.map((header, i) => (
          <p key={i}>{header}</p>
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-[#E5E5F5]">
        {data.map((item, i) => (
          <div key={i} className="grid grid-cols-3 items-center py-3 px-3">
            <p className="text-sm text-chestnut truncate">{item.title || item.dueDate}</p>


            <div className="flex justify-center items-center gap-1 text-chestnut text-sm">
              {showEye && <Eye size={16} />}
              <span>{item.views || item.submissions}</span>
            </div>

            <div className="flex justify-end">
              {showDetails && (
                <Button className="bg-chestnut hover:bg-[#221E6D] text-white text-xs font-medium px-3 py-1 rounded-2xl">
                  Details
                </Button>
              )}
              {showScore && (
                <div className="bg-chestnut text-white text-xs font-medium px-3 py-1 rounded-xl">
                  {item.score}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
