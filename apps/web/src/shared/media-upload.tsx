import { useRef, useState } from "react";
import { cn } from "@/lib/utils"; 
import { UploadIcon } from "lucide-react"; 

interface MediaUploadProps {
  onFilesSelected?: (files: FileList) => void;
  className?: string;
}

export const MediaUpload = ({
  onFilesSelected,
  className
}: MediaUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onFilesSelected) {
      onFilesSelected(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && onFilesSelected) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className={cn(
        "border rounded-md p-6 text-center transition-colors",
        isDragActive ? "border-chestnut bg-blue-50" : "border-gray-300 bg-white",
        className
      )}
      onClick={handleClick}
      onDragOver={e => {e.preventDefault(); setIsDragActive(true);}}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={false}
        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*,video/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <UploadIcon size={36} className="mx-auto mb-2 text-gray-500" />
      <span className="font-medium text-chestnut cursor-pointer">Click to upload</span>
      <span className="mx-2 text-gray-500">or drag and drop</span>
      <div className="text-xs text-gray-400 mt-2">
        PDF, PowerPoint, Word, images, or video files
      </div>
    </div>
  );
};
