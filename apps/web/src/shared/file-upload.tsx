import { Label, Input } from "@bluethub/ui-kit";
import { Camera, Upload } from "lucide-react";

// File Upload Component
interface FileUploadProps {
  fileName: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  dragActive: boolean;
}

const FileUpload = ({ fileName, onFileChange, onDrag, onDrop, dragActive }: FileUploadProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
        <Camera className="w-4 h-4" />
        Profile Picture*
      </Label>

      <label
        htmlFor="fileInput"
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        className={`group relative flex items-center justify-center flex-col gap-4 
          border-2 border-dashed w-60 h-50 rounded-2xl cursor-pointer 
          transition-all duration-300 overflow-hidden
          ${
            dragActive
              ? "border-chestnut bg-chestnut/10 scale-105"
              : fileName
              ? "border-green-500 bg-green-50"
              : "border-chestnut/40 hover:border-chestnut bg-chestnut/5 hover:bg-chestnut/10"
          }`}
      >
        <Input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={onFileChange}
          accept="image/*"
        />

        <div className="absolute inset-0 bg-linear-to-br from-chestnut/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div
          className={`p-4 rounded-full transition-all duration-300 ${
            fileName ? "bg-green-500" : "bg-chestnut/10 group-hover:bg-chestnut/20"
          }`}
        >
          {fileName ? (
            <Camera className="w-8 h-8 text-white" />
          ) : (
            <Upload className="w-8 h-8 text-chestnut" />
          )}
        </div>

        <div className="text-center px-4 space-y-1">
          <p
            className={`font-semibold text-sm transition-colors ${
              fileName ? "text-green-700" : "text-chestnut group-hover:text-chestnut/80"
            }`}
          >
            {fileName ? "Image Selected" : "Upload Image"}
          </p>
          <p className="text-xs text-chestnut/60 font-medium">
            {fileName || "Click or drag to select file"}
          </p>
          {fileName && (
            <p className="text-xs text-green-600 font-medium truncate max-w-50">
              {fileName}
            </p>
          )}
        </div>
      </label>
    </div>
  );
};


export default FileUpload;