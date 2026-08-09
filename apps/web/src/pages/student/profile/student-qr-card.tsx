import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { Download, Loader2, Printer, RefreshCw } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { isStudentRoleData } from "@/contexts/auth-context";
import { attendanceService } from "@/services/attendance";
import { buildQrValue } from "@/utils/attendance";
import { localData } from "@/utils";

const QR_CACHE_PREFIX = "bluethub:attendance-qr:";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readTokenFromResponse(res: unknown): string {
  const root = res as any;
  const payload = root?.data ?? root?.Data ?? root ?? {};
  if (typeof payload === "string") return payload;
  return String(
    payload?.qrToken ??
      payload?.token ??
      payload?.QrToken ??
      payload?.value ??
      "",
  );
}

const StudentQrCard = () => {
  const { user } = useAuthContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [qrToken, setQrToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const studentId = useMemo(() => user?.id ?? "", [user?.id]);
  const fullName = useMemo(
    () => [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Student",
    [user],
  );
  const className = useMemo(() => {
    const rd = user?.roleData;
    if (rd && isStudentRoleData(rd)) return rd.classroom?.className ?? "";
    return "";
  }, [user]);

  const cacheKey = studentId ? `${QR_CACHE_PREFIX}${studentId}` : null;

  const fetchToken = async (silent = false) => {
    if (!studentId) return;
    if (!silent) setLoading(true);
    try {
      const res = await attendanceService.getMyQrToken();
      const token = readTokenFromResponse(res.data);
      if (token) {
        setQrToken(token);
        if (cacheKey) localData.save(cacheKey, token);
      } else {
        throw new Error("Empty token");
      }
    } catch (error) {
      // Offline or endpoint unavailable — fall back to the student id so the QR
      // stays print-ready. The scanner tolerates a raw id token.
      setQrToken(null);
      toast.error("Could not refresh QR token — using stored identity.");
      console.warn("[StudentQrCard] failed to fetch attendance token", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!studentId || !cacheKey) return;
    const cached = localData.retrieve<string>(cacheKey);
    if (cached) {
      setQrToken(cached);
      return;
    }
    void fetchToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const qrValue = useMemo(
    () => buildQrValue(studentId, qrToken),
    [studentId, qrToken],
  );

  const handleRefresh = () => {
    if (!studentId) return;
    void fetchToken().catch(() => undefined);
  };

  const openPrintWindow = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const win = window.open("", "_blank", "width=420,height=520");
    if (!win) {
      toast.error("Popup blocked — allow popups to print your QR.");
      return;
    }
    win.document.write(
      `<!doctype html><html><head><title>Attendance QR - ${escapeHtml(fullName)}</title>` +
        `<style>body{font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px;color:#0f172a}` +
        `h1{margin:14px 0 4px;font-size:20px}p{margin:4px 0;color:#475569;font-size:12px}` +
        `.qr{margin:0 auto}</style></head><body>` +
        `<div class="qr"><img src="${url}" width="240" height="240" alt="Attendance QR" /></div>` +
        `<h1>${escapeHtml(fullName)}</h1>` +
        `<p>${escapeHtml(className || "Bluethub")}</p>` +
        `<p style="margin-top:16px;font-size:11px;color:#94a3b8">Bluethub attendance QR — scan at your class to be marked present</p>` +
        `</body></html>`,
    );
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 400);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `attendance-qr-${studentId || "student"}.png`;
    a.click();
  };

  if (!user || !studentId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-400">
        Log in to see your attendance QR code.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Attendance QR</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Print this and paste it inside your locker — the teacher scans it to
            mark your presence.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 text-xs font-medium text-[#4255db] hover:underline disabled:opacity-50"
          title="Refresh QR token"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-xl border border-slate-100 bg-white">
          {loading && !qrToken ? (
            <div className="flex items-center justify-center w-[208px] h-[208px]">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <QRCodeCanvas
              ref={canvasRef}
              value={qrValue}
              size={208}
              level="M"
              includeMargin
              marginSize={2}
              className="rounded"
            />
          )}
        </div>

        <div className="text-center -mt-2">
          <p className="text-sm font-semibold text-slate-800 capitalize">{fullName}</p>
          {className && <p className="text-xs text-slate-500">{className}</p>}
        </div>

        <div className="flex w-full items-center gap-2">
          <button
            type="button"
            onClick={openPrintWindow}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#546cdb] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4255c9] disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Save image
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentQrCard;