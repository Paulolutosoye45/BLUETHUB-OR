import { useRef, useState } from 'react';
import {
    Upload, X, CheckCircle2, Info, Check,
    Loader2, ImageIcon,
    Menu,
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { localData } from '@/utils';
import { schoolService } from '@/services/school';
import { AxiosError } from 'axios';

type UploadState = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

interface PreviewFile {
    file: File;
    preview: string;
    size: string;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const GUIDELINES = [
    { text: <>Use a <strong>square image</strong>, ideally 512×512px or larger, so it isn't cropped oddly in circular avatars.</> },
    { text: <>A <strong>transparent background</strong> (PNG) looks best across light and dark surfaces.</> },
    { text: <>Keep the file under <strong>2MB</strong> for fast loading on the parent and teacher apps.</> },
];

export default function UploadSchoolLogoPage() {
    const navigate = useNavigate()
    const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();
    const fileRef = useRef<HTMLInputElement>(null);
    const [state, setState] = useState<UploadState>('idle');
    const [dragging, setDragging] = useState(false);
    const [selected, setSelected] = useState<PreviewFile | null>(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const school = localData.retrieve("schoolInfo") as { schoolName?: string } | null;

    const validate = (file: File): string | null => {
        const allowed = ['image/png', 'image/jpeg', 'image/svg+xml'];
        if (!allowed.includes(file.type)) return 'Only PNG, JPG or SVG files are allowed.';
        if (file.size > 2 * 1024 * 1024) return 'File must be under 2MB.';
        return null;
    };

    const handleFile = (file: File) => {
        const err = validate(file);
        if (err) { setError(err); setState('error'); return; }
        setError(null);
        setSelected({
            file,
            preview: URL.createObjectURL(file),
            size: formatBytes(file.size),
        });
        setState('selected');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

   const handleUpload = async () => {
    if (!selected) return;
    setState('uploading');
    setProgress(0);
    setError(null);

    try {
        // simulate progress while uploading
        const interval = setInterval(() => {
            setProgress(p => p >= 90 ? p : p + 10);
        }, 120);

        const res = await schoolService.schoolLogo(selected.file);
        
        clearInterval(interval);

        if (!res.data.status || res.data.status === 'failed') {
            setError(res.data.responseMessage || 'Upload failed');
            setState('error');
            return;
        }

        

        // use the URL from API response if available, else use local preview
        const logoUrl = (res.data.data as any)?.logoUrl ?? selected.preview;
        setUploadedUrl(logoUrl);
        setProgress(100);
        setState('success');

        // Update schoolInfo in localStorage with new logoUrl
        const currentSchool = localData.retrieve("school") as { logoUrl?: string; schoolName?: string } | null;
        localData.save("school", { ...currentSchool, logoUrl });
        const currentSchoolInfo = localData.retrieve("schoolInfo") as { logoUrl?: string; schoolName?: string } | null;
        localData.save("schoolInfo", { ...currentSchoolInfo, logoUrl });
        navigate('/admin')

    } catch (error) {
        const msg =
            error instanceof AxiosError
                ? error.response?.data?.responseMessage ??
                  error.response?.data?.message ??
                  error.message
                : (error as Error).message;

        setError(msg || 'Upload failed. Please try again.');
        setState('error');
    }
    // ← no finally block — state is managed in try/catch
};

    const handleReset = () => {
        if (selected) URL.revokeObjectURL(selected.preview);
        setSelected(null); setState('idle');
        setProgress(0); setError(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const logoForPreview = uploadedUrl ?? selected?.preview;

    return (
        <div className="min-h-screen bg-[#F5F5FB] p-4 font-poppins sm:p-8">
            <div className="max-w-5xl mx-auto">

                {/* ── Page header ── */}
                <div className="mb-8 flex gap-4">
                    <Menu
                        className="lg:hidden shrink-0 mb-2 text-chestnut cursor-pointer"
                        onClick={openMobileNav}
                    />
                    <div>

                    <h1 className="text-base font-semibold text-[#1a1a3e]">Upload school logo</h1>
                    <p className="text-[14.5px] text-gray-500 mt-1">
                        This logo appears across your school's dashboard, sidebar, report cards, and parent portal.
                    </p>
                    </div>
                </div>

                {/* ── Two-col layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

                    {/* ── LEFT — upload zone ── */}
                    <div className="space-y-4">

                        {/* Idle / drag zone */}
                        {(state === 'idle' || state === 'error') && (
                            <div
                                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileRef.current?.click()}
                                className={`
                  relative flex flex-col items-center justify-center gap-4
                  rounded-2xl border-2 border-dashed cursor-pointer
                  transition-all duration-200 py-16 px-6 text-center
                  ${dragging
                                        ? 'border-[#292382] bg-[#292382]/5 scale-[1.01]'
                                        : 'border-[#292382]/25 bg-white hover:border-[#292382]/50 hover:bg-[#292382]/[0.02]'
                                    }
                `}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${dragging ? 'bg-[#292382]/10' : 'bg-gray-100'}`}>
                                    <Upload className={`w-7 h-7 transition-colors ${dragging ? 'text-[#292382]' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <p className="text-[15px] font-semibold text-gray-800">
                                        Drag &amp; drop your logo here, or{' '}
                                        <span className="text-[#E924A1] hover:underline">browse files</span>
                                    </p>
                                    <p className="text-[13px] text-gray-400 mt-1">
                                        PNG, JPG or SVG · up to 2MB · square image recommended
                                    </p>
                                </div>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/svg+xml"
                                    className="hidden"
                                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                                />
                            </div>
                        )}

                        {/* Error banner */}
                        {state === 'error' && error && (
                            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[13px] text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Selected state */}
                        {state === 'selected' && selected && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={selected.preview}
                                        alt="preview"
                                        className="w-16 h-16 rounded-md object-cover border border-gray-100 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-semibold text-gray-900 truncate">{selected.file.name}</p>
                                        <p className="text-[12.5px] text-gray-400 mt-0.5">{selected.size}</p>
                                        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                                            <div className="h-full bg-[#292382]/20 rounded-full w-full" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleReset}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Uploading state */}
                        {state === 'uploading' && selected && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={selected.preview}
                                        alt="preview"
                                        className="w-16 h-16 rounded-md object-cover border border-gray-100 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-semibold text-gray-900 truncate">{selected.file.name}</p>
                                        <p className="text-[12.5px] text-gray-400 mt-0.5">{selected.size}</p>
                                        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                                            <div
                                                className="h-full bg-[#292382] rounded-full transition-all duration-150"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-1">Uploading... {progress}%</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success state */}
                        {state === 'success' && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[15px] text-emerald-700">Logo uploaded successfully</p>
                                        <p className="text-[13px] text-emerald-600 mt-0.5">Your new school logo is now live across the dashboard.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="shrink-0 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                                >
                                    Upload a different logo
                                </button>
                            </div>
                        )}

                        {/* Action buttons */}
                        {state === 'selected' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleUpload}
                                    className="flex items-center gap-2 px-3 py-3 rounded-md bg-[#292382] hover:bg-[#3D36A8] text-white text-[14px] font-semibold transition-all shadow-sm shadow-[#292382]/20"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload logo
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 rounded-md border border-gray-200 bg-white text-[14px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {state === 'uploading' && (
                            <button
                                disabled
                                className="flex items-center gap-2 px-6 py-3 rounded-md bg-[#292382]/60 text-white text-[14px] font-semibold cursor-not-allowed"
                            >
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                            </button>
                        )}
                    </div>

                    {/* ── RIGHT — guidelines panel ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">

                        {/* Guidelines */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-4.5 h-4.5 text-[#1a1a3e]" />
                                <h2 className="font-semibold text-base text-[#1a1a3e]">Logo guidelines</h2>
                            </div>
                            <ul className="space-y-4">
                                {GUIDELINES.map((g, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-[13.5px] text-gray-600 leading-relaxed">{g.text}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100" />

                        {/* Where this shows up */}
                        <div>
                            <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                                Where this shows up
                            </p>
                            <div className="space-y-3">
                                {/* Sidebar wordmark */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-[#292382] text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg shrink-0">
                                        {logoForPreview ? (
                                            <img src={logoForPreview} alt="logo" className="w-5 h-5 rounded object-cover" />
                                        ) : (
                                            <ImageIcon className="w-4 h-4 opacity-50" />
                                        )}
                                        {school?.schoolName}
                                    </div>
                                    <p className="text-[13px] text-gray-400">Sidebar wordmark badge</p>
                                </div>

                                {/* Avatar */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                        {logoForPreview ? (
                                            <img src={logoForPreview} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-4 h-4 text-gray-300" />
                                        )}
                                    </div>
                                    <p className="text-[13px] text-gray-400">Top-right school avatar</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}