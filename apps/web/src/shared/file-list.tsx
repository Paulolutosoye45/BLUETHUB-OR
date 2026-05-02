import { cn } from "@/lib/utils";
import { MoreVertical, Database } from "lucide-react";
import { useState } from "react";



type FileType = "audio" | "video" | "pdf" | "image" | "doc";

export type FileItem = {
  id: string;
  name: string;
  size: string;   // "2.4MB"
  type: FileType;
  date?: string;
};

const getFileIcon = (type: FileType) => {
  const base = "w-6 h-6";
  switch (type) {
    case "pdf":
      return (
        <svg className={cn(base, "text-red-500")} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
        </svg>
      );
    case "video":
      return (
        <svg className={cn(base, "text-red-400")} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
      );
    case "audio":
      return (
        <svg className={cn(base, "text-red-400")} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
        </svg>
      );
    default:
      return (
        <svg className={cn(base, "text-gray-400")} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
        </svg>
      );
  }
};

type FileListProps = {
  files: FileItem[];
  onDelete?: (id: string) => void;
  className?: string;
};

export const FileList = ({ files, onDelete, className }: FileListProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className={cn("space-y-3", className)}>
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between bg-white rounded-lg border border-[#E5E7EB] px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {/* Icon */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center bg-red-50 rounded-md p-2">
              {getFileIcon(file.type)}
            </div>

            {/* File Info */}
            <div className="min-w-0">
              <p className="truncate text-[#0F0F0E] font-semibold text-sm">
                {file.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Database className="w-3.5 h-3.5 text-[#3A3A3A80]" />
                <span className="text-xs text-[#3A3A3A80]">{file.size}</span>
              </div>
            </div>
          </div>

          {/* Three-dot menu */}
          <div className="relative">
            <button
              onClick={() => setOpenMenuId(openMenuId === file.id ? null : file.id)}
              className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="text-gray-400 w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            </button>

            {openMenuId === file.id && (
              <div className="absolute right-0 top-10 z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-36 py-1">
                <button
                  onClick={() => { onDelete?.(file.id); setOpenMenuId(null); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  onClick={() => setOpenMenuId(null)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
