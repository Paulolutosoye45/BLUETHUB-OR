import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import toast from "react-hot-toast";
import { CameraOff, Loader2, ScanLine, X } from "lucide-react";

interface ScanEvent {
  decodedText: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Receives the raw decoded QR text. Return false to keep scanning, or the
   *  component keeps the stream alive (debounce handled internally). */
  onDetected: (event: ScanEvent) => void;
  scanningLabel?: string;
}

/**
 * Camera-based QR scanner built on html5-qrcode. Handles the full camera
 * lifecycle (permission, start/stop, cleanup) safely under React re-renders.
 */
const QrScannerModal = ({ open, onClose, onDetected, scanningLabel }: Props) => {
  const rawId = useId();
  const elementId = `qr-scanner-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const lastDecodeRef = useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const onDetectedRef = useRef(onDetected);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  });

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // camera already released — ignore
    } finally {
      scannerRef.current = null;
      startedRef.current = false;
    }
  };

  useEffect(() => {
    if (!open) {
      setError(null);
      setStarting(false);
      void stopScanner();
      return;
    }

    let cancelled = false;

    const start = async () => {
      if (startedRef.current) return;
      setStarting(true);
      setError(null);

      const scanner = new Html5Qrcode(elementId, {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      });
      scannerRef.current = scanner;

      try {
        const devices = await Html5Qrcode.getCameras();
        let cameraId: string | undefined;
        for (const device of devices) {
          if (/back|environment|rear/i.test(device.label)) {
            cameraId = device.id;
            break;
          }
        }
        const camera = cameraId ?? devices[0]?.id;
        if (!camera) {
          setError("No camera found on this device.");
          return;
        }

        await scanner.start(
          camera,
          {
            fps: 10,
            qrbox: (w: number, h: number) => {
              const size = Math.min(w, h) * 0.72;
              return { width: size, height: size };
            },
            aspectRatio: 1,
          },
          (decodedText, result) => {
            if (!result.result.format) return;
            const now = Date.now();
            if (
              decodedText === lastDecodeRef.current.text &&
              now - lastDecodeRef.current.at < 2000
            ) {
              return;
            }
            lastDecodeRef.current = { text: decodedText, at: now };
            onDetectedRef.current({ decodedText });
          },
          () => {
            // Scanning frame misses are normal — ignore.
          },
        );
        startedRef.current = true;
      } catch (err) {
        if (cancelled) return;
        const message = (err as Error)?.message ?? "Failed to start camera";
        if (/NotAllowed|Permission/i.test(message)) {
          setError("Camera permission denied. Allow camera access and try again.");
        } else if (/NotFound|No camera/i.test(message)) {
          setError("No camera was found on this device.");
        } else {
          setError(message);
        }
        toast.error("Could not start camera scanner.");
      } finally {
        setStarting(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      void stopScanner();
    };
  }, [open, elementId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/70 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ScanLine className="h-4 w-4 text-[#546cdb]" />
            Scan Student QR
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              stopScanner();
            }}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Close scanner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative overflow-hidden rounded-xl bg-slate-950">
            {/* html5-qrcode injects its own <video> into this slot.
                Never conditionally unmount this div — html5-qrcode reads
                document.getElementById(elementId).clientWidth during start(). */}
            <div id={elementId} className="qr-host min-h-[19rem] w-full" />

            {starting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                <p className="text-xs text-slate-500">Starting camera…</p>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <CameraOff className="h-10 w-10 text-red-400" />
                <p className="text-sm font-medium text-slate-700">{error}</p>
              </div>
            )}
          </div>

          <div className="px-4 py-3">
            <p className="text-center text-xs text-slate-400">
              {scanningLabel ?? "Hold a student QR code up to the camera."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrScannerModal;