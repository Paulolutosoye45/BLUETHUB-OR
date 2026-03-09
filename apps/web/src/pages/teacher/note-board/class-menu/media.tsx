import { X, ImageOff, } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose, Tooltip, TooltipTrigger, Button, TooltipContent } from '@bluethub/ui-kit';

import PermMedia from "@/assets/svg/perm-media.svg?react";
import { onSetAction, setSelectedImage } from "@/store/class-action-slice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import type { IActiveMedia, IMedia } from '@/utils/constant';
import { fetchImageAsBlob } from '@/utils/blob';
import { getImage } from '@/services/class-media';
import type { RootState } from '@/store';
import { useGlobalTimer } from '@/hooks/useGlobalTimer';
// import { useAudioRecorder } from '@/hooks/useAudioRecorder';

const Media = () => {
  const [availableMedia, setAvailableMedia] = useState<IMedia[]>([]);
  const [cachedIds, setCachedIds] = useState<Set<string>>(new Set());
  const MediaTimesRef = useRef({ show: "", close: "" });
  // const { trackMediaInteraction } = useAudioRecorder();

  const selectedImage = useSelector((state: RootState) => state.action.selectedImage);
  const timerDisplay = useSelector((state: RootState) => state.action.timerDisplay);
  const isRunning = useSelector((state: RootState) => state.action.timerRunning);
  const pauseTime = useSelector((state: RootState) => state.action.pauseTime);


  // console.log(selectedImage)

  const timer = useGlobalTimer({
    onTargetReached: () => {
      MediaTimesRef.current.show = ""
      MediaTimesRef.current.close = ""
    },
  });

  useEffect(() => {
    timer.start()
  })

  // console.log(timer.displayTime)
  const dispatch = useDispatch();
  // ✅ Load media AND auto-cache to IndexedDB on mount
  useEffect(() => {
    const MediaLoader = async () => {
      try {
        const loadedImages: IMedia[] = [
          {
            id: "0d20e684-95d4-4ca6-9b81-da9a3e88eca9",
            name: "Nature Image 1",
            type: "image",
            url: "https://cdn-jagbh.nitrocdn.com/TYVZHePxisufUuSiVWDElscksnaOxEbE/assets/images/source/rev-50b38d4/s39613.pcdn.co/wp-content/uploads/2019/11/Implementing-active-learning-and-student-centered-pedagogy.jpg",
          },
          {
            id: "109b604f-c59e-473a-91f1-eb0fe9cceb0d",
            name: "Nature Image 2",
            type: "image",
            url: "https://source.unsplash.com/600x400/?forest",
          },
        ];

        setAvailableMedia(loadedImages);

        // Auto-cache anything not already in IndexedDB
        const cached = new Set<string>();

        await Promise.all(
          loadedImages.map(async (media) => {
            const existing = await getImage(media.id);
            if (existing) {
              // Already cached — just mark it
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
          className="w-70 p-0 ml-3 border border-gray-200 shadow-lg rounded-lg overflow-hidden"
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
                        if (!isRunning && !pauseTime) return;

                        const mediaWithTime: IActiveMedia = {
                          ...media,
                          show: timerDisplay,
                          closed: null,
                        };
                        MediaTimesRef.current.show = timerDisplay;
                        dispatch(setSelectedImage(mediaWithTime));
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

            {availableMedia.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                  View All Media
                </button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Media;
