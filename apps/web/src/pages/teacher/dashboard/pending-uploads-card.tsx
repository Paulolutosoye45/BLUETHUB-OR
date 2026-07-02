import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, AlertCircle, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAllSessions,
  getAudioChunksBySession,
  getStrokeBatchesBySession,
} from "@/utils/db";

interface UploadStats {
  totalSessions: number;
  totalPending: number;
  totalFailed: number;
  totalSizeBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

const PendingUploadsCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UploadStats>({
    totalSessions: 0,
    totalPending: 0,
    totalFailed: 0,
    totalSizeBytes: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const allSessions = await getAllSessions();

        // Filter sessions that need upload
        const pendingSessions = allSessions.filter(
          (s) => s.status !== "published" && (s.totalAudioChunks > 0 || s.totalStrokeBatches > 0)
        );

        let totalPending = 0;
        let totalFailed = 0;
        let totalSizeBytes = 0;

        for (const session of pendingSessions) {
          const audioChunks = await getAudioChunksBySession(session.id);
          const strokeBatches = await getStrokeBatchesBySession(session.id);

          totalPending += audioChunks.filter((c) => c.syncStatus === "pending").length;
          totalPending += strokeBatches.filter((b) => b.syncStatus === "pending").length;

          totalFailed += audioChunks.filter((c) => c.syncStatus === "failed").length;
          totalFailed += strokeBatches.filter((b) => b.syncStatus === "failed").length;

          totalSizeBytes += audioChunks.reduce((sum, c) => sum + c.sizeBytes, 0);
          totalSizeBytes += strokeBatches.reduce((sum, b) => sum + b.sizeBytes, 0);
        }

        setStats({
          totalSessions: pendingSessions.length,
          totalPending,
          totalFailed,
          totalSizeBytes,
        });
      } catch (err) {
        console.error("Failed to load pending upload stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const hasPending = stats.totalSessions > 0;
  const hasFailed = stats.totalFailed > 0;

  return (
    <div
      onClick={() => navigate("/teacher/pending-uploads")}
      className={cn(
        "rounded-lg border-2 p-2.5 cursor-pointer transition-all hover:shadow-md",
        hasFailed
          ? "border-red-200 bg-red-50/50 hover:border-red-300"
          : hasPending
          ? "border-amber-200 bg-amber-50/50 hover:border-amber-300"
          : "border-green-200 bg-green-50/50 hover:border-green-300"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              hasFailed
                ? "bg-red-100 text-red-600"
                : hasPending
                ? "bg-amber-100 text-amber-600"
                : "bg-green-100 text-green-600"
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : hasFailed ? (
              <AlertCircle className="w-5 h-5" />
            ) : hasPending ? (
              <Upload className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 text-xs">Pending Uploads</h4>
            {loading ? (
              <p className="text-[10px] text-gray-500">Loading...</p>
            ) : hasPending ? (
              <p className="text-[10px] text-gray-600">
                {stats.totalSessions} session{stats.totalSessions !== 1 ? "s" : ""} •{" "}
                {stats.totalPending} pending
                {hasFailed && (
                  <span className="text-red-600 font-medium"> • {stats.totalFailed} failed</span>
                )}
              </p>
            ) : (
              <p className="text-[10px] text-green-600">All uploads complete</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {hasPending && !loading && (
            <span className="text-[10px] text-gray-500 hidden sm:inline">
              {formatBytes(stats.totalSizeBytes)}
            </span>
          )}
          <ChevronRight
            className={cn(
              "w-4 h-4",
              hasFailed ? "text-red-400" : hasPending ? "text-amber-400" : "text-green-400"
            )}
          />
        </div>
      </div>

      {/* Progress indicator for pending */}
      {hasPending && !loading && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-white/80 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                hasFailed ? "bg-red-400" : "bg-amber-400"
              )}
              style={{
                width: `${Math.max(5, 100 - (stats.totalPending / (stats.totalPending + 1)) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[10px] font-medium text-gray-500">
            {hasFailed ? "Needs attention" : "Ready to upload"}
          </span>
        </div>
      )}
    </div>
  );
};

export default PendingUploadsCard;
