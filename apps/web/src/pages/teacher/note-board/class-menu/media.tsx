import { X, ImageOff, } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose, Tooltip, TooltipTrigger, Button, TooltipContent } from '@bluethub/ui-kit';

import PermMedia from "@/assets/svg/perm-media.svg?react";
import { onSetAction, setSelectedImage } from "@/store/class-action-slice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import type { IActiveMedia, IMedia } from '@/utils/constant';
import { fetchImageAsBlob } from '@/utils/blob';
import { deleteImage, getImage, getImageSourceUrl } from '@/services/class-media';
import type { RootState } from '@/store';
import { useGlobalTimer } from '@/hooks/useGlobalTimer';
import { useSession } from '@/contexts/session-context';
// import { useAudioRecorder } from '@/hooks/useAudioRecorder';

const getRecordingElapsedMs = (timerElapsedSeconds: number): number => {
  const recordingStartTimerMs = parseInt(localStorage.getItem('recordingStartTimerMs') ?? '0', 10);
  return Math.max(0, Math.round(timerElapsedSeconds * 1000) - recordingStartTimerMs);
};

// List preferred PDFs in priority order. First one found in public/ wins.
const BOARD_PDF_CANDIDATES = ['/invoiceMar-v2.pdf', '/pdf.pdf'];

const resolveBoardPdfUrl = async (): Promise<string> => {
  for (const candidate of BOARD_PDF_CANDIDATES) {
    try {
      const response = await fetch(candidate, { method: 'HEAD' });
      if (response.ok) return candidate;
    } catch {
      // Try next candidate.
    }
  }

  return '/pdf.pdf';
};

const Media = () => {
  const [availableMedia, setAvailableMedia] = useState<IMedia[]>([]);
  const [cachedIds, setCachedIds] = useState<Set<string>>(new Set());
  const MediaTimesRef = useRef({ show: "", close: "" });
  // const { trackMediaInteraction } = useAudioRecorder();

  const selectedImage = useSelector((state: RootState) => state.action.selectedImage);
  const timerDisplay = useSelector((state: RootState) => state.action.timerDisplay);
  const timerElapsedSeconds = useSelector((state: RootState) => state.action.timerElapsedSeconds);

  useGlobalTimer({
    onTargetReached: () => {
      MediaTimesRef.current.show = ""
      MediaTimesRef.current.close = ""
    },
  });

  // Timer is controlled by ClassBottom Start/Pause button - not auto-started here
  const dispatch = useDispatch();
  const { sendMediaShow, sendMediaHide } = useSession();
  // ✅ Load media AND auto-cache to IndexedDB on mount
  useEffect(() => {
    const MediaLoader = async () => {
      try {
        const boardPdfUrl = await resolveBoardPdfUrl();

        // Derive the cache ID from the filename so switching the PDF file
        // automatically busts the old cached blob.
        const pdfFileName = boardPdfUrl.split('/').pop()?.replace(/\.pdf$/i, '') ?? 'pdf';
        const pdfCacheId = `pdf-${pdfFileName}`;

        // Evict any legacy fixed-id entry so it doesn't shadow the new file.
        await deleteImage('pdf-1').catch(() => undefined);

        const loadedImages: IMedia[] = [
          {
            id: "image01",
            name: "image01",
            type: "image",
            url: "https://cdn-jagbh.nitrocdn.com/TYVZHePxisufUuSiVWDElscksnaOxEbE/assets/images/source/rev-50b38d4/s39613.pcdn.co/wp-content/uploads/2019/11/Implementing-active-learning-and-student-centered-pedagogy.jpg",
          },
          {
            id: "video01",
            name: "video01",
            type: "video",
            url: "/video01.mp4",
          },
          {
            id: pdfCacheId,
            name: pdfFileName,
            type: "pdf",
            url: boardPdfUrl,
          },
        ];

        setAvailableMedia(loadedImages);

        // Auto-cache anything not already in IndexedDB
        const cached = new Set<string>();

        await Promise.all(
          loadedImages.map(async (media) => {
            if (media.type === "pdf") {
              // PDFs are loaded directly from public URL in the board frame.
              cached.add(media.id);
              return;
            }

            const cachedSourceUrl = await getImageSourceUrl(media.id);
            const sourceUrl = media.url;
            const existing = cachedSourceUrl === sourceUrl ? await getImage(media.id) : null;
            if (cachedSourceUrl !== sourceUrl) {
              // Source URL changed — evict stale blob so it re-fetches below.
              await deleteImage(media.id).catch(() => undefined);
            }
            if (existing) {
              // Already cached with matching source — just mark it
              cached.add(media.id);
            } else {
              // Not cached — fetch and store silently
              try {
                await fetchImageAsBlob(media.url, media.id, media.type, media.name);
                cached.add(media.id);
              } catch {
                console.warn(`Failed to pre-cache: ${media.name}`);
              }
            }
          })
        );

        setCachedIds(cached);
      } catch (error) {
        console.error("Failed to load media", error);
      }
    };

    MediaLoader();
  }, []);

  return (
    <div className={`font-poppins flex items-center justify-center py-2 cursor-pointer hover:bg-forestBlue`}>
      <Popover>
        <PopoverTrigger asChild>
          <div className="bg-none">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:bg-transparent cursor-pointer"
                  onClick={() => dispatch(onSetAction("media"))}
                >
                  <PermMedia className="size-6  text-forestBlue-light cursor-pointer" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>Media</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          className="w-52 p-0 ml-3 border border-gray-200 shadow-lg rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-500 to-blue-600">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <PermMedia className="w-5 h-5" />
              Media Library
            </h4>
            <PopoverClose className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
              <X className="w-5 h-5" />
            </PopoverClose>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {availableMedia.length > 0 ? (
              <div className="p-4 space-y-2">
                {availableMedia.map((media, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${!cachedIds.has(media.id)
                      ? 'bg-gray-50 border border-gray-200 cursor-not-allowed opacity-60'
                      : selectedImage?.id === media.id
                        ? 'bg-gray-100 border border-bLemon cursor-pointer'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 cursor-pointer'
                      }`}
                  >
                    {/* ✅ only this part selects */}
                    <div
                      className="flex-1"
                      onClick={() => {
                        if (!cachedIds.has(media.id)) return;

                        const elapsedMs = getRecordingElapsedMs(timerElapsedSeconds);

                        if (selectedImage?.id) {
                          sendMediaHide(selectedImage.id, timerDisplay, elapsedMs);
                        }

                        const mediaWithTime: IActiveMedia = {
                          ...media,
                          show: timerDisplay,
                          showMs: elapsedMs,
                          closed: null,
                        };
                        MediaTimesRef.current.show = timerDisplay;
                        dispatch(setSelectedImage(mediaWithTime));

                        sendMediaShow({
                          mediaId: media.id,
                          name: media.name,
                          mediaType: media.type,
                          url: media.url,
                          timerDisplay,
                          elapsedMs,
                        });
                        // trackMediaInteraction(mediaWithTime);  // ← record the interaction
                      }}
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {media.name || 'Untitled'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {media.type || 'Unknown type'}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ImageOff className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  No media yet
                </h3>
                <p className="text-xs text-gray-500">
                  Upload or record media to see it here
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Media;
