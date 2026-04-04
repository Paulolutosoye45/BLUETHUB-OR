import Play from "@/assets/svg/play.svg?react";
import PDF from "@/assets/png/Pdf.png";

interface MediaPreview {
  id: number;
  type: "Video" | "pdf";
  name: string;
  timeLength: string;
}

const availableMedia: MediaPreview[] = [
  {
    id: 1,
    type: "Video",
    name: "Introduction to Algebra",
    timeLength: "12:45",
  },
  {
    id: 2,
    type: "Video",
    name: "Solving Equations",
    timeLength: "15:32",
  },
  {
    id: 3,
    type: "Video",
    name: "Practice Problems",
    timeLength: "8:21",
  },
  {
    id: 4,
    type: "pdf",
    name: "Course Workbook",
    timeLength: "2.4 MB",
  },
];

const AttachedMedia = () => {
  return (
    <div className="rounded-xl border border-[#21189226] bg-white">
      {/* Header */}
      <div className="p-4 border-b border-[#29238233]">
        <h2 className="text-chestnut font-medium text-base">
          Attached Media Preview
        </h2>
      </div>

      {/* Media Grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {availableMedia.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-[#21189226] bg-[#FAFAFA] p-4 hover:shadow-md transition-all duration-200"
          >
            {/* Thumbnail */}
            <div className="relative rounded-[5px] bg-[#D9D9D9] py-10 flex items-center justify-center mb-3">
              {item.type === "Video" ? (
                <Play className="w-8 h-8 text-[#29238280]" />
              ) : (
                <img src={PDF} alt="PDF file" className="w-10 h-10" />
              )}
            </div>

            {/* Info */}
            <div>
              <h2 className="font-medium text-chestnut text-sm truncate">
                {item.name}
              </h2>
              <p className="mt-1 font-medium text-[12px] text-chestnut">
                {item.type} • <span>{item.timeLength}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachedMedia;
