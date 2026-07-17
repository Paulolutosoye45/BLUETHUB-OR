import { AlertCircle, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

const MAX_SIZE_BYTES = 200 * 1024; // 200KB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function LogoUpload({ value: _value, onChange }: {
  value: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = (file: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Invalid file type. Please upload a PNG, JPEG, WEBP, or SVG image.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(
        `File is too large (${formatFileSize(file.size)}). Maximum allowed size is 200KB.`
      );
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileInput = (fileList: FileList | null) => {
    if (fileList?.[0]) validateAndSet(fileList[0]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div
        onClick={() => !preview && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) validateAndSet(file);
        }}
        className={`relative border-2 border-dashed rounded-2xl cursor-pointer group transition-all duration-200
          ${error
            ? "border-red-300 bg-red-50/30 hover:border-red-400"
            : preview
              ? "border-gray-200 hover:border-[#4F61E8]"
              : "border-gray-200 hover:border-[#4F61E8] hover:bg-indigo-50/20"
          }`}
      >
        {preview ? (
          <div className="relative w-full h-40 rounded-2xl overflow-hidden">
            <img src={preview} alt="Logo preview" className="w-full h-full object-contain p-4" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              aria-label="Remove logo"
            >
              <X size={14} />
            </button>
            <div
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl cursor-pointer"
            >
              <div className="flex items-center gap-2 text-white text-xs font-semibold">
                <Upload size={14} />
                <span>Change logo</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-40 flex flex-col items-center justify-center gap-2 px-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <Upload size={20} className="text-[#4F61E8]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#4F61E8]">Click to upload logo</p>
              <p className="text-xs text-gray-400 mt-0.5">or drag and drop</p>
            </div>
            <p className="text-[10px] text-gray-300 font-medium uppercase tracking-wide">
              PNG · SVG · JPEG · WEBP &nbsp;·&nbsp; max 200KB
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => handleFileInput(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-0.5">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
