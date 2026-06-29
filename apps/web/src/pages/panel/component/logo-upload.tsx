import { Upload } from "lucide-react";
import { useRef, useState } from "react";

// ── Logo Upload ───────────────────────────────────────────────────────────────
export default function LogoUpload({ onChange }: {
  value: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    onChange(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#4F61E8] hover:bg-indigo-50/30 transition-all"
    >
      {preview ? (
        <img src={preview} alt="Logo preview" className="h-16 object-contain mb-2" />
      ) : (
        <>
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
            <Upload size={18} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-[#4F61E8]">Click to upload logo</p>
          <p className="text-xs text-gray-400 mt-1">PNG, SVG, JPEG or WEBP · 2MB</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
    </div>
  );
}