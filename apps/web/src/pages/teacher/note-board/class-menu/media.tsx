import { X, ImageOff, } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose, Tooltip, TooltipTrigger, Button, TooltipContent } from '@bluethub/ui-kit';

import PermMedia from "@/assets/svg/perm-media.svg?react";
import { onSetAction, setSelectedImage } from "@/store/class-action-slice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import type { IActiveMedia, IMedia } from '@/utils/constant';
import { fetchImageAsBlob, fetchMediaWithAuthFallback } from '@/utils/blob';
import { deleteImage, getImage, getImageSourceUrl } from '@/services/class-media';
import type { RootState } from '@/store';
import { useGlobalTimer } from '@/hooks/useGlobalTimer';
import { useSession } from '@/contexts/session-context';
// import { useAudioRecorder } from '@/hooks/useAudioRecorder';

const LESSON_MEDIA_CACHE = "bluethub-lesson-media";

const getRecordingElapsedMs = (timerElapsedSeconds: number): number => {
  const recordingStartTimerMs = parseInt(localStorage.getItem('recordingStartTimerMs') ?? '0', 10);
  return Math.max(0, Math.round(timerElapsedSeconds * 1000) - recordingStartTimerMs);
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
        // Load lesson media from sessionStorage (set by pre-class modal)
        const resolveMediaType = (mediaType: string, fileExtension: string): "video" | "pdf" | "image" => {
          const mt = (mediaType ?? '').toLowerCase();
          const ext = (fileExtension ?? '').toLowerCase().replace(/^\./, '');

          // Accept both logical labels (video/document) and MIME-like values.
          if (mt.includes('video') || ['mp4', 'webm', 'mov', 'm4v'].includes(ext)) {
            return 'video';
          }

          // Treat office documents as document-mode (rendered in frame via iframe fallback).
          if (
            mt.includes('pdf') ||
            mt.includes('document') ||
            ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)
          ) {
            return 'pdf';
          }

          return 'image';
        };

        let lessonMedia: IMedia[] = [];
        try {
          const raw = sessionStorage.getItem("activeLesson");
          if (raw) {
            const active = JSON.parse(raw);
            const dtos: any[] = active?.media ?? [];
            lessonMedia = dtos
              .filter((m) => m.cloudinaryUrl)
              .map((m) => ({
                id: m.id,
                name: m.originalFileName ?? m.fileName ?? m.id,
                type: resolveMediaType(m.mediaType, m.fileExtension),
                url: m.cloudinaryUrl,
              }));
          }
        } catch { /* ignore parse errors */ }

        // Use only media links from lesson info (no demo fallbacks).
        const loadedImages: IMedia[] = lessonMedia;

        setAvailableMedia(loadedImages);

        // Auto-cache anything not already in IndexedDB
        const cached = new Set<string>();

        await Promise.all(
          loadedImages.map(async (media) => {
            if (media.type === "pdf") {
              // PDFs can be rendered from source URL, but still warm Cache API if available.
              if (typeof window !== "undefined" && "caches" in window) {
                try {
                  const cache = await caches.open(LESSON_MEDIA_CACHE);
                  const existing = await cache.match(media.url);
                  if (!existing) {
                    const response = await fetchMediaWithAuthFallback(media.url);
                    if (response.ok) {
                      await cache.put(media.url, response.clone());
                    }
                  }
                } catch {
                  // Ignore cache API errors for PDF warmup.
                }
              }
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
              // Not in IDB — fetch and store silently
              try {
                await fetchImageAsBlob(media.url, media.id, media.type, media.name);
                cached.add(media.id);
              } catch {
                // IDB write/fetch can fail in some browsers/CORS paths; use Cache API fallback.
                try {
                  if (typeof window !== "undefined" && "caches" in window) {
                    const cache = await caches.open(LESSON_MEDIA_CACHE);
                    let response = await cache.match(media.url);
                    if (!response) {
                      const fetched = await fetchMediaWithAuthFallback(media.url);
                      if (fetched.ok) {
                        await cache.put(media.url, fetched.clone());
                        response = fetched;
                      }
                    }
                    if (response) {
                      cached.add(media.id);
                      return;
                    }
                  }
                } catch {
                  // Ignore and keep unavailable state.
                }
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
                {availableMedia.map((media) => (
                  <div
                    key={media.id}
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
