import TitleBar from "@/shared/title-bar";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";



const BRAND = "#292382";

type QuestionType = "text-and-image" | "text-only" | "image-only";

interface FileItem {
    id: number;
    name: string;
    status: "scanning" | "uploaded" | "pending";
}

const fileList: FileItem[] = [
    { id: 1, name: "Biology Cell Structure_Test_.pdf", status: "scanning" },
    { id: 2, name: "Biology Cell Structure_Test2_.pdf", status: "uploaded" },
    { id: 3, name: "History_Test2_.pdf", status: "uploaded" },
    { id: 4, name: "Biology Cell Structure_Test2_.pdf", status: "pending" },
];
const UploadScan = () => {
    const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [files, _setFiles] = useState<FileItem[]>(fileList);
    const fileRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate()

    const handleCheckbox = (type: QuestionType) => {
        setSelectedType(prev => (prev === type ? null : type));
    };

    const handleDropdownItem = (action: string) => {
        setDropdownOpen(false);
        if (action === "Upload document /PDF" || action === "Upload Image Gallery" || action === "Select from Files") {
            fileRef.current?.click();
        }
    };

    const statusLabel = (status: FileItem["status"]) => {
        if (status === "scanning") return "Scanning.";
        if (status === "uploaded") return "Uploaded.";
        return "";
    };

    return (
        <div className="p-6 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">
                <TitleBar title="Upload and scan" hasVertical hasBackIcons />

                <div className="px-6 pt-6 pb-10  bg-white/70 backdrop-blur-sm">

                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        scan and Convert Question
                    </h1>

                    {/* Info hint */}
                    <div className="flex items-center gap-1.5 mb-4">
                        <svg
                            className="w-4 h-4 shrink-0"
                            style={{ color: BRAND }}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="text-sm text-gray-600">
                            please kindly click on the Checkbox&nbsp; to continue
                        </span>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-200 mb-5" />

                    {/* Question Type */}
                    <div className="flex items-center gap-5 flex-wrap mb-5">
                        <span className="text-sm text-gray-700 font-medium">Question Type :</span>

                        {(
                            [
                                { id: "text-and-image", label: "text and Image" },
                                { id: "text-only", label: "text Only" },
                                { id: "image-only", label: "Image Only" },
                            ] as { id: QuestionType; label: string }[]
                        ).map(opt => (
                            <label key={opt.id} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedType === opt.id}
                                    onChange={() => handleCheckbox(opt.id)}
                                    className="w-4 h-4 cursor-pointer"
                                    style={{ accentColor: BRAND }}
                                />
                                <span className="text-sm text-gray-700">{opt.label}</span>
                            </label>
                        ))}
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-200 mb-5" />

                    {/* ── Two-column layout ───────────────────────────────────── */}
                    <div className="flex gap-5 items-start flex-col md:flex-row">

                        {/* ── LEFT COLUMN ──────────────────────────────────────── */}
                        <div className="shrink-0 w-full md:w-97.5">

                            {/* Scan/Upload button */}
                            <button
                                onClick={() => setDropdownOpen(prev => !prev)}
                                className="w-full flex items-center justify-center gap-2 text-white text-base font-semibold rounded-lg py-4 transition-opacity hover:opacity-90"
                                style={{ backgroundColor: BRAND }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Scan/ Upload For Conversion
                            </button>

                            {/* Dropdown menu */}
                            {dropdownOpen && (
                                <div className="mt-0 border border-gray-200 rounded-b-lg shadow-sm overflow-hidden">
                                    {[
                                        "Take Photo",
                                        "Upload document /PDF",
                                        "Upload Image Gallery",
                                        "Select from Files",
                                    ].map((item, i) => (
                                        <button
                                            key={item}
                                            onClick={() => handleDropdownItem(item)}
                                            className="w-full text-left px-4 py-3 text-sm transition-colors border-b border-gray-100 last:border-0"
                                            style={{
                                                backgroundColor: i === 0 ? BRAND : "#fff",
                                                color: i === 0 ? "#fff" : "#374151",
                                            }}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <input
                                ref={fileRef}
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx"
                                multiple
                            />
                        </div>

                        {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
                        <div
                            className="flex-1 w-full border border-gray-200 rounded-lg overflow-hidden"
                            style={{ minWidth: 0 }}
                        >
                            {/* Right panel header */}
                            <div className="px-4 pt-4 pb-3">
                                <p className="text-sm font-semibold text-gray-800 mb-3">
                                    Uploading Document from Media
                                </p>

                                {/* File preview + spinner row */}
                                <div className="flex items-start gap-4">

                                    {/* File preview card */}
                                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                        <div
                                            className="w-28 rounded-lg overflow-hidden border border-gray-200"
                                            style={{ minHeight: 110 }}
                                        >
                                            {/* Card header */}
                                            <div
                                                className="px-2 py-1.5"
                                                style={{ backgroundColor: BRAND }}
                                            >
                                                <p className="text-white text-[10px] font-semibold leading-tight">
                                                    Question pdf
                                                </p>
                                                <p className="text-white/70 text-[9px]">Biology</p>
                                            </div>
                                            {/* Card body — lines mimicking text */}
                                            <div className="bg-white px-2 py-2 flex flex-col gap-1">
                                                {[70, 90, 80, 60, 75, 85].map((w, i) => (
                                                    <div
                                                        key={i}
                                                        className="h-1.5 rounded-full bg-gray-200"
                                                        style={{ width: `${w}%` }}
                                                    />
                                                ))}
                                                {/* PDF icon */}
                                                <div className="mt-2 flex justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 text-center font-medium">
                                            Biology _Test.Pdf
                                        </p>
                                    </div>

                                    {/* Spinner + Please Wait */}
                                    <div className="flex flex-col items-center justify-center flex-1 pt-4 gap-3">
                                        {/* Spinner ring */}
                                        <div
                                            className="w-16 h-16 rounded-full border-4 border-gray-200"
                                            style={{
                                                borderTopColor: BRAND,
                                                borderRightColor: BRAND,
                                                animation: "spin 1.2s linear infinite",
                                            }}
                                        />
                                        <p
                                            className="text-base font-bold"
                                            style={{ color: BRAND }}
                                        >
                                            Please Wait!............
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* File list */}
                            <div className="mx-4 mb-3 border border-gray-200 rounded-lg overflow-hidden">
                                {files.map((file) => {
                                    const isActive = file.status === "scanning";
                                    return (
                                        <div
                                            key={file.id}
                                            className="flex items-center px-3 py-2.5 text-xs border-b border-gray-100 last:border-0"
                                            style={{
                                                backgroundColor: isActive ? `${BRAND}22` : "#fff",
                                            }}
                                        >
                                            <span
                                                className="truncate"
                                                style={{ color: isActive ? BRAND : "#374151" }}
                                            >
                                                File {file.id} ({file.name}{" "}
                                                {statusLabel(file.status)})
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 px-4 pb-4">
                                <button
                                    className="flex-1 py-2.5 rounded-lg border text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    style={{ borderColor: "#d1d5db" }}
                                >
                                    Review
                                </button>
                                <button
                                   onClick={() => navigate('/teacher/assessment/review')}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: BRAND }}
                                >
                                    Convert to questions
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Spin keyframe */}
                <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
            </div>

        </div>
    );
};

export default UploadScan;