import { useState, useRef, useEffect } from "react";

const BRAND = "#292382";

interface UploadItem {
  id: number;
  name: string;
  time: string;
  size: string;
  status: "Processing" | "Completed";
  fileType: "pdf" | "doc";
}

const recentUploads: UploadItem[] = [
  { id: 1, name: "Introduction to Cell Structure.Questi...", time: "2hours ago", size: "2.4MB", status: "Processing", fileType: "pdf" },
  { id: 2, name: "Cell Definition and its function_Question.Docs", time: "2hours ago", size: "2.4MB", status: "Processing", fileType: "doc" },
  { id: 3, name: "Cell Definition and its function_Question2.Docs", time: "2hours ago", size: "2.4MB", status: "Processing", fileType: "doc" },
  { id: 4, name: "Introduction to Cell Structure.Question.pdf", time: "2hours ago", size: "2.4MB", status: "Processing", fileType: "pdf" },
];

const viewAllItems: UploadItem[] = [
  { id: 1, name: "Introduction to Cell Structure.Question.pdf", time: "", size: "", status: "Processing", fileType: "pdf" },
  { id: 2, name: "Introduction to Cell Structure.Question.pdf", time: "", size: "", status: "Processing", fileType: "pdf" },
  { id: 3, name: "Introduction to Cell Structure.Question.pdf", time: "", size: "", status: "Processing", fileType: "pdf" },
  { id: 4, name: "Adaptions For Survival/ Evolutions", time: "", size: "", status: "Completed", fileType: "doc" },
  { id: 5, name: "Cell Definition and its function_Question2.Docs", time: "", size: "", status: "Completed", fileType: "doc" },
];

const PdfIcon = () => (
  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#fde8e8]">
        <svg className="w-5 h-5 text-[#e53e3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  </div>
);

const DocIcon = () => (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#e8eaf6]">
    <svg className="w-5 h-5 text-chestnut" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  </div>
);

interface threeProps { onReview: () => void; onEdit: () => void } 
const ThreeDotMenu= ({ onReview, onEdit }: threeProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="w-1 h-1 rounded-full bg-red-500 block" />
        <span className="w-1 h-1 rounded-full bg-red-500 block" />
        <span className="w-1 h-1 rounded-full bg-red-500 block" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => { onReview(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Review Question
          </button>
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit Question
          </button>
        </div>
      )}
    </div>
  );
};

const MyUploads = () => {
  const [search, setSearch] = useState("");

  return (
       <div className="p-6 font-poppins">
      <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">

      {/* ── Top Nav ──────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-30 bg-chestnut">
        <div className="flex items-center gap-2">
          {/* Avatar circle */}
          <div className="w-8 h-8 rounded-full bg-gray-400 overflow-hidden shrink-0 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
            </svg>
          </div>
          <button className="flex items-center gap-1.5 text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">My Uploads</span>
          </button>
        </div>
        <button className="text-white px-1">
          <svg className="w-1.5 h-5" fill="currentColor" viewBox="0 0 6 24">
            <circle cx="3" cy="3" r="2.5" />
            <circle cx="3" cy="12" r="2.5" />
            <circle cx="3" cy="21" r="2.5" />
          </svg>
        </button>
      </div>


      <div className="flex gap-5  p-8 bg-white/70 backdrop-blur-sm items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Uploads</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your class materials</p>
          </div>

          {/* Search */}
          <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search  files, lessons ......"
              className="flex-1 text-sm text-gray-600 placeholder-gray-400 outline-none bg-transparent"
            />
            <button className="text-gray-400 hover:text-gray-600 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </button>
          </div>

          {/* Storage Overview */}
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-gray-800">Storage Overview</p>
                <p className="text-xs text-gray-500 mt-0.5">3.04 GB used of 5 GB</p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-chestnut/15">
                <svg className="w-5 h-5 text-chestnut" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
            </div>

            {/* Multi-colour progress bar */}
            <div className="flex h-2.5 rounded-full overflow-hidden mb-2.5 bg-gray-200">
              <div style={{ width: "45%", backgroundColor: BRAND }} />
              <div style={{ width: "20%", backgroundColor: "#9b59b6" }} />
              <div style={{ width: "20%", backgroundColor: "#e74c3c" }} />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { color: BRAND,     label: "Documents(45%)" },
                { color: "#9b59b6", label: "PDF(20%)" },
                { color: "#e74c3c", label: "Images(20%)" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Uploads */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base font-bold text-gray-800">Recent Uploads</span>
              <svg className="w-5 h-5 text-chestnut" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="flex flex-col gap-2.5">
              {recentUploads.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-3 flex items-center gap-3 relative"
                >
                  {item.fileType === "pdf" ? <PdfIcon /> : <DocIcon />}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                    <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">{item.time}</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                        </svg>
                        <span className="text-xs text-gray-400">{item.size}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        <span className="text-xs text-yellow-600">{item.status}</span>
                      </div>
                    </div>
                  </div>

                    <ThreeDotMenu onReview={() => {}} onEdit={() => {}} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ──────────────────────────────────────── */}
        <div className="hidden md:flex flex-col gap-3 w-72 shrink-0">

          {/* View All header */}
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-base font-bold text-gray-800">View All</span>
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>

          {/* View All list */}
          <div className="flex flex-col gap-2.5">
            {viewAllItems.map((item) => {
              const isProcessing = item.status === "Processing";
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-3 flex items-center gap-3"
                >
                  {item.fileType === "pdf" ? <PdfIcon /> : <DocIcon />}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 leading-snug" style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    } as React.CSSProperties}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: isProcessing ? "#f59e0b" : "#22c55e" }}
                      />
                      <span className="text-xs" style={{ color: isProcessing ? "#b45309" : "#15803d" }}>
                        Status: {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Three-dot */}
                  <ThreeDotMenu onReview={() => {}} onEdit={() => {}} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MyUploads;