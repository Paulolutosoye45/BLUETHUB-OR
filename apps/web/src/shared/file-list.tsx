import { Trash2, FileAudio, FileVideo, File } from "lucide-react";
import { cn } from "@/lib/utils";

type FileType = "audio" | "video" | "other";

export interface FileItem {
  id: string;
  type: FileType;
  name: string;
  date: string;
}

interface FileListProps {
  files: FileItem[];
  onDelete?: (id: string) => void;
  className?: string;
}

const getFileIcon = (type: FileType) => {
  switch (type) {
    case "audio":
      return <FileAudio className="text-blue-500 w-5 h-5" />;
    case "video":
      return <FileVideo className="text-violet-500 w-5 h-5" />;
    default:
      return <File className="text-gray-400 w-5 h-5" />;
  }
};

export const FileList = ({
  files,
  onDelete,
  className,
}: FileListProps) => (
  <div className={cn("space-y-3", className)}>
    {files.map((file) => (
      <div
        key={file.id}
        className="flex items-center justify-between bg-white rounded-lg border border-[#E5E7EB] px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200"
      >
        {/* File Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center bg-[#F3F4F6] rounded-md p-2">
            {getFileIcon(file.type)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-chestnut font-semibold text-[15px]">
              {file.name}
            </p>
            <p className="text-sm text-[#29238299]">{file.date}</p>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => onDelete?.(file.id)}
          aria-label="Delete"
          className="p-2 rounded-md hover:bg-red-50 transition-colors duration-150"
        >
          <Trash2 className="text-red-500 w-5 h-5" />
        </button>
      </div>
    ))}
  </div>
);
