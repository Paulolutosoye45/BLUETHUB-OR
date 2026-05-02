import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { X } from "lucide-react";
import { getImage } from "@/services/class-media";
import { useState, useEffect } from "react";
import * as React from "react";
import { clearSelectedImage } from "@/store/class-action-slice";
import { useSession } from "@/contexts/session-context";
import PdfScrollViewer from "@/component/pdf-scroll-viewer";

const getRecordingElapsedMs = (timerElapsedSeconds: number): number => {
  const recordingStartTimerMs = parseInt(localStorage.getItem('recordingStartTimerMs') ?? '0', 10);
  return Math.max(0, Math.round(timerElapsedSeconds * 1000) - recordingStartTimerMs);
};

const getFrameSizeByType = (type?: string): string => {
  const mediaType = (type ?? '').toLowerCase();

  if (mediaType === 'pdf') {
    return 'w-[min(94vw,980px)] h-[min(72vh,640px)]';
  }

  if (mediaType === 'video') {
    return 'w-[min(86vw,820px)] h-[min(58vh,500px)]';
  }

  return 'w-[min(80vw,720px)] h-[min(54vh,440px)]';
};

const MediaFrame = () => {
  const selectedImage = useSelector((state: RootState) => state.action.selectedImage);
  const timerDisplay  = useSelector((state: RootState) => state.action.timerDisplay);
  const timerElapsedSeconds = useSelector((state: RootState) => state.action.timerElapsedSeconds);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const dispatch = useDispatch();
  const { sendMediaHide, sendPdfPage, sendMediaScroll } = useSession();
  const frameSize = getFrameSizeByType(selectedImage?.type);

  // Load media URL from cache when selectedImage changes
  useEffect(() => {
    const loadMedia = async () => {
      if (selectedImage && selectedImage.id) {
        setIsLoading(true);
        try {
          const url = await getImage(selectedImage.id);
          setMediaUrl(url);
        } catch (error) {
          console.error("Failed to load media", error);
          setMediaUrl(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setMediaUrl(null);
      }
    };
    loadMedia();
  }, [selectedImage]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  if (!selectedImage?.id) return null;

  if (isLoading) {
    return (
      <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 bg-white rounded-lg shadow-lg p-4 z-40 ${frameSize} flex items-center justify-center border border-gray-200`}>
        <p className="text-gray-500">Loading media...</p>
      </div>
    );
  }

  const isPdf = selectedImage.type === "pdf";

  const handlePdfScrollRatio = (ratio: number) => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      if (selectedImage?.id) {
        const elapsedMs = getRecordingElapsedMs(timerElapsedSeconds);
        sendMediaScroll(selectedImage.id, Math.max(0, Math.min(1, ratio)), timerDisplay, elapsedMs);
      }
    }, 200);
  };

  return (
    <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 bg-white rounded-lg shadow-lg overflow-hidden z-40 border border-gray-200 flex flex-col ${frameSize}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5 flex items-center justify-between shrink-0">
        <h3 className="text-white font-semibold truncate text-sm flex-1">{selectedImage.name}</h3>
        <button
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          onClick={() => {
            if (selectedImage?.id) {
              sendMediaHide(selectedImage.id, timerDisplay, getRecordingElapsedMs(timerElapsedSeconds));
            }
            dispatch(clearSelectedImage());
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 relative overflow-hidden">
        {isPdf && mediaUrl ? (
          <PdfScrollViewer
            fileUrl={mediaUrl}
            mode="live"
            preferIframe={false}
            onPageChange={(page) => {
              if (!selectedImage?.id) return;
              const elapsedMs = getRecordingElapsedMs(timerElapsedSeconds);
              sendPdfPage(selectedImage.id, page, timerDisplay, elapsedMs);
            }}
            onScrollRatioChange={handlePdfScrollRatio}
          />
        ) : selectedImage.type === "image" && mediaUrl ? (
          <img
            src={mediaUrl}
            alt={selectedImage.name}
            className="w-full h-full object-contain"
          />
        ) : selectedImage.type === "video" && mediaUrl ? (
          <video
            src={mediaUrl}
            controls
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <p>Unable to display {selectedImage.type}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaFrame;
